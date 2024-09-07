import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { v4 as uuidv4 } from 'uuid';

export interface ThreadOptions {
  enableCaching?: boolean;
  maxCacheSize?: number;
  cacheTTL?: number; // Time to live for cache entries in milliseconds
}

interface CacheEntry<T = any> {
  args: any[];
  result: T;
  timestamp: number;
}

export class Thread {
  private cache: Map<string, CacheEntry> = new Map();
  private enableCaching: boolean;
  private maxCacheSize: number;
  private cacheTTL: number;
  private worker: Worker | null = null;

  constructor(options: ThreadOptions = {}) {
    this.enableCaching = options.enableCaching ?? true;
    this.maxCacheSize = options.maxCacheSize ?? 100;
    this.cacheTTL = options.cacheTTL ?? 60000; // Default 1 minute
  }

  async exec<T>(fn: (...args: any[]) => T, ...args: any[]): Promise<T> {
    if (this.enableCaching) {
      const cacheKey = this.getCacheKey(fn, args);
      const cachedEntry = this.cache.get(cacheKey);
      if (cachedEntry && this.isCacheValid(cachedEntry)) {
        return cachedEntry.result as T;
      }
    }
  
    if (!this.worker) {
      this.worker = new Worker(__filename, {
        workerData: { type: 'worker' }
      });
    }
  
    return new Promise<T>((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker initialization failed'));
        return;
      }
  
      const messageId = uuidv4();
  
      const messageHandler = (message: any) => {
        if (message.id === messageId) {
          const result = message.result as T;
          if (this.enableCaching) {
            this.setCacheEntry(fn, args, result);
          }
          resolve(result);
          this.worker?.removeListener('message', messageHandler);
        }
      };
  
      const errorHandler = (error: Error) => {
        reject(error);
        this.worker?.removeListener('error', errorHandler);
      };
  
      this.worker.on('message', messageHandler);
      this.worker.on('error', errorHandler);
  
      const serializedFn = this.serializeFunction(fn);
      this.worker.postMessage({ id: messageId, fn: serializedFn, args });
    });
  }

  toggleCaching(enable: boolean): void {
    this.enableCaching = enable;
    if (!enable) {
      this.clearCache();
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  isCachingEnabled(): boolean {
    return this.enableCaching;
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  private getCacheKey(fn: Function, args: any[]): string {
    return `${fn.toString()}-${JSON.stringify(args)}`;
  }

  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.cacheTTL;
  }

  private setCacheEntry<T>(fn: Function, args: any[], result: T): void {
    const cacheKey = this.getCacheKey(fn, args);
    this.cache.set(cacheKey, { args, result, timestamp: Date.now() });

    if (this.cache.size > this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  private serializeFunction(fn: Function): string {
    return fn.toString();
  }
}

if (!isMainThread && workerData && workerData.type === 'worker') {
  parentPort!.on('message', async (message) => {
    const { id, fn, args } = message;
    try {
      const func = new Function(`return (${fn})`)();
      const result = await func(...args);
      parentPort!.postMessage({ id, result });
    } catch (error) {
      parentPort!.postMessage({ id, error: (error as Error).message });
    }
  });
}
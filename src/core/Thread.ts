import { WorkerWrapper } from './worker';

interface CacheEntry<T> {
  args: any[];
  result: T;
}

interface ThreadOptions {
  enableMemoization?: boolean;
}

export class Thread {
  private static cache: CacheEntry<any>[] = [];
  private static enableMemoization: boolean = true;

  static configure(options: ThreadOptions): void {
    Thread.enableMemoization = options.enableMemoization ?? true;
  }

  static async exec<T>(fn: (...args: any[]) => T, ...args: any[]): Promise<T> {
    if (Thread.enableMemoization) {
      const cachedEntry = Thread.cache.find(entry => Thread.areArgsEqual(entry.args, args));
      if (cachedEntry) {
        return cachedEntry.result;
      }
    }

    const worker = new WorkerWrapper();
    const result = await worker.run(fn, ...args);

    if (Thread.enableMemoization) {
      Thread.cache.push({ args, result });
    }

    return result;
  }

  private static areArgsEqual(args1: any[], args2: any[]): boolean {
    return JSON.stringify(args1) === JSON.stringify(args2);
  }
}
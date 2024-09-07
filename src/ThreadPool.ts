import { Thread, ThreadOptions } from './Thread';

export interface ThreadPoolOptions extends ThreadOptions {
  size: number;
}

type TaskFunction<T> = (...args: any[]) => T;

interface QueueTask<T> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
  fn: TaskFunction<T>;
  args: any[];
}

export class ThreadPool {
  private size: number;
  private threads: Thread[];
  private queue: QueueTask<any>[] = [];

  constructor(options: ThreadPoolOptions) {
    this.size = options.size;
    this.threads = Array.from({ length: this.size }, () => new Thread(options));
  }

  async exec<T>(fn: TaskFunction<T>, ...args: any[]): Promise<T> {
    const availableThread = this.threads.find(thread => !(thread as any).busy);

    if (availableThread) {
      (availableThread as any).busy = true;
      try {
        const result = await availableThread.exec(fn, ...args);
        return result;
      } finally {
        (availableThread as any).busy = false;
        this.processQueue();
      }
    } else {
      return new Promise<T>((resolve, reject) => {
        this.queue.push({ resolve, reject, fn, args });
      });
    }
  }

  toggleCaching(enable: boolean): void {
    this.threads.forEach(thread => thread.toggleCaching(enable));
  }

  clearCache(): void {
    this.threads.forEach(thread => thread.clearCache());
  }

  isCachingEnabled(): boolean {
    return this.threads[0]?.isCachingEnabled() ?? false;
  }

  terminate(): void {
    this.threads.forEach(thread => thread.terminate());
  }

  private processQueue(): void {
    if (this.queue.length > 0) {
      const nextTask = this.queue.shift();
      if (nextTask) {
        this.exec(nextTask.fn, ...nextTask.args)
          .then(nextTask.resolve)
          .catch(nextTask.reject);
      }
    }
  }
}
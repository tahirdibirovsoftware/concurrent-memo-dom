import { Thread, ThreadOptions } from './Thread';

export interface ThreadPoolOptions extends ThreadOptions {
  size: number;
}

interface BusyThread extends Thread {
  busy: boolean;
}

export class ThreadPool {
  private size: number;
  private threads: BusyThread[];
  private queue: Array<{ resolve: (value: any) => void, reject: (reason?: any) => void, fn: (...args: any[]) => any, args: any[] }> = [];

  constructor(options: ThreadPoolOptions) {
    this.size = options.size;
    this.threads = Array.from({ length: this.size }, () => {
      const thread = new Thread(options) as BusyThread;
      thread.busy = false;
      return thread;
    });
  }

  async exec<T>(fn: (...args: any[]) => T, ...args: any[]): Promise<T> {
    const availableThread = this.threads.find(thread => !thread.busy);

    if (availableThread) {
      availableThread.busy = true;
      try {
        const result = await availableThread.exec(fn, ...args);
        return result;
      } finally {
        availableThread.busy = false;
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
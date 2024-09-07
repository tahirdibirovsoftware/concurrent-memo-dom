import { Thread } from './Thread';
import { WorkerWrapper } from './WorkerWrapper';

export interface ThreadPoolOptions {
  size: number;
  enableMemoization?: boolean;
}

export class ThreadPool {
  private size: number;
  private workers: WorkerWrapper[];
  private queue: (() => void)[] = [];

  constructor(options: ThreadPoolOptions) {
    this.size = options.size;
    this.workers = Array.from({ length: this.size }, () => new WorkerWrapper());
    Thread.configure({ enableMemoization: options.enableMemoization });
  }

  async exec<T>(fn: (...args: any[]) => T, ...args: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
      const task = async () => {
        const worker = this.workers.pop();
        if (!worker) {
          throw new Error('No available workers in the pool');
        }

        try {
          const result = await Thread.exec(fn, ...args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.workers.push(worker);
          this.processQueue();
        }
      };

      if (this.workers.length > 0) {
        task();
      } else {
        this.queue.push(task);
      }
    });
  }

  private processQueue() {
    if (this.queue.length > 0 && this.workers.length > 0) {
      const task = this.queue.shift();
      task?.();
    }
  }
}
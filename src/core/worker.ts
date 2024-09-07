type WorkerFunction<T> = (...args: any[]) => T;

export class WorkerWrapper {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
  }

  async run<T>(fn: WorkerFunction<T>, ...args: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
      const messageHandler = (event: MessageEvent) => {
        this.worker.removeEventListener('message', messageHandler);
        this.worker.removeEventListener('error', errorHandler);
        resolve(event.data);
      };

      const errorHandler = (error: ErrorEvent) => {
        this.worker.removeEventListener('message', messageHandler);
        this.worker.removeEventListener('error', errorHandler);
        reject(error);
      };

      this.worker.addEventListener('message', messageHandler);
      this.worker.addEventListener('error', errorHandler);

      this.worker.postMessage({ fn: fn.toString(), args });
    });
  }
}

// This code will be in a separate worker.js file
declare function postMessage(message: any): void;
declare function addEventListener(type: 'message', listener: (event: MessageEvent) => void): void;

// Check if we're in a worker context
if (typeof self !== 'undefined' && typeof postMessage === 'function' && typeof addEventListener === 'function') {
  addEventListener('message', (event: MessageEvent) => {
    const { fn, args } = event.data as { fn: string, args: any[] };
    const func = new Function('return ' + fn)() as WorkerFunction<any>;

    // Ensure args is always an array
    const safeArgs = Array.isArray(args) ? args : [];

    const result = func(...safeArgs);
    postMessage(result);
  });
}
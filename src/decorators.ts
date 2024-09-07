import { Thread, ThreadOptions } from './Thread';
import { ThreadPool, ThreadPoolOptions } from './ThreadPool';

export function Threaded(options: ThreadOptions = {}) {
  const thread = new Thread(options);
  
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      return thread.exec(originalMethod, ...args);
    };

    return descriptor;
  };
}

export function ThreadPooled(options: ThreadPoolOptions) {
  const pool = new ThreadPool(options);
  
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      return pool.exec(originalMethod, ...args);
    };

    return descriptor;
  };
}
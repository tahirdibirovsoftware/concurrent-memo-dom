import { WorkerWrapper } from './worker';

interface CacheEntry<T> {
  fnString: string;
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
    const fnString = fn.toString();
    const safeArgs = Array.isArray(args[0]) ? args[0] : args;

    if (Thread.enableMemoization) {
      const cachedEntry = Thread.cache.find(entry =>
        entry.fnString === fnString && Thread.areArgsEqual(entry.args, safeArgs)
      ) as CacheEntry<T> | undefined;

      if (cachedEntry) {
        return cachedEntry.result;
      }
    }

    const worker = new WorkerWrapper();
    const result = await worker.run<T>(fnString, ...safeArgs);

    if (Thread.enableMemoization) {
      Thread.cache.push({ fnString, args: safeArgs, result });
    }

    return result;
  }

  private static areArgsEqual(args1: any[], args2: any[]): boolean {
    return JSON.stringify(args1) === JSON.stringify(args2);
  }
}
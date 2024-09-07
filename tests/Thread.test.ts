import { Thread } from '../src/Thread';

// Mock Web Worker
class WorkerMock {
  onmessage: ((event: MessageEvent) => void) | null = null;
  postMessage(data: any) {
    if (this.onmessage) {
      const result = eval(`(${data.fn})(${data.args.join(',')})`);
      this.onmessage({ data: { id: data.id, result } } as MessageEvent);
    }
  }
  addEventListener(type: string, listener: EventListener) {
    if (type === 'message') {
      this.onmessage = listener as (event: MessageEvent) => void;
    }
  }
  removeEventListener() {}
  terminate() {}
}

// Mock the global Worker constructor
(global as any).Worker = WorkerMock;

describe('Thread', () => {
  let thread: Thread;

  beforeEach(() => {
    thread = new Thread({ workerUrl: 'dummy-url' });
  });

  afterEach(() => {
    thread.terminate();
  });

  test('exec should execute a function', async () => {
    const result = await thread.exec((x: number, y: number) => x + y, 5, 3);
    expect(result).toBe(8);
  });

  test('caching should be enabled by default', () => {
    expect(thread.isCachingEnabled()).toBe(true);
  });

  test('toggleCaching should enable and disable caching', () => {
    thread.toggleCaching(false);
    expect(thread.isCachingEnabled()).toBe(false);
    thread.toggleCaching(true);
    expect(thread.isCachingEnabled()).toBe(true);
  });

  test('clearCache should clear the cache', async () => {
    const fn = jest.fn((x: number) => x * 2);
    await thread.exec(fn, 5);
    await thread.exec(fn, 5);
    expect(fn).toHaveBeenCalledTimes(1);

    thread.clearCache();

    await thread.exec(fn, 5);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('exec should use cached result when available', async () => {
    const fn = jest.fn((x: number) => x * 2);
    const result1 = await thread.exec(fn, 5);
    const result2 = await thread.exec(fn, 5);

    expect(result1).toBe(10);
    expect(result2).toBe(10);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
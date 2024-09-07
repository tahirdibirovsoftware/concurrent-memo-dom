import { ThreadPool } from '../src/ThreadPool';

describe('ThreadPool', () => {
  let pool: ThreadPool;

  beforeEach(() => {
    pool = new ThreadPool({ size: 2 });
  });

  afterEach(() => {
    pool.terminate();
  });

  test('exec should execute a function', async () => {
    const result = await pool.exec((x: number) => x * 2, 5);
    expect(result).toBe(10);
  });

  test('caching should be enabled by default', () => {
    expect(pool.isCachingEnabled()).toBe(true);
  });

  test('toggleCaching should enable and disable caching', () => {
    pool.toggleCaching(false);
    expect(pool.isCachingEnabled()).toBe(false);
    pool.toggleCaching(true);
    expect(pool.isCachingEnabled()).toBe(true);
  });

  test('clearCache should clear the cache', async () => {
    const fn = jest.fn((x: number) => x * 2);
    await pool.exec(fn, 5);
    await pool.exec(fn, 5);
    expect(fn).toHaveBeenCalledTimes(1);

    pool.clearCache();

    await pool.exec(fn, 5);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('exec should use cached result when available', async () => {
    const fn = jest.fn((x: number) => x * 2);
    const result1 = await pool.exec(fn, 5);
    const result2 = await pool.exec(fn, 5);

    expect(result1).toBe(10);
    expect(result2).toBe(10);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('pool should handle multiple tasks', async () => {
    const results = await Promise.all([
      pool.exec((x: number) => x * 2, 5),
      pool.exec((x: number) => x * 3, 5),
      pool.exec((x: number) => x * 4, 5),
    ]);

    expect(results).toEqual([10, 15, 20]);
  });
});
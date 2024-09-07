import { useCallback, useEffect, useRef } from 'react';
import { Thread, ThreadOptions } from './core/Thread';
import { ThreadPool, ThreadPoolOptions } from './core/ThreadPool';

export function useThread(options: ThreadOptions = {}) {
  const threadRef = useRef<Thread | null>(null);

  useEffect(() => {
    threadRef.current = new Thread(options);
    return () => {
      threadRef.current?.terminate();
    };
  }, []);

  const exec = useCallback(<T>(fn: (...args: any[]) => T, ...args: any[]): Promise<T> => {
    if (!threadRef.current) {
      throw new Error('Thread not initialized');
    }
    return threadRef.current.exec(fn, ...args);
  }, []);

  const toggleCaching = useCallback((enable: boolean) => {
    threadRef.current?.toggleCaching(enable);
  }, []);

  const clearCache = useCallback(() => {
    threadRef.current?.clearCache();
  }, []);

  const isCachingEnabled = useCallback(() => {
    return threadRef.current?.isCachingEnabled() ?? false;
  }, []);

  return { exec, toggleCaching, clearCache, isCachingEnabled };
}

export function useThreadPool(options: ThreadPoolOptions) {
  const poolRef = useRef<ThreadPool | null>(null);

  useEffect(() => {
    poolRef.current = new ThreadPool(options);
    return () => {
      poolRef.current?.terminate();
    };
  }, []);

  const exec = useCallback(<T>(fn: (...args: any[]) => T, ...args: any[]): Promise<T> => {
    if (!poolRef.current) {
      throw new Error('ThreadPool not initialized');
    }
    return poolRef.current.exec(fn, ...args);
  }, []);

  const toggleCaching = useCallback((enable: boolean) => {
    poolRef.current?.toggleCaching(enable);
  }, []);

  const clearCache = useCallback(() => {
    poolRef.current?.clearCache();
  }, []);

  const isCachingEnabled = useCallback(() => {
    return poolRef.current?.isCachingEnabled() ?? false;
  }, []);

  return { exec, toggleCaching, clearCache, isCachingEnabled };
}
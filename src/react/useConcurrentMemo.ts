import { useEffect, useState, useRef, DependencyList } from 'react';
import { Thread } from '../core/Thread';

export function useConcurrentMemo<T>(
    fn: (...args: any[]) => T,
    deps: DependencyList
): T | undefined {
    const [result, setResult] = useState<T>();
    const prevDepsRef = useRef<DependencyList>();

    useEffect(() => {
        const prevDeps = prevDepsRef.current;
        if (!prevDeps || deps.some((dep, i) => dep !== prevDeps[i])) {
            Thread.exec(fn).then(setResult);
        }
        prevDepsRef.current = deps;
    }, deps);

    return result;
}
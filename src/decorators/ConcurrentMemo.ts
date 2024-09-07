import { Thread } from '../core/Thread';

export function ConcurrentMemo() {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            return Thread.exec(originalMethod.bind(this), ...args);
        };

        return descriptor;
    };
}
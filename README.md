# ConcurrentMemoDOM

ConcurrentMemoDOM is a powerful TypeScript library that brings multi-threading and memoization to your web applications, including React projects. It allows you to effortlessly run CPU-intensive tasks in parallel and automatically cache expensive computations.

## Features

- 🚀 Multi-threading support using Web Workers
- 🧠 Automatic memoization of function results
- 🧵 Thread pool for efficient task distribution
- ⚛️ React hooks for easy integration with functional components
- 🏗️ Decorator support for class-based architectures
- 📦 Written in TypeScript for robust development

## Installation

```bash
npm install concurrent-memo-dom
```

## Usage

### Basic Usage

```typescript
import { Thread, ThreadPool } from 'concurrent-memo-dom';

// Using a single thread
const thread = new Thread();
const result = await thread.exec((x: number, y: number) => x + y, 5, 3);
console.log(result); // 8

// Using a thread pool
const pool = new ThreadPool({ size: 4 });
const results = await Promise.all([
  pool.exec((x: number) => x * 2, 5),
  pool.exec((x: number) => x * 3, 5),
  pool.exec((x: number) => x * 4, 5),
]);
console.log(results); // [10, 15, 20]
```

### React Hooks

```tsx
import React from 'react';
import { useThread, useThreadPool } from 'concurrent-memo-dom';

const MyComponent: React.FC = () => {
  const { exec } = useThread();
  const result = await exec((x: number, y: number) => x + y, 5, 3);
  
  return <div>{result}</div>;
};
```

### Decorators

```typescript
import { Threaded, ThreadPooled } from 'concurrent-memo-dom';

class MyClass {
  @Threaded()
  static async computeSingle(x: number, y: number): Promise<number> {
    return x + y;
  }

  @ThreadPooled({ size: 4 })
  static async computeMultiple(x: number): Promise<number[]> {
    return [x * 2, x * 3, x * 4, x * 5];
  }
}
```

## API Reference

### Thread

- `constructor(options?: ThreadOptions)`
- `exec<T>(fn: (...args: any[]) => T, ...args: any[]): Promise<T>`
- `toggleCaching(enable: boolean): void`
- `clearCache(): void`
- `isCachingEnabled(): boolean`
- `terminate(): void`

### ThreadPool

- `constructor(options: ThreadPoolOptions)`
- `exec<T>(fn: (...args: any[]) => T, ...args: any[]): Promise<T>`
- `toggleCaching(enable: boolean): void`
- `clearCache(): void`
- `isCachingEnabled(): boolean`
- `terminate(): void`

### Hooks

- `useThread(options?: ThreadOptions)`
- `useThreadPool(options: ThreadPoolOptions)`

### Decorators

- `@Threaded(options?: ThreadOptions)`
- `@ThreadPooled(options: ThreadPoolOptions)`

## Limitations

1. **Browser Support**: This library uses Web Workers, which are not supported in older browsers. Check browser compatibility before use.

2. **Function Serialization**: Functions passed to `exec` must be serializable. This means they can't close over variables from their outer scope.

3. **DOM Access**: Web Workers don't have access to the DOM. Functions that need to manipulate the DOM directly cannot be executed in threads.

4. **Shared State**: Each thread runs in its own isolated context. There's no shared state between threads, so all necessary data must be passed as arguments.

5. **Error Handling**: Errors in worker threads are serialized and passed back to the main thread. Some error information might be lost in this process.

6. **Performance Overhead**: For very quick operations, the overhead of creating a worker might outweigh the benefits of parallel execution.

7. **Memory Usage**: Each worker comes with its own memory overhead. Creating too many threads might lead to high memory usage.

## Best Practices

1. Use threads for CPU-intensive tasks that don't require DOM access.
2. Be mindful of the data size passed to threads. Large data transfers can impact performance.
3. Use the thread pool for better resource management when you need to run multiple parallel tasks.
4. Leverage memoization for expensive computations that are called frequently with the same arguments.
5. Always terminate threads and thread pools when they're no longer needed to free up resources.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
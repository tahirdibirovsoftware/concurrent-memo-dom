# ConcurrentMemoDOM

ConcurrentMemoDOM is a TypeScript library that brings multi-threading and memoization to your web applications, including React projects. It allows you to effortlessly run CPU-intensive tasks in parallel and automatically cache expensive computations.

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
const thread = new Thread({ workerUrl: '/path/to/worker.js' });
const result = await thread.exec((x: number, y: number) => x + y, 5, 3);
console.log(result); // 8

// Using a thread pool
const pool = new ThreadPool({ size: 4, workerUrl: '/path/to/worker.js' });
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
  const { exec } = useThread({ workerUrl: '/path/to/worker.js' });
  const result = await exec((x: number, y: number) => x + y, 5, 3);
  
  return <div>{result}</div>;
};
```

### Decorators

```typescript
import { Threaded, ThreadPooled } from 'concurrent-memo-dom';

class MyClass {
  @Threaded({ workerUrl: '/path/to/worker.js' })
  static async computeSingle(x: number, y: number): Promise<number> {
    return x + y;
  }

  @ThreadPooled({ size: 4, workerUrl: '/path/to/worker.js' })
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

## Important Notes

- This library uses Web Workers, which require a separate worker file. Make sure to specify the correct `workerUrl` in the options.
- Ensure your build process copies the worker file to the correct location in your output directory.
- Functions passed to `exec` must be serializable. They can't close over variables from their outer scope.

## Browser Compatibility

This library is designed for modern browsers that support Web Workers. Make sure to check browser compatibility before use.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
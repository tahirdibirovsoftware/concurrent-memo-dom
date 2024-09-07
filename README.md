# Concurrent Memo DOM

Concurrent Memo DOM is a browser library for offloading heavy computations to web workers, enabling concurrent execution and improving application performance. It includes memoization by default and supports React hooks and decorators for Angular or non-framework projects.

## Installation

```bash
npm install concurrent-memo-dom
```

## Usage

### Basic Usage with Thread

```typescript
import { Thread } from 'concurrent-memo-dom';

const heavyComputation = (a: number, b: number) => {
    // Simulating a heavy computation
    let result = 0;
    for (let i = 0; i < 1000000000; i++) {
        result += Math.sqrt(a * b);
    }
    return result;
};

async function main() {
    const result = await Thread.exec(heavyComputation, 2, 3);
    console.log('Computation result:', result);
}

main();
```

### Using with React Hooks

```typescript
import React from 'react';
import { useConcurrentMemo } from 'concurrent-memo-dom';

function HeavyComponent({ a, b }) {
    const result = useConcurrentMemo(() => {
        // Heavy computation here
        let sum = 0;
        for (let i = 0; i < 1000000000; i++) {
            sum += Math.sqrt(a * b);
        }
        return sum;
    }, [a, b]);

    return <div>Result: {result}</div>;
}
```

### Using with Decorators (Angular or non-framework)

```typescript
import { ConcurrentMemo } from 'concurrent-memo-dom';

class Calculator {
    @ConcurrentMemo()
    heavyComputation(a: number, b: number) {
        // Heavy computation here
        let result = 0;
        for (let i = 0; i < 1000000000; i++) {
            result += Math.sqrt(a * b);
        }
        return result;
    }
}

const calc = new Calculator();
calc.heavyComputation(2, 3).then(result => console.log('Result:', result));
```

## API

### `Thread`

- `static exec<T>(fn: (...args: any[]) => T, ...args: any[]): Promise<T>`: Executes the provided function in a web worker with the given arguments and returns a promise that resolves with the result.
- `static configure(options: { enableMemoization?: boolean }): void`: Configures the memoization behavior of the library.

### `ThreadPool`

- `constructor(options: { size: number, enableMemoization?: boolean })`: Creates a new thread pool with the specified size and optional memoization.
- `exec<T>(fn: (...args: any[]) => T, ...args: any[]): Promise<T>`: Executes the provided function in a web worker from the pool with the given arguments and returns a promise that resolves with the result.

### `useConcurrentMemo`

- `useConcurrentMemo<T>(fn: (...args: any[]) => T, deps: DependencyList): T | undefined`: React hook for memoized concurrent computations.

### `ConcurrentMemo`

- `@ConcurrentMemo()`: Decorator for creating memoized concurrent methods.

## Limitations

1. Function Serialization: The library serializes functions to pass them to web workers. This means that closures and references to outer scope variables won't work as expected. Ensure your functions are self-contained or only rely on passed arguments.

2. Data Cloning: Data passed to and from web workers is cloned using the structured clone algorithm. This means that functions, DOM nodes, and some types of objects (like those with circular references) cannot be passed directly.

3. Global State: Web workers run in a separate global scope, so they don't have access to the main thread's global variables or the DOM.

4. Browser Support: This library relies on Web Workers, which are supported in all modern browsers but not in older ones.

5. React Hooks: The `useConcurrentMemo` hook may not work as expected with non-serializable values in the dependency array.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
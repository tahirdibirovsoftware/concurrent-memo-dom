// Worker code
self.addEventListener('message', (event: MessageEvent) => {
  const { fnString, args } = event.data;
  let func;
  try {
    func = new Function('return ' + fnString)();
    if (typeof func !== 'function') {
      throw new Error('Parsed value is not a function');
    }
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    self.postMessage({ error: 'Failed to parse function: ' + errorMessage });
    return;
  }

  try {
    console.log('Executing function with args:', args);
    const result = func(...args);
    console.log('Function execution result:', result);
    self.postMessage({ result });
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Function execution failed:', error);
    self.postMessage({ error: 'Function execution failed: ' + errorMessage });
  }
});

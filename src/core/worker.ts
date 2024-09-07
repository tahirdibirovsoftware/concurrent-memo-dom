self.addEventListener('message', (event: MessageEvent) => {
  const { fnString, args } = event.data;
  let func;
  try {
    func = new Function('return ' + fnString)();
    if (typeof func !== 'function') {
      throw new Error('Parsed value is not a function');
    }
  } catch (error) {
    self.postMessage({ error: 'Failed to parse function' });
    return;
  }

  try {
    const result = func(...args);
    self.postMessage({ result });
  } catch (error) {
    self.postMessage({ error: 'Function execution failed' });
  }
});
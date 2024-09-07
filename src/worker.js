self.onmessage = async (event) => {
    const { id, fn, args } = event.data;
    try {
      const func = new Function(`return (${fn})`)();
      const result = await func(...args);
      self.postMessage({ id, result });
    } catch (error) {
      self.postMessage({ id, error: error.message });
    }
  };
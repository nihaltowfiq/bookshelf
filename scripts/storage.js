function storage(type = 'local') {
  const store = type === 'session' ? sessionStorage : localStorage;

  const setValue = (key, value) => {
    if (!key || !value) return;

    store.setItem(key, JSON.stringify(value));
  };

  const getValue = (key) => {
    if (!key) return;

    const item = store.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return null;
  };

  const removeValue = (key) => {
    if (!key) return;

    store.removeItem(key);
  };

  return {
    set: setValue,
    get: getValue,
    remove: removeValue,
  };
}

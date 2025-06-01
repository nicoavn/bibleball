import { useCallback, useState } from 'react';

export const GAME_STORAGE_KEY = 'game';

const useLocalStorage = () => {
  const [typesMap, setTypesMap] = useState({});

  const setValue = useCallback((key, value) => {
    localStorage.setItem(key, value);

    setTypesMap((prev) => {
      return {
        ...prev,
        [key]: typeof value,
      };
    });
  }, []);

  const getValue = useCallback((key, defaultValue = null) => {
    const value = localStorage.getItem(key);

    if (value === null) return defaultValue;

    switch (typesMap[key]) {
      case 'symbol':
      case 'function':
      case 'object':
      case 'boolean':
        return JSON.parse(value);
      case 'number':
        return Number(value);
      case 'bigint':
        return BigInt(value);
      case 'undefined':
      case 'string':
      default:
        return value;
    }
  }, [typesMap]);

  return {
    setValue,
    getValue,
  };
};

export default useLocalStorage;

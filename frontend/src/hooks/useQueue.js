import { useCallback, useState } from 'react';

const useQueue = () => {
  const [queue, setQueue] = useState([]);

  const enqueue = useCallback(
    (soundFn, atTheBeginning = false) => {
      setQueue((prev) => (atTheBeginning ? [soundFn, ...prev] : [...prev, soundFn]));
    },
    [setQueue]
  );

  const dequeue = useCallback(
    (callback) => {
      const el = queue.length ? queue.shift() : null;

      if (el !== null) {
        callback(el);
        setQueue([...queue]);
      }
    },
    [queue, setQueue]
  );

  const peek = useCallback(() => {
    return queue.length ? queue[0] : null;
  }, [queue]);

  return {
    enqueue,
    dequeue,
    peek,
    queue,
  };
};

export default useQueue;

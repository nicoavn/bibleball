import useSound from 'use-sound';
import { useEffect } from 'react';
import * as Sounds from '../sounds.js';
import useQueue from './useQueue.js';

const usePlayAsync = (soundSrc) => {
  const [play, { sound }] = useSound(soundSrc);

  return async () => {
    return new Promise((resolve) => {
      if (!sound) return resolve();
      sound.once('end', resolve);
      play();
    });
  };
};

const useSoundQueue = () => {
  const playBgStadium = usePlayAsync(Sounds.BgStadium);
  const playDouble = usePlayAsync(Sounds.Double);
  const playHit = usePlayAsync(Sounds.Hit);
  const playHomeRun = usePlayAsync(Sounds.HomeRun);
  const playOrganInningIntro = usePlayAsync(Sounds.OrganInningIntro);
  const playOrganProgress = usePlayAsync(Sounds.OrganProgress);
  const playOut = usePlayAsync(Sounds.Out);
  const playSwingMiss = usePlayAsync(Sounds.SwingMiss);
  const playSwingMiss2 = usePlayAsync(Sounds.SwingMiss2);
  const playTriple = usePlayAsync(Sounds.Triple);

  const { dequeue, enqueue, queue } = useQueue();

  useEffect(() => {
    dequeue(async (sound) => {
      await sound();
    });
  }, [queue]);

  return {
    enqueue,
    playBgStadium,
    playDouble,
    playHit,
    playHomeRun,
    playOrganInningIntro,
    playOrganProgress,
    playOut,
    playSwingMiss,
    playSwingMiss2,
    playTriple,
    queue,
  };
};

export default useSoundQueue;

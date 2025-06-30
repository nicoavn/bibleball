import { useCallback } from 'react';

import {
  EmptyBases,
  QUESTION_DIFFICULTY_EVENT_TYPE_MAP,
  TYPES_MOVEMENTS_MAP,
} from '../constants.js';
import { useAppContext } from '../Providers.jsx';

const useBaseRunners = () => {
  const { appState, setAppState } = useAppContext();

  const { runners } = appState;

  const setRunners = useCallback(
    (nextRunners) => {
      setAppState((currentAppState) => ({
        ...currentAppState,
        runners: nextRunners,
      }));
    },
    [setAppState]
  );

  const updateRunners = useCallback(
    (question, answer) => {
      if (!answer.is_correct) {
        return; // OUT
      }
      const evType = QUESTION_DIFFICULTY_EVENT_TYPE_MAP[question.difficulty];
      const movements = TYPES_MOVEMENTS_MAP[evType];
      if (movements > 3) {
        // HR
        setRunners([0, 0, 0, 1]);
        return;
      }

      // Moving base runners
      for (let i = 2; i >= 0; i--) {
        if (!runners[i]) continue;
        if (i + movements <= 3) {
          runners[i + movements] = 1;
        }
        runners[i] = 0;
      }
      runners[movements - 1] = 1; // Hitter movement
    },
    [runners, setRunners]
  );

  const clearScorer = useCallback(() => {
    const nextRunners = [...runners];
    nextRunners[3] = 0;
    setRunners(nextRunners);
  }, [runners]);

  const resetRunners = useCallback(() => setRunners([...EmptyBases]), []);

  return {
    firstBaseRunner: runners[0] > 0,
    secondBaseRunner: runners[1] > 0,
    thirdBaseRunner: runners[2] > 0,
    scorer: runners[3] > 0,
    clearScorer,
    resetRunners,
    updateRunners,
  };
};

export default useBaseRunners;

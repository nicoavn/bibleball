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

  console.log(appState ?? `undefined var: (appState)`);

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
      console.log('Step 1');
      if (!answer.is_correct) {
        return; // OUT
      }
      console.log('Step 2');
      const evType = QUESTION_DIFFICULTY_EVENT_TYPE_MAP[question.difficulty];
      const movements = TYPES_MOVEMENTS_MAP[evType];
      console.log('Step 3');
      if (movements > 3) {
        // HR
        setRunners([0, 0, 0, 1]);
        console.log('Step 4');
        return;
      }

      console.log('Step 5');
      // Moving base runners
      for (let i = 2; i >= 0; i--) {
        console.log('Step 6');
        if (!runners[i]) continue;
        console.log('Step 6.1');
        if (i + movements <= 3) {
          runners[i + movements] = 1;
        }
        console.log('Step 6.2');
        runners[i] = 0;
      }
      console.log('Step 7');
      runners[movements - 1] = 1; // Hitter movement
      console.log('Step 8');

      // TODO: Remove debug logging
      // eslint-disable-next-line no-console
      console.log(
        'runners inside',
        JSON.parse(JSON.stringify(runners ?? `undefined var: (runners)`))
      );
    },
    [runners, setRunners]
  );

  const clearScorer = useCallback(() => {
    const nextRunners = [...runners];
    nextRunners[3] = 0;
    setRunners(nextRunners);
  }, [runners]);

  const resetRunners = useCallback(() => setRunners([...EmptyBases]), []);

  // TODO: Remove debug logging
  // eslint-disable-next-line no-console
  console.log(
    'outside runners',
    JSON.parse(JSON.stringify(runners ?? `undefined var: (runners)`))
  );

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

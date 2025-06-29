import { useCallback, useState } from 'react';
import {
  QUESTION_DIFFICULTY_EVENT_TYPE_MAP,
  TYPES_MOVEMENTS_MAP,
} from '../constants.js';

const emptyBases = [0, 0, 0, 0];

const useBaseRunners = () => {
  const [runners, setRunners] = useState([...emptyBases]);

  // TODO: Remove debug logging

  console.log(
    'runners',
    JSON.parse(JSON.stringify(runners ?? `undefined var: (runners)`))
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
    },
    [runners]
  );

  const resetRunners = useCallback(() => setRunners([...emptyBases]), []);

  return {
    firstBaseRunner: runners[0] > 0,
    secondBaseRunner: runners[1] > 0,
    thirdBaseRunner: runners[2] > 0,
    scorer: runners[3] > 0,
    resetRunners,
    updateRunners,
  };
};

export default useBaseRunners;

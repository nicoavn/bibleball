import {useCallback, useState} from 'react';
import {
  QUESTION_DIFFICULTY_EVENT_TYPE_MAP,
  TYPES_MOVEMENTS_MAP,
} from '../constants.js';

const emptyBases = [0, 0, 0, 0];

const useBaseRunners = () => {
  const [runners, setRunners] = useState([...emptyBases]);

  const updateRunners = useCallback((question, answer) => {
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

  }, [runners]);

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

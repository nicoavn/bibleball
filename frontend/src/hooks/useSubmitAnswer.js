import { useCallback } from 'react'
import { API_URL } from '../constants.js'

const useSubmitAnswer = (gameId) => {
  const submitAnswer = useCallback(({
    answerId,
    memberId,
  }) => {

    const checkAnswer = async () => {
      const params = {
        answer_id: answerId,
        game_id: gameId,
        member_id: memberId,
      }
      await fetch(API_URL + 'check-answer?' + new URLSearchParams(params).toString())
    }

    checkAnswer();
  }, [gameId]);

  return {
    submitAnswer,
  };
};

export default useSubmitAnswer;

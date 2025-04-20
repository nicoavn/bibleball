import { useCallback, useState } from 'react'
import { API_URL } from '../constants.js'

const useSubmitAnswer = (gameId) => {
  const [result, setResult] = useState(null)
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
      const response = await fetch(API_URL + 'check-answer?' + new URLSearchParams(params).toString())
      setResult(await response.json())
    }

    checkAnswer();
  }, [gameId]);

  return {
    result,
    submitAnswer,
  };
};

export default useSubmitAnswer;

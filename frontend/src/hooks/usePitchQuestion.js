import { useCallback, useState } from 'react';
import { API_URL } from '../constants.js';

const usePitchQuestion = (gameId) => {
  const [question, setQuestion] = useState(null);

  const fetchQuestion = useCallback(async () => {
    if (!gameId) return;

    const params = {
      game_id: gameId,
    };
    const response = await fetch(
      API_URL + 'pitch?' + new URLSearchParams(params).toString());
    const pitch = await response.json();
    setQuestion(pitch);
  }, [gameId]);

  return {
    pitch: fetchQuestion,
    question,
    reset: () => setQuestion(null),
  };
};

export default usePitchQuestion;

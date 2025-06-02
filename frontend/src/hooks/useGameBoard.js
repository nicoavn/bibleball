import { useCallback, useEffect, useState } from 'react';
import { API_URL } from '../constants.js';

const useGameBoard = (gameId) => {
  const [game, setGame] = useState(null);
  const [nextHitter, setNextHitter] = useState(null);

  const fetchBoard = useCallback(async () => {
    if (!gameId) return;

    const params = {
      game_id: gameId,
    };
    const response = await fetch(
        API_URL + 'board?' + new URLSearchParams(params).toString());
    const gameBoard = await response.json();
    setGame(gameBoard.game);
    setNextHitter(gameBoard.next_hitter);
  }, [gameId]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  return {
    fetch: fetchBoard, game, nextHitter,
  };
};

export default useGameBoard;

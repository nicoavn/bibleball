import { useCallback, useEffect } from 'react';
import { API_URL } from '../constants.js';
import { useAppContext } from '../Providers.jsx';

const useGameBoard = (gameId) => {
  const { setAppState } = useAppContext();

  const fetchBoard = useCallback(async () => {
    if (!gameId) return;

    const params = {
      game_id: gameId,
    };
    const response = await fetch(
      API_URL + 'board?' + new URLSearchParams(params).toString()
    );
    const gameBoard = await response.json();
    setAppState((currentAppState) => ({
      ...currentAppState,
      game: gameBoard.game,
      nextHitter: gameBoard.next_hitter,
    }));
  }, [gameId, setAppState]);

  useEffect(() => {
    (async () => {
      await fetchBoard();
    })();
  }, [fetchBoard]);

  return {
    fetch: fetchBoard,
  };
};

export default useGameBoard;

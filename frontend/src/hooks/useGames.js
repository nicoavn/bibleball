import {useEffect, useState} from 'react';
import {API_URL} from '../constants.js';

const useGames = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [games, setGames] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    const response = fetch(API_URL + 'game');
    setGames(response.json() ?? []);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    games,
  };
};

export default useGames;

import { useCallback } from 'react';
import { API_URL } from '../constants.js';

const useSearchHitter = () => {
  const searchHitter = useCallback(async (hint) => {
    const response = fetch(
        API_URL + 'hitter/autocomplete?hint=' + encodeURIComponent(hint));
    return response.json() ?? [];
  }, []);

  return {
    searchHitter,
  };
};

export default useSearchHitter;

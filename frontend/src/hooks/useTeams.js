import {useEffect, useState} from 'react';
import {API_URL} from '../constants.js';

const useTeams = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [teams, setTeams] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    const response = fetch(API_URL + 'team');
    setTeams(response.json() ?? []);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    teams,
  };
};

export default useTeams;

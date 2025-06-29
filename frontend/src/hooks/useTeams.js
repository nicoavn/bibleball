import { useCallback, useEffect, useState } from 'react';
import { API_URL } from '../constants.js';

const useTeams = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [teams, setTeams] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    (async () => {
      const response = await fetch(API_URL + 'team');
      setTeams((await response.json().teams) ?? []);
      setIsLoading(false);
    })();
  }, []);

  const saveTeam = useCallback(async (savingTeam) => {
    setIsLoading(true);
    const response = await fetch(API_URL + 'team/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(savingTeam),
    });
    const addingTeam = (await response.json()) ?? [];
    setTeams((currentTeams) => {
      const nextTeams = [...(currentTeams ?? [])];
      const existingTeamIndex = nextTeams.findIndex((t) => t.id === addingTeam.id);
      if (existingTeamIndex < 0) {
        nextTeams.push(addingTeam);
      } else {
        nextTeams.splice(existingTeamIndex, 1, addingTeam);
      }
      return nextTeams;
    });
    setIsLoading(false);
    return addingTeam;
  }, []);

  return {
    isLoading,
    saveTeam,
    teams,
  };
};

export default useTeams;

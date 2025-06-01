import {useEffect, useState} from 'react';
import {API_URL} from '../constants.js';

const useTeamMembers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    const response = fetch(API_URL + 'member');
    setMembers(response.json() ?? []);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    members,
  };
};

export default useTeamMembers;

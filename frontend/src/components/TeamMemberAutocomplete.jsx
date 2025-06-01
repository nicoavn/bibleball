import React, { useRef, useState } from 'react';
import useTeamMembers from '../hooks/useTeamMembers.js';
import useSearchHitter from '../hooks/useSearchHitter.js';

const TeamMemberAutocomplete = () => {
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef(null);

  const { members } = useTeamMembers();
  const { searchHitter } = useSearchHitter();

  // Mock API call — replace this with your real API call
  const fetchResults = async (query) => {
    setIsLoading(true);
    try {
      const foundMembers = searchHitter(query);
      setResults(foundMembers ?? members);
    } catch (error) {
      console.error('API error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.length >= 2) {
      timeoutRef.current = setTimeout(() => {
        fetchResults(value);
      }, 2000); // debounce delay
    } else {
      setResults([]);
    }
  };

  return (
    <div style={{ position: 'relative', width: '300px' }}>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Type to search..."
        style={{ width: '100%', padding: '8px' }}
      />
      {isLoading && <div>Loading...</div>}
      {results.length > 0 && (
        <ul style={{
          listStyle: 'none',
          margin: 0,
          padding: '8px',
          border: '1px solid #ccc',
          borderTop: 'none',
          position: 'absolute',
          width: '100%',
          backgroundColor: 'white',
          zIndex: 1000,
        }}>
          {results.map((item, index) => (
            <li key={index} style={{ padding: '4px 0' }}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TeamMemberAutocomplete;

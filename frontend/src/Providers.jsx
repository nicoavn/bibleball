import React, { createContext, useContext, useState } from 'react';
import { EmptyBases, EmptyGame } from './constants.js';

const initialState = {
  forms: {
    newGameForm: {
      teams: [
        {
          name: 'Team 1',
          members: [
            // { ...EmptyMember },
            { name: 'Alvin', nickname: 'McGuire', jerseyNo: 13 },
          ],
        },
        {
          name: 'Team 2',
          members: [
            //{ ...EmptyMember },
            {
              name: 'Gabriel',
              nickname: 'Barry Gone',
              jerseyNo: 13,
            },
          ],
        },
      ],
    },
  },
  game: EmptyGame,
  nextHitter: null,
  runners: EmptyBases,
};

const AppContext = createContext(initialState);

export const AppContextProvider = ({ children }) => {
  const [appState, setAppState] = useState(initialState);

  // TODO: Remove debug logging

  console.log(
    'appState',
    JSON.parse(JSON.stringify(appState ?? `undefined var: (appState)`))
  );

  return (
    <AppContext.Provider value={{ appState, setAppState }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

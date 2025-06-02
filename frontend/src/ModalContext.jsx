import { createContext, useState } from 'react';

export const ModalContext = createContext({
  currentModal: null,
});

export const ModalKeys = {
  'NewGame': 'new-game',
  'LoadGame': 'load-game',
  'ManageTeams': 'manage-teams',
};

export const ModalProvider = ({ children }) => {
  const [currentModal, setCurrentModal] = useState(null);

  return (
      <ModalContext.Provider value={{ currentModal, setCurrentModal }}>
        {children}
      </ModalContext.Provider>
  );
};

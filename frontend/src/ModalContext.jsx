import { createContext, useCallback, useState } from 'react';

export const ModalContext = createContext({
  currentModal: null,
});

export const ModalKeys = {
  NewGame: 'new-game',
  LoadGame: 'load-game',
  ManageTeams: 'manage-teams',
};

export const ModalProvider = ({ children }) => {
  const [currentModal, setCurrentModal] = useState(null);

  const closeModal = useCallback(() => setCurrentModal(null), []);

  return (
    <ModalContext.Provider value={{ closeModal, currentModal, setCurrentModal }}>
      {children}
    </ModalContext.Provider>
  );
};

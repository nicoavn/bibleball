import Modal from '../Modal.jsx';
import NewGameForm from '../forms/NewGameForm.jsx';
import React, { useContext } from 'react';
import { ModalContext } from '../../ModalContext.jsx';
import { useAppContext } from '../../Providers.jsx';
import useTeams from '../../hooks/useTeams.js';
import useLocalStorage, { GAME_STORAGE_KEY } from '../../hooks/useLocalStorage.js';
import { EmptyGame } from '../../constants.js';

const removeEmptyMembers = (team) => {
  return {
    ...team,
    members: team.members.filter((member) => !!member.name.trim()),
  };
};

const NewGameModal = () => {
  const { appState, setAppState } = useAppContext();
  const { closeModal } = useContext(ModalContext);
  const { saveTeam } = useTeams();

  const { clearValue } = useLocalStorage();

  const onStartGame = async () => {
    const team1 = await saveTeam(
      removeEmptyMembers(appState.forms.newGameForm.teams[0])
    );
    const team2 = await saveTeam(
      removeEmptyMembers(appState.forms.newGameForm.teams[1])
    );

    setAppState((currentAppState) => ({
      ...currentAppState,
      game: {
        ...EmptyGame,
        team1: team1,
        team2: team2,
      },
    }));

    clearValue(GAME_STORAGE_KEY);
    closeModal();
  };

  const modalActions = [
    {
      action: () => closeModal(),
      isLeftAction: true,
      type: 'destructive',
      text: 'Cancelar',
    },
    {
      action: onStartGame,
      type: 'primary',
      text: 'Iniciar',
    },
  ];

  return (
    <Modal
      actions={modalActions}
      bodyContents={<NewGameForm />}
      modalHeading="Nuevo Partido"
    />
  );
};

export default NewGameModal;

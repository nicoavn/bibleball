import { useContext } from 'react';
import { ModalContext, ModalKeys } from '../ModalContext.jsx';

const useMenuActions = () => {
  const { setCurrentModal } = useContext(ModalContext);

  const actions = [
    {
      'text': 'Nuevo juego',
      'action': () => setCurrentModal(ModalKeys.NewGame),
    },
    {
      'text': 'Cargar juego',
      'action': () => setCurrentModal(ModalKeys.LoadGame),
    },
    {
      'text': 'Manejar equipos',
      'action': () => setCurrentModal(ModalKeys.ManageTeams),
    },
  ];
  return actions;
};

export default useMenuActions;

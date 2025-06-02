import Modal from '../Modal.jsx';
import NewGameForm from '../forms/NewGameForm.jsx';

const NewGameModal = () => {
  const modalActions = [
    {
      action: () => {
      },
      isLeftAction: true,
      type: 'destructive',
      text: 'Cancelar',
    },
    {
      action: () => {
      },
      type: 'secondary',
      text: 'Siguiente',
    },
  ];

  return (
      <Modal actions={modalActions} modalHeading={'Nuevo Partido'}
             bodyContents={<NewGameForm />} />
  );
};

export default NewGameModal;

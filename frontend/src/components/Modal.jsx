import React, { useContext, useRef } from 'react';
import IconClose from '../assets/icon-close.svg?react';
import useCloseOnOutsideClick from '../hooks/useCloseOnOutsideClick.js';
import { ModalContext } from '../ModalContext.jsx';

export const ActionTypes = {
  primary: 'primary',
  secondary: 'secondary',
  destructive: 'destructive',
  success: 'success',
};

export const classFromActionType = (type) => {
  switch (type) {
    case 'primary':
      return 'btn btn-primary';
    case 'destructive':
      return 'btn btn-destructive';
    case 'success':
      return 'btn btn-success';
    default:
    case 'secondary':
      return 'btn btn-secondary';
  }
};

const Modal = ({ actions, bodyContents, modalHeading }) => {
  const { closeModal } = useContext(ModalContext);

  const modalRef = useRef(null);

  useCloseOnOutsideClick(modalRef, () => closeModal());
  const { setCurrentModal } = useContext(ModalContext);

  const onCloseClick = () => {
    closeModal();
    setCurrentModal(null);
  };

  return (
    <div className="modal-container">
      <div className="modal" ref={modalRef}>
        <div className="modal-header">
          {modalHeading && <h3>{modalHeading}</h3>}
          <button className="plain close" onClick={onCloseClick}>
            <IconClose />
          </button>
        </div>
        <div className="modal-body">{bodyContents}</div>
        <div className="modal-footer">
          <div className="actions-left">
            {(actions || [])
              .filter((action) => action.isLeftAction)
              .map((action, index) => (
                <button
                  key={`${action.type}-${index}`}
                  className={`${classFromActionType(action.type)}`}
                  onClick={action.action}
                >
                  {action.text}
                </button>
              ))}
          </div>
          <div className="actions-right">
            {(actions || [])
              .filter((action) => !action.isLeftAction)
              .map((action, index) => (
                <button
                  key={`${action.type}-${index}`}
                  className={`${classFromActionType(action.type)}`}
                  onClick={action.action}
                >
                  {action.text}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

import React, { useRef } from 'react';
import IconKebab from '../assets/icon-kebab.svg?react';
import useCloseOnOutsideClick from '../hooks/useCloseOnOutsideClick.js';

const Menu = ({ actions }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = useRef(null);

  useCloseOnOutsideClick(menuRef, () => setIsOpen(false));

  const handleClick = (clickedActionIndex) => {
    setIsOpen(false);
    actions[clickedActionIndex].action();
  };

  return (
      <div className="menu" ref={menuRef}>
        <IconKebab className="icon-kebab" onClick={() => setIsOpen(!isOpen)} />

        {isOpen && (
            <div className="actions">
              {actions.map((action, index) => (
                  <button key={`action-${index}`}
                          className="plain"
                          onClick={() => handleClick(
                              index)}>{action.text}</button>
              ))}
            </div>
        )}
      </div>
  );
};

export default Menu;

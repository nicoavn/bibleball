import React, { useEffect, useRef } from 'react';
import IconKebab from '../assets/icon-kebab.svg?react';

const Menu = ({ actions }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClick = (clickedActionIndex) => {
    setIsOpen(false);
    actions[clickedActionIndex].action();
  }

  return (
    <div className="menu" ref={menuRef}>
      <IconKebab className="icon-kebab" onClick={() => setIsOpen(!isOpen)}/>

      {isOpen && (
        <div className="actions">
          {actions.map((action, index) => (
            <button onClick={() => handleClick(index)}>{action.name}</button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Menu;

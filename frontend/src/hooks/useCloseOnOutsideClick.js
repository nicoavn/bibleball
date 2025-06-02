import { useEffect } from 'react';

const useCloseOnOutsideClick = (componentRef, closeHandler) => {
  useEffect(() => {
    function handleClickOutside(event) {
      if (componentRef.current &&
          !componentRef.current.contains(event.target)) {
        closeHandler();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
};

export default useCloseOnOutsideClick;

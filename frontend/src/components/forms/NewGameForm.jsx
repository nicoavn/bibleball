import TeamForm from './TeamForm.jsx';
import { useState } from 'react';

const NewGameForm = () => {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <>
      <div className="tab-actions">
        <button
          className={'btn btn-secondary' + (tabIndex === 0 ? ' active' : '')}
          onClick={() => setTabIndex(0)}
        >
          Local
        </button>
        <button
          className={'btn btn-secondary' + (tabIndex === 1 ? ' active' : '')}
          onClick={() => setTabIndex(1)}
        >
          Visitante
        </button>
      </div>
      <div className="tab-container">
        {tabIndex === 0 && <TeamForm teamIndex={0} />}
        {tabIndex === 1 && <TeamForm teamIndex={1} />}
      </div>
    </>
  );
};

export default NewGameForm;

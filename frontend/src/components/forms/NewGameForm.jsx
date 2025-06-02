import TeamForm from './TeamForm.jsx';
import { useState } from 'react';

const NewGameForm = () => {
  const [tabIndex, setTabIndex] = useState(0);

  return (
      <>
        <div className="tab-actions">
          <button className="btn btn-secondary"
                  onClick={() => setTabIndex(0)}>Local
          </button>
          <button className="btn btn-secondary"
                  onClick={() => setTabIndex(1)}>Visitante
          </button>
        </div>
        <div className="tab-container">
          {tabIndex === 0 && (
              <TeamForm />
          )}
          {tabIndex === 1 && (
              <p>tab 1</p>
          )}
        </div>

      </>
  );
};

export default NewGameForm;

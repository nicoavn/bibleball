import React from 'react';
import useTeams from '../hooks/useTeams.js';

const TeamList = () => {
  const { teams } = useTeams();
  return (
    <table className="team-list">
      <thead>
      <tr>
        <th>Nombre</th>
        <th>Bandera</th>
        <th>Fecha creación</th>
      </tr>
      </thead>
      <tbody>
      {teams.map((team) => (
        <tr key={team.id}>
          <td>{team.name}</td>
          <td></td>
          <td></td>
        </tr>
      ))}
      </tbody>
    </table>
  );
};

export default TeamList;

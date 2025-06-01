import React from 'react';
import useGames from '../hooks/useGames.js';

const GameList = () => {
  const { games } = useGames();
  return (
    <table className="game-list">
      <thead>
      <tr>
        <th>Local</th>
        <th>Visitante</th>
        <th>Fecha</th>
        <th>Resultado</th>
      </tr>
      </thead>
      <tbody>
      {games.map((game) => (
        <tr key={game.id}>
          <td>{game.team1.name}</td>
          <td>{game.team2.name}</td>
          <td>{game.created}</td>
          <td></td>
        </tr>
      ))}
      <tr>
        <td colSpan={4}>
          <div>
            {JSON.stringify(games)}
          </div>
        </td>
      </tr>
      </tbody>
    </table>
  );
};

export default GameList;

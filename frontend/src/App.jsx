// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { useCallback, useEffect, useState } from 'react'

const API_URL = 'http://localhost:8000/game/'

function App() {
  const [game, setGame] = useState(null);
  const [packs, setPacks] = useState([]);
  const [selectedPack, setSelectedPack] = useState(null);

  const onStartGame = useCallback(() => {
    const fetchGame = async () => {
      const params = {
        pack_id: selectedPack.id,
      }
      const response = await fetch(API_URL + 'start?' + new URLSearchParams(params).toString());
      const game = await response.json();
      setGame(game);
    }
    fetchGame();
  }, [selectedPack]);

  const onPackSelect = useCallback((ev) => {
    setSelectedPack(
      packs.find((pack) => pack.id === ev.currentTarget.value)
    );
  }, [packs])

  useEffect(() => {
    const fetchPacks = async () => {
      const response = await fetch(API_URL + 'packs');
      const data = await response.json();
      const packs = data.packs ?? [];
      setPacks(packs);
      if (packs.length > 0) {
        setSelectedPack(packs[0]);
      }
    }
    fetchPacks();
  }, []);

  console.log(game);

  return (
    <>
      <h1>Bibleball</h1>

      {JSON.stringify(game, null, 2)}

      <div className="container-actions">
        <select name="pack" id="pack" onChange={onPackSelect}>
          {packs.map((pack) => (<option key={pack.id} value={pack.id}>{pack.name}</option>))}
        </select>


        <button onClick={onStartGame}>Start Game</button>
        <button>Get Next Hitter</button>
        <button>Pitch Question</button>
        <button>Answer</button>
        <button>Add Team</button>
        <button>Add Member</button>
      </div>
    </>
  )
}

export default App

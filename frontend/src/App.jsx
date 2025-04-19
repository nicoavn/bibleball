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
        game_id: 1, // TODO: Remove
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
      <div className="scoreboard">
        <div className="logo"></div>
        <div className="team-logos">
          <div className="logo1"></div>
          <div className="logo2"></div>
        </div>
        <div className="score-boxes">
          <div className="inning">
            <div className="score-box-heading">1</div>
            <div className="top score-box">01</div>
            <div className="bottom score-box">01</div>
          </div>
          <div className="inning">
            <div className="score-box-heading">2</div>
            <div className="top score-box">01</div>
            <div className="bottom score-box">00</div>
          </div>
          <div className="inning not-played">
            <div className="score-box-heading">3</div>
            <div className="top score-box">00</div>
            <div className="bottom score-box">00</div>
          </div>
          <div className="inning not-played">
            <div className="score-box-heading">4</div>
            <div className="top score-box">00</div>
            <div className="bottom score-box">00</div>
          </div>
          <div className="inning not-played">
            <div className="score-box-heading">5</div>
            <div className="top score-box">00</div>
            <div className="bottom score-box">00</div>
          </div>
          <div className="inning">
            <div className="score-box-heading">Carreras</div>
            <div className="top score-box">02</div>
            <div className="bottom score-box">01</div>
          </div>
          <div className="outs">
            <div className="score-box-heading">Outs</div>
            <div className="score-box">01</div>
          </div>
        </div>
      </div>

      <div className="field">
        <div className="wait-box wait-box-left">
          <div className="player team-1"></div>
          <div className="player team-1"></div>
        </div>
        <div className="wait-box wait-box-right">
          <div className="player team-2"></div>
          <div className="player team-2"></div>
        </div>

        <div className="player team-1 a-bat "></div>
        {/*<div className="player team-2 a-bat "></div>*/}
        {/*<div className="player team-1 running-base first"></div>*/}
        {/*<div className="player team-1 running-base second"></div>*/}
        {/*<div className="player team-1 running-base third"></div>*/}
        {/*<div className="player team-1 running-base scores"></div>*/}
      </div>

      <div className="container-actions">
        <select name="pack" id="pack" onChange={onPackSelect}>
          {packs.map((pack) => (<option key={pack.id} value={pack.id}>{pack.name}</option>))}
        </select>


        <button onClick={onStartGame}>Start Game</button>
        <button>Pitch Question</button>
      </div>
    </>
  )
}

export default App

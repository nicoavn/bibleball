import './App.css';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_URL, MAX_INNINGS } from './constants.js';
import useGameBoard from './hooks/useGameBoard.js';
import useLocalStorage, { GAME_STORAGE_KEY } from './hooks/useLocalStorage.js';
import usePitchQuestion from './hooks/usePitchQuestion.js';
import useSubmitAnswer from './hooks/useSubmitAnswer.js';
import useBaseRunners from './hooks/useBaseRunners.js';
import Menu from './components/Menu.jsx';
import useMenuActions from './hooks/useMenuActions.js';

function App() {
  const [packs, setPacks] = useState([]);
  const [selectedPack, setSelectedPack] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [inningsNumber, setInningsNumber] = useState(MAX_INNINGS);

  const {
    setValue,
    getValue,
  } = useLocalStorage();

  const gameId = getValue(GAME_STORAGE_KEY);

  const {
    fetch: fetchBoard,
    game,
    nextHitter,
  } = useGameBoard(gameId);

  const {
    pitch,
    question,
    reset: resetQuestion,
  } = usePitchQuestion(gameId);

  const {
    submitAnswer,
  } = useSubmitAnswer(gameId);

  const {
    firstBaseRunner,
    secondBaseRunner,
    thirdBaseRunner,
    scorer,
    resetRunners,
    updateRunners,
  } = useBaseRunners();

  const onStartGame = useCallback(() => {
    if (!selectedPack) {
      return;
    }

    const fetchGame = async () => {
      const params = {};

      if (gameId) {
        params['game_id'] = gameId;
      } else {
        params['innings_number'] = inningsNumber;
        params['pack_id'] = selectedPack.id;
      }

      const response = await fetch(
        API_URL + 'start?' + new URLSearchParams(params).toString());
      const game = await response.json();
      setValue(GAME_STORAGE_KEY, game.id);
    };

    fetchGame();
  }, [gameId, inningsNumber, selectedPack, setValue]);

  const onPlayingInningsSelect = useCallback((ev) => {
    setInningsNumber(ev.currentTarget.value);
  }, []);

  const onPackSelect = useCallback((ev) => {
    setSelectedPack(
      packs.find((pack) => pack.id === ev.currentTarget.value),
    );
  }, [packs]);

  const onPitchClick = useCallback(() => {
    if (question) return;
    pitch();
  }, [pitch, question]);

  const onSubmitAnswer = useCallback(async (selectedAnswer) => {
    await submitAnswer({
      answerId: selectedAnswer.id,
      memberId: nextHitter.id,
    });
    setSelectedAnswer(selectedAnswer);
    updateRunners(question, selectedAnswer);
  }, [nextHitter, question, submitAnswer, updateRunners]);

  const onNextTurn = useCallback(async () => {
    resetQuestion();
    setSelectedAnswer(null);
    await fetchBoard();
  }, [fetchBoard, resetQuestion]);

  useEffect(() => {
    const fetchPacks = async () => {
      const response = await fetch(API_URL + 'pack');
      const data = await response.json();
      const packs = data.packs ?? [];
      setPacks(packs);
      if (packs.length > 0) {
        setSelectedPack(packs[0]);
      }
    };
    fetchPacks();
  }, []);

  const {
    isTop,
    runs_team1,
    runs_team2,
    outs,
  } = useMemo(() => {
    let runs_team1 = 0;
    let runs_team2 = 0;
    let outs = 0;
    let isTop = false;

    (game?.innings ?? []).forEach((inning) => {
      runs_team1 += inning.careers_team1;
      runs_team2 += inning.careers_team2;

      if (inning.outs_team1 > 0 && inning.outs_team1 < 3) {
        outs = inning.outs_team1;
        isTop = true;
      } else if (inning.outs_team2 > 0 && inning.outs_team2 < 3) {
        outs = inning.outs_team2;
      } else {
        outs = 0;
      }
    });

    return {
      isTop,
      runs_team1,
      runs_team2,
      outs,
    };
  }, [game]);

  const battingTeam = isTop ? 'team-1' : 'team-2';

  useEffect(() => {
    resetRunners();
  }, [isTop, resetRunners]);

  const actions = useMenuActions();

  return (
    <>
      <div className="top-bar">
        <Menu actions={actions}/>
      </div>

      <div className="scoreboard">
        <div className="logo"></div>
        <div className="team-logos">
          <div className="logo1"></div>
          <div className="logo2"></div>
        </div>
        <div className="score-boxes">
          {(game?.innings ?? []).map(inning => (
            <div key={inning.id}
                 className={'inning' + (inning.played ? ' played' : '')}>
              <div className="score-box-heading">{inning.number}</div>
              <div
                className="top score-box">{`${inning.careers_team1}`.padStart(
                2, '0')}</div>
              <div
                className="bottom score-box">{`${inning.careers_team2}`.padStart(
                2, '0')}</div>
            </div>
          ))}

          {game && (
            <>
              <div className="inning">
                <div className="score-box-heading">Carreras</div>
                <div className="top score-box">{runs_team1}</div>
                <div className="bottom score-box">{runs_team2}</div>
              </div>
              <div className="outs">
                <div className="score-box-heading">Outs</div>
                <div className="score-box">{outs}</div>
              </div>
            </>
          )}


        </div>
      </div>

      {!!question && (
        <div className="question-modal">
          <div className="question-text">
            {question.question}
          </div>
          <div className="answers">
            {question.answers.map((answer) => (
              <button
                className={
                  (answer.is_correct ? 'correct' : '') +
                  (answer.id === selectedAnswer?.id
                    ? ' selected'
                    : '')
                }
                key={answer.id}
                onClick={() => onSubmitAnswer(answer)}
              >{answer.answer}</button>
            ))}
          </div>
          <div className="action-continue">
            {!!selectedAnswer && (
              <button className="btn-continue" onClick={onNextTurn}>
                Continuar
              </button>
            )}
          </div>
        </div>
      )}

      <div className="field-container">
        <div className="team-box team-1">
          <h3>{game?.team1?.name}</h3>

          <ol>
            {
              (game?.team1?.members ?? []).map(member => (
                <li key={member.id}
                    className={member.id === nextHitter.id
                      ? 'current-hitter'
                      : ''}>
                  {`[${member.jersey_no}] ${member.name} (${member.nickname})`}
                  {member.id === nextHitter.id && (
                    <span>Al bate</span>)}
                </li>
              ))
            }
          </ol>
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

          {!!nextHitter && (
            <div className={`player at-bat ${battingTeam}`}></div>
          )}

          {!!firstBaseRunner && (
            <div
              className={`player running-base first ${battingTeam}`}></div>
          )}

          {!!secondBaseRunner && (
            <div
              className={`player running-base second ${battingTeam}`}></div>
          )}

          {!!thirdBaseRunner && (
            <div
              className={`player running-base third ${battingTeam}`}></div>
          )}

          {!!scorer && (
            <div
              className={`player running-base scores ${battingTeam}`}></div>
          )}

          <div className="container-actions">
            {!game && (
              <>
                <select name="pack" id="pack" onChange={onPackSelect}>
                  {packs.map((pack) => (
                    <option key={pack.id}
                            value={pack.id}>{pack.name}</option>))}
                </select>
                <select name="innings" id="innings"
                        onChange={onPlayingInningsSelect}>
                  {[...Array(MAX_INNINGS + 1).keys()].slice(1).
                    reverse().
                    map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                </select>
                <button onClick={onStartGame}>Iniciar Partido</button>
              </>
            )}
            {
              !!game && (
                <button onClick={onPitchClick}
                        className="btn-pitch">¡Lanzar!</button>
              )
            }
          </div>
        </div>

        <div className="team-box team-2">
          <h3>{game?.team2?.name}</h3>

          <ol>
            {
              (game?.team2?.members ?? []).map(member => (
                <li key={member.id}
                    className={member.id === nextHitter.id
                      ? 'current-hitter'
                      : ''}>
                  {`[${member.jersey_no}] ${member.name} (${member.nickname})`}
                  {member.id === nextHitter.id && (
                    <span>Al bate</span>)}
                </li>
              ))
            }
          </ol>
        </div>
      </div>
    </>
  );
}

export default App;

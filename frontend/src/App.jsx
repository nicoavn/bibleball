import './App.css';

import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  API_URL,
  EVENT_TYPE_LABEL_MAP,
  EventType,
  MAX_INNINGS,
  QUESTION_DIFFICULTY_EVENT_TYPE_MAP,
} from './constants.js';
import useGameBoard from './hooks/useGameBoard.js';
import useLocalStorage, { GAME_STORAGE_KEY } from './hooks/useLocalStorage.js';
import usePitchQuestion from './hooks/usePitchQuestion.js';
import useSubmitAnswer from './hooks/useSubmitAnswer.js';
import useBaseRunners from './hooks/useBaseRunners.js';
import Menu from './components/Menu.jsx';
import useMenuActions from './hooks/useMenuActions.js';
import NewGameModal from './components/modals/NewGameModal.jsx';
import { ModalContext, ModalKeys } from './ModalContext.jsx';
import { useAppContext } from './Providers.jsx';
import { shuffleArray } from './helpers.js';

function App() {
  const [packs, setPacks] = useState([]);
  const [selectedPack, setSelectedPack] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const { currentModal } = useContext(ModalContext);
  const { appState, setAppState } = useAppContext();
  const [inningsNumber, setInningsNumber] = useState(MAX_INNINGS);

  const { setValue, getValue } = useLocalStorage();

  const gameId = getValue(GAME_STORAGE_KEY);

  const { fetch: fetchBoard, game: freshGame, nextHitter } = useGameBoard(gameId);

  const { game } = appState ?? {};

  useEffect(() => {
    setAppState((currentState) => ({
      ...currentState,
      game: freshGame,
    }));
  }, [freshGame]);

  const { pitch, question, reset: resetQuestion } = usePitchQuestion(gameId);

  // TODO: Remove debug logging
  // eslint-disable-next-line no-console
  console.log(
    'selectedAnswer',
    JSON.parse(JSON.stringify(selectedAnswer ?? `undefined var: (selectedAnswer)`))
  );

  // TODO: Remove debug logging
  // eslint-disable-next-line no-console
  console.log(
    'question',
    JSON.parse(JSON.stringify(question ?? `undefined var: (question)`))
  );

  const { submitAnswer } = useSubmitAnswer(gameId);

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

        if (appState.game.team1.id) {
          params['id_team_1'] = appState.game.team1.id;
        }

        if (appState.game.team2.id) {
          params['id_team_2'] = appState.game.team2.id;
        }
      }

      const response = await fetch(
        API_URL + 'start?' + new URLSearchParams(params).toString()
      );
      const game = await response.json();
      setValue(GAME_STORAGE_KEY, game.id);
    };

    fetchGame();
  }, [appState, gameId, inningsNumber, selectedPack, setValue]);

  const onPlayingInningsSelect = useCallback((ev) => {
    setInningsNumber(ev.currentTarget.value);
  }, []);

  const onPackSelect = useCallback(
    (ev) => {
      setSelectedPack(packs.find((pack) => pack.id === ev.currentTarget.value));
    },
    [packs]
  );

  const onPitchClick = useCallback(() => {
    if (question) return;
    pitch();
  }, [pitch, question]);

  const onSubmitAnswer = useCallback(
    async (selectedAnswer) => {
      await submitAnswer({
        answerId: selectedAnswer.id,
        memberId: nextHitter?.id,
      });
      setSelectedAnswer(selectedAnswer);
      updateRunners(question, selectedAnswer);
    },
    [nextHitter, question, submitAnswer, updateRunners]
  );

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

  const { isTop, runs_team1, runs_team2, outs } = useMemo(() => {
    let runs_team1 = 0;
    let runs_team2 = 0;
    let outs = 0;
    let isTop = true;

    (game?.innings ?? [])
      .filter((inning) => inning.played)
      .forEach((inning) => {
        runs_team1 += inning.careers_team1;
        runs_team2 += inning.careers_team2;

        if (inning.outs_team1 < 3) {
          outs = inning.outs_team1;
          isTop = true;
        } else {
          outs = inning.outs_team2;
          isTop = false;
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
    console.log('resetting :)');
    resetRunners();
  }, [isTop, resetRunners]);

  // TODO: Remove debug logging
  // eslint-disable-next-line no-console
  console.log('isTop', JSON.parse(JSON.stringify(isTop ?? `undefined var: (isTop)`)));

  const actions = useMenuActions();

  const shuffledAnswers = useMemo(() => {
    return shuffleArray(question?.answers ?? []);
  }, [question]);

  const turnResult = useMemo(() => {
    if (!selectedAnswer) {
      return null;
    }

    if (selectedAnswer.is_correct) {
      return EVENT_TYPE_LABEL_MAP[
        QUESTION_DIFFICULTY_EVENT_TYPE_MAP[question.difficulty]
      ];
    }
    return EVENT_TYPE_LABEL_MAP[EventType.OUT];
  }, [question, selectedAnswer]);

  return (
    <>
      <div className="top-bar">
        <Menu actions={actions} />
      </div>

      <div className="scoreboard">
        <div className="logo"></div>
        <div className="team-logos">
          <div className="logo1"></div>
          <div className="logo2"></div>
        </div>
        <div className="score-boxes">
          {(game?.innings ?? []).map((inning) => (
            <div
              key={inning.id}
              className={'inning' + (inning.played ? ' played' : '')}
            >
              <div className="score-box-heading">{inning.number}</div>
              <div className="top score-box">
                {`${inning.careers_team1}`.padStart(2, '0')}
              </div>
              <div className="bottom score-box">
                {`${inning.careers_team2}`.padStart(2, '0')}
              </div>
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
          <div className="question-text">{question.question}</div>
          <div className="turn-result">{turnResult ?? '-'}</div>
          <div className="answers">
            {shuffledAnswers.map((answer) => (
              <button
                className={
                  (answer.is_correct ? 'correct' : '') +
                  (!!selectedAnswer ? ' reveal' : '') +
                  (answer.id === selectedAnswer?.id ? ' selected' : '')
                }
                disabled={selectedAnswer !== null}
                key={answer.id}
                onClick={() => onSubmitAnswer(answer)}
              >
                {answer.answer}
              </button>
            ))}
          </div>
          <div className="action-continue">
            {!!selectedAnswer && (
              <button className="plain btn-continue" onClick={onNextTurn}>
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
            {(game?.team1?.members ?? []).map((member) => (
              <li
                key={member.id}
                className={member.id === nextHitter?.id ? 'current-hitter' : ''}
              >
                {`[${member.jersey_no}] ${member.name} (${member.nickname})`}
                {member.id === nextHitter?.id && <span>Al bate</span>}
              </li>
            ))}
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

          {!!nextHitter && <div className={`player at-bat ${battingTeam}`}></div>}

          {!!firstBaseRunner && (
            <div className={`player running-base first ${battingTeam}`}></div>
          )}

          {!!secondBaseRunner && (
            <div className={`player running-base second ${battingTeam}`}></div>
          )}

          {!!thirdBaseRunner && (
            <div className={`player running-base third ${battingTeam}`}></div>
          )}

          {!!scorer && (
            <div className={`player running-base scores ${battingTeam}`}></div>
          )}

          <div className="container-actions">
            {!game?.id && (
              <>
                <select name="pack" id="pack" onChange={onPackSelect}>
                  {packs.map((pack) => (
                    <option key={pack.id} value={pack.id}>
                      {pack.name}
                    </option>
                  ))}
                </select>
                <select name="innings" id="innings" onChange={onPlayingInningsSelect}>
                  {[...Array(MAX_INNINGS + 1).keys()]
                    .slice(1)
                    .reverse()
                    .map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                </select>
                <button onClick={onStartGame}>Iniciar Partido</button>
              </>
            )}
            {!!game?.id && (
              <button onClick={onPitchClick} className="btn-pitch">
                ¡Lanzar!
              </button>
            )}
          </div>
        </div>

        <div className="team-box team-2">
          <h3>{game?.team2?.name}</h3>

          <ol>
            {(game?.team2?.members ?? []).map((member) => (
              <li
                key={member.id}
                className={member.id === nextHitter?.id ? 'current-hitter' : ''}
              >
                {`[${member.jersey_no}] ${member.name} (${member.nickname})`}
                {member.id === nextHitter?.id && <span>Al bate</span>}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {currentModal === ModalKeys.NewGame && <NewGameModal />}
    </>
  );
}

export default App;

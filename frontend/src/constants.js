export const API_URL = 'http://localhost:8000/game/';
export const MAX_INNINGS = 5;

export const Difficulty = {
  SINGLE: 'SG',
  DOUBLE: 'DB',
  TRIPLE: 'TP',
  HOME_RUN: 'HR',
};

export const EventType = {
  H1: 'H1',
  H2: 'H2',
  H3: 'H3',
  H4: 'H4',
  OUT: 'OUT',
};

export const QUESTION_DIFFICULTY_EVENT_TYPE_MAP = {
  [Difficulty.SINGLE]: EventType.H1,
  [Difficulty.DOUBLE]: EventType.H2,
  [Difficulty.TRIPLE]: EventType.H3,
  [Difficulty.HOME_RUN]: EventType.H4,
};

export const TYPES_MOVEMENTS_MAP = {
  [EventType.H1]: 1,
  [EventType.H2]: 2,
  [EventType.H3]: 3,
  [EventType.H4]: 4,
};

export const EVENT_TYPE_LABEL_MAP = {
  [EventType.H1]: 'Sencillo',
  [EventType.H2]: 'Doble',
  [EventType.H3]: 'Triple',
  [EventType.H4]: 'Jonrón',
  [EventType.OUT]: 'Out',
};

export const EmptyMember = { name: '', nickname: '', jerseyNo: 0 };

export const EmptyGame = {
  pack: null,
  team1: null,
  team2: null,
  short_code: '',
  timer_seconds: 30,
  innings: [],
};

export const EmptyBases = [0, 0, 0, 0];

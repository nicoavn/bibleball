export const API_URL = 'http://localhost:8000/game/'
export const MAX_INNINGS = 5;


export const Difficulty = {
  SINGLE: 'SG',
  DOUBLE: "DB",
  TRIPLE: "TP",
  HOME_RUN: "HR",
}

export const EventType = {
  H1: "H1",
  H2: "H2",
  H3: "H3",
  H4: "H4",
  OUT: "OUT",
}

export const QUESTION_DIFFICULTY_EVENT_TYPE_MAP = {
  [Difficulty.SINGLE]: EventType.H1,
  [Difficulty.DOUBLE]: EventType.H2,
  [Difficulty.TRIPLE]: EventType.H3,
  [Difficulty.HOME_RUN]: EventType.H4,
}

export const TYPES_MOVEMENTS_MAP = {
  [EventType.H1]: 1,
  [EventType.H2]: 2,
  [EventType.H3]: 3,
  [EventType.H4]: 4,
}
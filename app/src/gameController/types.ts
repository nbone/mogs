
export enum GameStatus {
  Preparing,
  Playing,
  Finished,
  Aborted
}

export type GameSettings = {
  gameTitleId: string
  minPlayers: number
  maxPlayers: number
  options: object | undefined
}

export type GamePlayer = {
  id: string
  name: string
  isHost: boolean
  publicKey: Uint8Array
}

export class GameInfo {
  constructor (
    public id: string,
    public settings: GameSettings,
    public status: GameStatus,
    public players: GamePlayer[]
  ) {}
}

export enum GameEventType {
  Create,
  Join,
  Start,
  Finish,
  Abort,
  Message
}

export class GameEvent {
  constructor (
    public id: string,
    public type: GameEventType,
    public timestamp: number,
    public gameInfo: GameInfo,
    public details: object | undefined
  ) {}
}

export class GameRecord {
  constructor (
    public id: string,
    public settings: GameSettings,
    public status: GameStatus,
    public players: GamePlayer[],
    public events: object[],
    public gameState: object
  ) {}
}

export function toGameInfo (gameRecord: GameRecord): GameInfo {
  return new GameInfo(
    gameRecord.id,
    gameRecord.settings,
    gameRecord.status,
    gameRecord.players
  )
}

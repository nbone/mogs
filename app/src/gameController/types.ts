
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
  options: object
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

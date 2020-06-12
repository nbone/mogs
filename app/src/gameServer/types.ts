
export type PlayerData = {
  playerId: string
  data: object
}

export type GameUpdateResult = {
  isFinished: boolean
  playerViewStates: PlayerData[]
}

export interface GameEngine {
  start (): GameUpdateResult
  update (playerActions: PlayerData[]): GameUpdateResult
}

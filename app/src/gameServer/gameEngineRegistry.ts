import { GameEngine, GameUpdateResult, PlayerData } from './types'
import { TicTacToeGame } from '../games/TicTacToe/TicTacToe'

export interface GameEngineCtor {
  (playerIds: string[], options: object): GameEngine
}

export class GameEngineRegistry {
  private gameEngineCtorsById = new Map<string, GameEngineCtor>()

  public register (gameEngineId: string, gameEngineCtor: GameEngineCtor): void {
    if (this.gameEngineCtorsById.has(gameEngineId)) {
      throw new Error(`Game engine ID ${gameEngineId} already registered.`)
    }
    this.gameEngineCtorsById.set(gameEngineId, gameEngineCtor)
  }

  public getGameEngineInstance (gameEngineId: string, playerIds: string[], options: object): GameEngine {
    const gameEngineCtor = this.gameEngineCtorsById.get(gameEngineId)
    if (!gameEngineCtor) {
      throw new Error(`No registered game engine with ID ${gameEngineId}.`)
    }
    return gameEngineCtor(playerIds, options)
  }
}

export const gameEngineRegistry = new GameEngineRegistry()

gameEngineRegistry.register('TicTacToe', (playerIds: string[], options: object) => new TicTacToeGame(playerIds))

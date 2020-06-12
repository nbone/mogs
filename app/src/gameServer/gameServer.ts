/*
We have the following moving parts:
 - APP: top-level application each user is running.
 - MESSAGE SERVER (remote): the means of communication across users.
 - GAME CONTROLLER (nee Client): interface between the APP and all aspects of the game, including messaging and rendering.
 - GAME SERVER: manages game state and posts updates. Runs on HOST players instance (whoever created the game).
 - GAME ENGINE: game-specific backend. Only accessed by GAME SERVER.
 - GAME VIEW: game-specific frontend. Hosted within APP; driven by updates from GAME CONTROLLER.

Data flow when starting a new game:
 - User chooses to start a new game (this user will be the HOST).
 - Call GAME CONTROLLER to start new game, specifying game and options if any.
 - GAME CONTROLLER sends request to local GAME SERVER (bypasses public messaging because host is local).
 - GAME SERVER creates game instance, and posts public message with game status.
 - User APPs update with new message, showing the game in the list. Host shows game detail, waiting for players.
Join:
 - Other user selects to join the game.
 - Call GAME CONTROLLER to join the game.
 - GAME CONTROLLER posts join request message.
 - Host GAME CONTROLLER detects message about hosted game, forwards to GAME SERVER.
 - GAME SERVER validates join request (e.g. could have too many players trying to join at once); updates game state; post message with updated state.
Start:
 - Host selects to start the game.
 - GAME CONTROLLER forwards request to local GAME SERVER.
 - GAME SERVER updates game state; posts ONE MESSAGE PER PLAYER with (encrypted) per-player game state.
 - All participating players, upon seeing message, update to in-game view.
Rendering in-game view:
 - APP detects that we're in-game, and requests GAME VIEW component from GAME CONTROLLER, passing latest (player-view) game state from GAME CONTROLLER.
 - Game-specific GAME VIEW component takes game-state as props, renders game-specific view for player.
Player actions:
 - Player action originates within GAME VIEW, passed as a "player action" blob to GAME CONTROLLER.
 - GAME CONTROLLER encrypts and posts message for receipt by the host GAME SERVER.
 - Host GAME CONTROLLER forwards message to GAME SERVER.
 - Host GAME SERVER decrypts and passes message to GAME ENGINE instance.
 - GAME ENGINE updates state; GAME SERVER posts one message per player with updated state.
*/

import { shortid } from '@mogs/common'
import { GameSettings, GamePlayer, GameStatus, GameInfo } from '../gameController/types'
import { GameEngine, PlayerData } from './types'
import { gameEngineRegistry } from './gameEngineRegistry'
import { sendGameInfoMessage, sendGameViewStateMessage } from '../state/messageStore'

type HostedGame = {
  id: string,
  settings: GameSettings,
  status: GameStatus,
  players: GamePlayer[],
  engine?: GameEngine
}

const hostedGames = new Map<string, HostedGame>()

export function createHostedGame (gameSettings: GameSettings, host: GamePlayer): string {
  // TODO: validate gameSettings

  // 1. create new game entity
  const game: HostedGame = {
    id: shortid(),
    settings: gameSettings,
    status: GameStatus.Preparing,
    players: [host]
  }

  // 2. insert into game data store
  hostedGames.set(game.id, game)

  // 3. publish create event
  sendGameInfoMessage(toGameInfo(game))

  return game.id
}

export function startHostedGame (gameId: string) {
  const game = getHostedGame(gameId)
  if (game.status !== GameStatus.Preparing) {
    throw new Error(`Game cannot be started: ${JSON.stringify(game)}.`)
  }
  game.engine = gameEngineRegistry.getGameEngineInstance(game.settings.gameTitleId, game.players.map(p => p.id), game.settings.options)
  const gameState = game.engine.start()
  game.status = gameState.isFinished ? GameStatus.Finished : GameStatus.Playing
  hostedGames.set(gameId, game)
  gameState.playerViewStates.forEach(pd => {
    publishGameState(game.id, pd.playerId, pd.data)
  })
  sendGameInfoMessage(toGameInfo(game))
}

export function processPlayerAction (gameId: string, playerId: string, action: object) {
  const game = getHostedGame(gameId)
  if (!game.engine || game.status !== GameStatus.Playing) {
    throw new Error(`Game is not currently playing: ${JSON.stringify(game)}.`)
  }
  const playerActions: PlayerData[] = [{ playerId: playerId, data: action }]
  const gameState = game.engine.update(playerActions)
  gameState.playerViewStates.forEach(pd => {
    publishGameState(game.id, pd.playerId, pd.data)
  })
  if (gameState.isFinished) {
    game.status = GameStatus.Finished
    hostedGames.set(gameId, game)
    sendGameInfoMessage(toGameInfo(game))
  }
}

export function processJoinRequest (gameId: string, player: GamePlayer) {
  const game = getHostedGame(gameId)
  if (game.status === GameStatus.Preparing && game.players.length < game.settings.maxPlayers) {
    game.players.push(player)
    hostedGames.set(gameId, game)
    sendGameInfoMessage(toGameInfo(game))
  }
}

function publishGameState (gameId: string, playerId: string, viewState: object) {
  // TODO: encrypt viewState with player's public key
  sendGameViewStateMessage(gameId, playerId, viewState)
}

function getHostedGame (gameId: string): HostedGame {
  const game = hostedGames.get(gameId)
  if (!game) {
    throw new Error(`Unknown game ID ${gameId}.`)
  }
  return game
}

function toGameInfo (hostedGame: HostedGame): GameInfo {
  return new GameInfo(
    hostedGame.id,
    hostedGame.settings,
    hostedGame.status,
    hostedGame.players
  )
}

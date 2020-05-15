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

import uuid from 'uuid'
import { GameSettings, GameRecord, GamePlayer, GameStatus, toGameInfo } from "../gameController/types";
import { sendGameInfoMessage, sendGameViewStateMessage } from '../state/messageStore';
import { TicTacToeGame } from '../games/TicTacToe/TicTacToe';

let hostedGames = new Map<string, GameRecord>();

export function createHostedGame(gameSettings: GameSettings, host: GamePlayer) {
    // TODO: validate gameSettings

    // 1. create new game entity
    let game = new GameRecord(
        uuid.v4(),
        gameSettings,
        GameStatus.Preparing,
        [host],
        [],
        {}
    )

    // 2. insert into game data store
    hostedGames[game.id] = game

    // 3. publish create event
    sendGameInfoMessage(toGameInfo(game))
}

// TODO: invert dependency
let gameRegistry = new Map<string, object>([
    ['TicTacToe', {
        engine: TicTacToeGame,
    }]
]);

export function startHostedGame(gameId: string) {
    // TODO: validate gameId
    const game = hostedGames.get(gameId)
    const gameEngine = gameRegistry.get(game.settings.gameTitleId)
    const instance = gameEngine(game.players) // TODO: consistent engine interface
    game.gameState = instance
    game.status = GameStatus.Playing
    game.players.forEach(p => {
        publishGameState(gameId, p)
    })
}

export function processPlayerAction(gameId: string, playerName: string, action: object) {
    // TODO: use player ID instead of name
    const game = hostedGames.get(gameId)
    game.gameState.act(playerName, action)
    game.players.forEach(p => {
        publishGameState(gameId, p)
    })
}

function publishGameState(gameId: string, playerName: string) {
    // TODO: use player ID instead of name
    const game = hostedGames.get(gameId)
    // TODO: encrypt viewState with player's public key
    const viewState = game.gameState.getGameViewStateForPlayer(playerName)
    sendGameViewStateMessage(gameId, playerName, viewState)
}

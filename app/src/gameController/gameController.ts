// Abstracts all interactions with the game server and individual games.

import { Key } from 'react'
import { shortid } from '@mogs/common'
import { GameSettings, GameInfo, GamePlayer, GameStatus } from './types'
import { createHostedGame, startHostedGame, processJoinRequest, processPlayerAction } from '../gameServer/gameServer'
import { settings } from '../state/settings'
import { getGameInfoMessages, MessageType, RichMessage, subscribeMessageCallback, sendGameJoinRequestMessage, GameJoinRequestBody, GameViewStateBody, GamePlayerActionBody, sendGamePlayerActionMessage } from '../state/messageStore'
import { GameView } from '../games/TicTacToe/components/GameView'

type ObjectGroup<T> = {
  key: Key
  items: T[]
}

type GameUpdatedCallback = (gameId: string) => any
const gameUpdatedSubscriberMap: Map<string, GameUpdatedCallback> = new Map()
export function subscribeGameUpdatedCallback (callback: GameUpdatedCallback): string {
  // TODO: allow subscribing to only some game ids?
  const id = shortid()
  gameUpdatedSubscriberMap.set(id, callback)
  return id
}

export function unsubscribeGameUpdatedCallback (id: string) {
  gameUpdatedSubscriberMap.delete(id)
}

// TODO: invert dependency
const gameViewRegistry = new Map<string, React.FunctionComponent>([
  ['TicTacToe', GameView]
])

// Keep track of the games hosted by the local game server
const locallyHostedGameIds: Set<string> = new Set()

// Track current view state for active games this player is involved in
const gameViewStateDatabase = new Map<string, object>()

// Maintain local in-memory database of all the games, from the published message history
const gameInfoDatabase = new Map<string, GameInfo>()
getGameInfoMessages().then(
    gameInfoMessages => {
      const reverse = true
      orderBy(gameInfoMessages, m => m.when, reverse).forEach(processMessage)
    }
).then(
  () => {
    subscribeMessageCallback(processMessage)
  }
)

function processMessage (message: RichMessage) {
  console.log(message)
  if (message.type === MessageType.GameInfo) {
    const gameInfo: GameInfo = message.body
    gameInfoDatabase.set(gameInfo.id, gameInfo)
    gameUpdatedSubscriberMap.forEach((callback) => callback(gameInfo.id))
  } else if (message.type === MessageType.JoinRequest) {
    const joinRequest: GameJoinRequestBody = message.body
    if (locallyHostedGameIds.has(joinRequest.gameId)) {
      processJoinRequest(joinRequest.gameId, joinRequest.player)
    }
  } else if (message.type === MessageType.GameViewState) {
    const viewState: GameViewStateBody = message.body
    if (viewState.to === settings.getUserId()) {
      // TODO: decrypt message (once we have encryption)
      gameViewStateDatabase.set(viewState.gameId, viewState.viewState)
      gameUpdatedSubscriberMap.forEach((callback) => callback(viewState.gameId))
    }
  } else if (message.type === MessageType.PlayerAction) {
    const playerAction: GamePlayerActionBody = message.body
    if (locallyHostedGameIds.has(playerAction.gameId)) {
      processPlayerAction(playerAction.gameId, playerAction.player.id, playerAction.action)
    }
  }
}

function groupBy<T> (sequence: T[], propertySelector: (obj: T) => Key): ObjectGroup<T>[] {
  const groups = new Map<Key, object[]>()
  sequence.reduce((groups, item) => {
    const key = propertySelector(item)
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
    return groups
  })
  return Array.from(groups.keys(), key => {
    return {
      key: key,
      items: groups[key]
    }
  })
}

function orderBy<T> (sequence: T[], propertySelector: (obj: T) => Key, reverse: boolean = false): T[] {
  return sequence.sort((a, b) => {
    const [pa, pb] = [propertySelector(a), propertySelector(b)]
    const ltReturn = reverse ? 1 : -1
    return pa < pb
      ? ltReturn
      : pa > pb
        ? -ltReturn
        : 0
  })
}

function collateGameInfo (gameEventGroup: ObjectGroup<RichMessage>): GameInfo {
  const reverse = true
  return orderBy(gameEventGroup.items, e => e.when, reverse)[0].body
}

export function listGames (): GameInfo[] {
  console.log(Array.from(gameInfoDatabase.values()))
  return Array.from(gameInfoDatabase.values())
}

export function createGame (gameSettings: GameSettings) {
  // TODO: get ALL player info from settings, and handle error if missing
  const playerName = settings.getUserName() || ''
  const publicKey = new Uint8Array()
  const host = {
    id: settings.getUserId(),
    name: playerName,
    isHost: true,
    publicKey: publicKey
  }

  const gameId = createHostedGame(gameSettings, host)
  locallyHostedGameIds.add(gameId)
}

export function joinGame (gameId: string) {
  // TODO: single way to get player info, correctly
  const player: GamePlayer = {
    id: settings.getUserId(),
    name: settings.getUserName() || '',
    isHost: false,
    publicKey: new Uint8Array()
  }
  sendGameJoinRequestMessage(gameId, player)
}

export function startGame (gameId: string) {
  // ONLY for self-hosted games (verify that current player is the host)
  startHostedGame(gameId)
}

export function sendPlayerAction (gameId: string, action: object) {
  // TODO: single way to get player info, correctly
  const player: GamePlayer = {
    id: settings.getUserId(),
    name: settings.getUserName() || '',
    isHost: false,
    publicKey: new Uint8Array()
  }
  sendGamePlayerActionMessage(gameId, player, action)
}

export function getCurrentGameInfo (): GameInfo | undefined {
  // HACK: for now using local game database instead of from server
  // ASSUME: can only be in one game at a time, so return first match
  // TODO: separate concepts of "participating" vs. "watching", so players aren't forced out when game finishes
  const playerId = settings.getUserId() || ''
  const isCurrent = (game: GameInfo) => game.status === GameStatus.Preparing || game.status === GameStatus.Playing
  const isMine = (game: GameInfo) => game.players.find(p => p.id === playerId)
  return listGames().find(g => isCurrent(g) && isMine(g))
}

export function renderGameView (gameId: string) {
  const game = gameInfoDatabase.get(gameId)
  const gameTitleId = game.settings.gameTitleId
  const view = gameViewRegistry.get(gameTitleId)
  const viewState = gameViewStateDatabase.get(gameId)
  const playerActionCallback = (action: object) => sendPlayerAction(gameId, action)
  const props = { viewState, playerActionCallback }
  return view(props)
}

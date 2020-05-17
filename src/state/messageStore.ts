// Interface to the message server. All the rest of the app should go through here.
// Interprets raw messages into rich types (e.g. chat messages vs. game events).
// Can poll for new messages and push-notify subscribers based on filters.
// If we want to swap backends (e.g. use a dummy local backend for testing), this is where we do it.

import uuid from 'uuid'
import { Message, MessageFromServer } from '../types'
import { getMessages, postMessage } from '../api'
import { settings } from './settings';
import { GameInfo, GamePlayer } from '../gameController/types';

const RICH_MESSAGE_MARKER = '\x01';
const USE_LOCAL_STORE = true;

// TODO: maybe better to use IndexedDB than local storage (but also this local store is a hack)?
class LocalMessages {
    private STORAGE_KEY = 'messageStore.localMessages';

    constructor() {
    }

    public get(): RichMessage[] {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    }

    public add(message: RichMessage) {
        let messages = this.get();
        messages.unshift(message);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(messages));
    }

    public clear() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}
const localMessages = new LocalMessages();
let seenMessageIds = new Set<string>(localMessages.get().map(m => m.id));

export enum MessageType {
  Plain,            // plain text message, for chat
  GameInfo,         // game status update for game not in progress; broadcast to all listeners
  JoinRequest,      // player join request for game not yet started; addressed to game server
  GameViewState,    // game view state update; addressed to each player individually
  PlayerAction,     // player action in the game; addressed to game server
}

/*
Kinds of game messages:
 - Game view state updates for individual players.
 - Game status updates for games not in progress (e.g. create, start, finish); broadcast to all listeners.
 - Player actions in game; addressed to game server.
 - Player join requests; addressed to game server.
 - ... anything else???
*/

export type GameViewStateBody = {
  gameId: string,
  to: string,
  viewState: object,
}

export type GameJoinRequestBody = {
    gameId: string,
    player: GamePlayer,
}

type TypedMessage = {
  type: MessageType,
  body: any,
}

export class RichMessage {
  constructor(
    public id: string,
    public when: number,
    public type: MessageType,
    public from: string,
    public body: any,
  ){}
}

type MessageCallback = (message: RichMessage) => any
let messageSubscriberMap: Map<string, MessageCallback> = new Map();
export function subscribeMessageCallback(callback: MessageCallback): string {
  // TODO: filter?
  const id = uuid.v4()
  messageSubscriberMap.set(id, callback)
  return id
}

export function unsubscribeMessageCallback(id: string) {
  messageSubscriberMap.delete(id)
}


// POLL for new messages (currently LOCAL ONLY, because that's what we're using for development)
let messagePollInterval = setInterval(() => {
  let messages: RichMessage[] = localMessages.get();
  if (messages.length > seenMessageIds.size) {
    // Newest messages are first, so process in reverse order
    for (let i = seenMessageIds.size; i >= 0; i--) {
      let message = messages[i];
      if (!seenMessageIds.has(message.id)) {
        seenMessageIds.add(message.id);
        messageSubscriberMap.forEach((callback) => callback(message));
      }
    }
  }
}, 1000);


async function getRichMessagesFromServer(): Promise<RichMessage[]> {
  const serverUrl = settings.getServerUrl();
  const messages = await getMessages(serverUrl);
  return messages.map(m => toRichMessage(m));
}

export async function getAllMessages(): Promise<RichMessage[]> {
  if (USE_LOCAL_STORE) {
    return localMessages.get();
  } else {
    return getRichMessagesFromServer();
  }
}

export async function getChatMessages(): Promise<RichMessage[]> {
  const messages = await getAllMessages();
  return messages.filter(m => m.type == MessageType.Plain);
}

export async function getGameMessages(): Promise<RichMessage[]> {
  const messages = await getAllMessages();
  return messages.filter(m => m.type != MessageType.Plain);
}

function toRichMessage(message: MessageFromServer): RichMessage {
  const isRich = message.message.startsWith(RICH_MESSAGE_MARKER);
  const typedMessage: TypedMessage = isRich ? JSON.parse(message.message.slice(RICH_MESSAGE_MARKER.length)) : '';
  return new RichMessage(
    message.id,
    message.when,
    isRich ? typedMessage.type : MessageType.Plain,
    message.from,
    isRich ? typedMessage.body : message.message,
  );
}

function toLocalMessageFromServer(message: Message): MessageFromServer {
  return {
    id: uuid.v4(),
    when: Date.now(),
    from: message.from,
    message: message.message,
  };
}

async function doSendMessage(message: Message): Promise<RichMessage> {
  if (USE_LOCAL_STORE) {
    if (message.message == '!cls') {
      localMessages.clear();
    }

    const serverMessage = toRichMessage(toLocalMessageFromServer(message));
    localMessages.add(serverMessage);
    return serverMessage;
  } else {
    const serverUrl = settings.getServerUrl();
    const response = await postMessage(serverUrl, message);
    return toRichMessage(response);
  }
}

export async function sendChatMessage(text: string): Promise<RichMessage> {
  const from = settings.getUserName() || '';
  if (!from) {
    throw '"From" is required when sending a message!';
  }
  if (!text) {
    throw '"Text" is required when sending a message!';
  }
  const message: Message = {
    from: from,
    message: text,
  }

  const response = await doSendMessage(message);
  messageSubscriberMap.forEach((callback) => callback(response));
  return response;
}

export async function sendGameInfoMessage(data: GameInfo): Promise<RichMessage> {
  return sendTypedMessage(MessageType.GameInfo, data)
}

export async function sendGameJoinRequestMessage(gameId: string, player: GamePlayer) {
  const body: GameJoinRequestBody = {
    gameId: gameId,
    player: player,
  }
  return sendTypedMessage(MessageType.JoinRequest, body)
}

export async function sendGameViewStateMessage(gameId: string, playerId: string, data: object) {
  const body: GameViewStateBody = {
    gameId: gameId,
    to: playerId,
    viewState: data,
  }
  return sendTypedMessage(MessageType.GameViewState, body)
}

export async function sendGamePlayerActionMessage() {
}

async function sendTypedMessage(type: MessageType, body: object) {
  const typedMessage: TypedMessage = {
    type: type,
    body: body,
  }
  const encodedMessage = RICH_MESSAGE_MARKER + JSON.stringify(typedMessage)
  return sendChatMessage(encodedMessage)
}

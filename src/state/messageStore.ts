// Interface to the message server. All the rest of the app should go through here.
// Interprets raw messages into rich types (e.g. chat messages vs. game events).
// Can poll for new messages and push-notify subscribers based on filters.
// If we want to swap backends (e.g. use a dummy local backend for testing), this is where we do it.

import uuid from 'uuid'
import { Message, MessageFromServer } from '../types'
import { getMessages, postMessage } from '../api'
import { settings } from './settings';
import { GameInfo } from '../gameController/types';

const RICH_MESSAGE_MARKER = '\x01';
const USE_LOCAL_STORE = true;
const LOCAL_STORAGE_MESSAGES_KEY = 'messageStore.localMessages';

// TODO: maybe better to use IndexedDB than local storage (but also this local store is a hack)?
let localMessages: RichMessage[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY) || '[]');

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
  let messages = JSON.parse(localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY) || '[]');
  if (messages.length > localMessages.length) {
    console.log('Got more messages! Had ' + localMessages.length + '; now have ' + messages.length);
    localMessages = messages;
    // HACK: only fire callback for MOST RECENT message (currently no subscriber uses the message itself, only the fact that there's something new)
    messageSubscriberMap.forEach((callback) => callback(messages[0]));
  }
}, 1000);


async function getRichMessagesFromServer(): Promise<RichMessage[]> {
  const serverUrl = settings.getServerUrl();
  const messages = await getMessages(serverUrl);
  return messages.map(m => toRichMessage(m));
}

export async function getAllMessages(): Promise<RichMessage[]> {
  if (USE_LOCAL_STORE) {
    if (!localMessages.length) {
      const messages = await getRichMessagesFromServer();
      localMessages = messages;
      localStorage.setItem(LOCAL_STORAGE_MESSAGES_KEY, JSON.stringify(localMessages));
      return localMessages;
    }
    return localMessages;
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
  if (USE_LOCAL_STORE){
    const serverMessage = toRichMessage(toLocalMessageFromServer(message));
    localMessages.unshift(serverMessage);
    localStorage.setItem(LOCAL_STORAGE_MESSAGES_KEY, JSON.stringify(localMessages));
    console.log('Sending message #' + localMessages.length);
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
  const typedMessage: TypedMessage = {
    type: MessageType.GameInfo,
    body: data,
  }
  const encodedMessage = RICH_MESSAGE_MARKER + JSON.stringify(typedMessage)
  return sendChatMessage(encodedMessage)
}

export async function sendGameJoinRequestMessage() {
}

export async function sendGameViewStateMessage(gameId: string, playerName: string, data: object) {
  // TODO: Use player ID instead of name
  const body: GameViewStateBody = {
    gameId: gameId,
    to: playerName,
    viewState: data,
  }
  const typedMessage: TypedMessage = {
    type: MessageType.GameViewState,
    body: body,
  }
  const encodedMessage = RICH_MESSAGE_MARKER + JSON.stringify(typedMessage)
  return sendChatMessage(encodedMessage)

}

export async function sendGamePlayerActionMessage() {
}

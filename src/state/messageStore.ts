// Interface to the message server. All the rest of the app should go through here.
// Interprets raw messages into rich types (e.g. chat messages vs. game events).
// Can poll for new messages and push-notify subscribers based on filters.
// If we want to swap backends (e.g. use a dummy local backend for testing), this is where we do it.

import uuid from 'uuid'
import { Message, MessageFromServer } from '../types'
import { getMessages, postMessage } from '../api'
import { settings } from './settings';

const RICH_MESSAGE_MARKER = '\x01';
const USE_LOCAL_STORE = true;
let localMessages: RichMessage[] = [];

export enum MessageType {
  Plain,
  GameEvent,
}

export class GameMessageBody {
  constructor(
    public gameId: string,
    public to: string[] | undefined,
    public isEncrypted: boolean,
    public messageJson: any,
  ){}
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

// TODO: polling for new messages

// TODO: parse server messages into rich form

// TODO: send game event

type MessageCallback = (message: RichMessage) => any
let messageSubscriberMap: Map<string, MessageCallback> = new Map();
export function subscribeMessageCallback(callback: MessageCallback): string {
  // TODO: filter?
  // TODO: return handle for unsubscribe?
  const id = uuid.v4()
  messageSubscriberMap.set(id, callback)
  return id
}

export function unsubscribeMessageCallback(id: string) {
  messageSubscriberMap.delete(id)
}

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
  return messages.filter(m => m.type == MessageType.GameEvent);
}

function toRichMessage(message: MessageFromServer): RichMessage {
  const isRich = message.message.startsWith(RICH_MESSAGE_MARKER);
  return new RichMessage(
    message.id,
    message.when,
    isRich ? MessageType.GameEvent: MessageType.Plain,
    message.from,
    isRich ? JSON.parse(message.message.slice(RICH_MESSAGE_MARKER.length)) : message.message,
    // isRich ? message.message.slice(RICH_MESSAGE_MARKER.length) : message.message,
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

export async function sendGameMessage(data: GameMessageBody): Promise<RichMessage> {
  let encodedMessage = RICH_MESSAGE_MARKER + JSON.stringify(data)
  return sendChatMessage(encodedMessage)
}

/**
 * Backend message store for the MOGS server.
 */
import { Message, MessageFromServer, shortid } from '@mogs/common'

// For starters use a simple in-memory backend (no persistence)
const ALL_MESSAGES: MessageFromServer[] = []

export async function getMessages (): Promise<MessageFromServer[]> {
  return ALL_MESSAGES
}

export async function getMessageCount (): Promise<number> {
  return ALL_MESSAGES.length
}

export async function insertMessage (message: Message): Promise<MessageFromServer> {
  const messageToInsert = toMessageFromServer(message)
  ALL_MESSAGES.unshift(messageToInsert)
  return messageToInsert
}

function toMessageFromServer (message: Message): MessageFromServer {
  return {
    id: shortid(),
    when: Date.now(),
    from: message.from,
    message: message.message
  }
}

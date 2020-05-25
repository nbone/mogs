/**
 * This is what can be posted to the server.
 */
export type Message = {
  from: string
  message: string
}

/**
 * This is what can be returned to the server.
 */
export type MessageFromServer = {
  id: string
  when: number
} & Message

/**
 * Server metadata.
 */
export type Metadata = {
  upSince: string
  messageCount: number
}

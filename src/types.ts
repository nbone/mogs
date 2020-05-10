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
  // character_frequencies: {[key: string]: number}
  when: number
} & Message

export type Metadata = {
  server_name: string
  startup_uptime: string
  number_of_messages: number
  most_recent_messsage: MessageFromServer
}

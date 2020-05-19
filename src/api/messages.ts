import { Message, MessageFromServer } from '../types'

export function getMessages (baseUrl): Promise<MessageFromServer[]> {
  return fetch(`${baseUrl}/messages`)
    .then(response => response.json())
    .catch(error => console.log(error))
}

export function getMessageById (baseUrl, id): Promise<MessageFromServer> {
  return fetch(`${baseUrl}/messages/${id}`)
    .then(response => response.json())
    .catch(error => console.log(error))
}

export function postMessage (baseUrl, message: Message): Promise<MessageFromServer> {
  return fetch(`${baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  }).then(response => response.json())
}

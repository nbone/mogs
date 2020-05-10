import { Metadata } from './../types'

export function getMetadata (baseUrl): Promise<Metadata> {
  return fetch(`${baseUrl}/meta`)
    .then(response => response.json())
}

import { Metadata } from '@mogs/common'

export async function getMetadata (baseUrl: string): Promise<Metadata> {
  const response = await fetch(`${baseUrl}/meta`)
  return response.json()
}

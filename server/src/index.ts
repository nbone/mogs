/**
 * Web API for MOGS server.
 */
import cors from 'cors'
import express from 'express'
import { Metadata } from '@mogs/common'
import { getMessages, getMessageCount, insertMessage } from './backend'

const PORT = process.env.PORT || 3000
const UPSINCE = new Date()
const app = express()

app.use(cors())
app.use(express.json())

app.get('/', async (req, res, next) => {
  res.send('See https://github.com/nbone/mogs/')
})

app.get('/meta', async (req, res, next) => {
  try {
    const messageCount = await getMessageCount()
    const meta: Metadata = {
      upSince: UPSINCE.toISOString(),
      messageCount: messageCount
    }
    res.json(meta)
  } catch (e) {
    next(e)
  }
})

app.get('/messages', async (req, res, next) => {
  try {
    const messages = await getMessages()
    res.json(messages)
  } catch (e) {
    next(e)
  }
})

app.post('/messages', async (req, res, next) => {
  // TODO: validate request
  try {
    const { body } = req
    console.debug('POST: ' + JSON.stringify(body))
    const inserted = await insertMessage(body)
    res.status(201).json(inserted)
  } catch (e) {
    res.status(500).json(e)
    next(e)
  }
})

app.listen(PORT, () => console.log(`Serving on port ${PORT}`))

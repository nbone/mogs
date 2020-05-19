import React, { useEffect, useState } from 'react'
import TimeAgo from 'timeago-react'

import { getChatMessages, sendChatMessage, subscribeMessageCallback, RichMessage, unsubscribeMessageCallback } from '../../state/messageStore'

const style = require('./chat-panel.css')

export const ChatPanel: React.FunctionComponent = (props) => {
  const [refresh, setRefresh] = useState<number>(0)

  useEffect(() => {
    const subId = subscribeMessageCallback(message => {
      setRefresh(r => r + 1)
    })

    return function cleanup () {
      unsubscribeMessageCallback(subId)
    }
  }, [])

  // TODO: toggle panel visibility on click (here), not hover (css)
  return (
    <div className={style.chatPanel}>
      <i className={style.iconChat}></i>
      <div className={style.panel}>
        <MessagesListFetcher refresh={refresh} />
        <MessagePost />
      </div>
    </div>
  )
}

const MessagePost: React.FunctionComponent = (props) => {
  const [msgTxt, setMsgTxt] = useState('')

  function onSubmit (event) {
    event.preventDefault()

    sendChatMessage(msgTxt).then(response => {
      // console.log(response)
      setMsgTxt('')
    }).catch(e => {
      console.error(e)
    })
  }

  return (
    <div className={style.messagePost}>
      <form onSubmit={onSubmit}>
        <input type='text' value={msgTxt} onChange={(event) => setMsgTxt(event.target.value)} />
      </form>
    </div>
  )
}

const MessagesListFetcher: React.FunctionComponent = (props) => {
  const { refresh } = props
  const [messages, setMessages] = useState<RichMessage[] | undefined>()

  useEffect(() => {
    getChatMessages()
      .then(messagesResponse => {
        // console.log(messagesResponse)
        setMessages(messagesResponse)
      })
      .catch(e => {
        console.error(e)
      })
  }, [refresh])

  return <MessagesList messages={messages} />
}

const MessagesList: React.FunctionComponent = (props) => {
  const { messages } = props

  return (
    <ul className={style.messagesList} >
      {messages?.map((m, i) => <MessageDisplay key={m.id} message={m} />)}
    </ul>
  )
}

const MessageDisplay: React.FunctionComponent = (props) => {
  const { message } = props

  const when = new Date(message.when).toISOString()

  return (
    <li className={style.message}>
      <div className={style.hd}>
        <div className={style.from}>{message.from}</div>
        <TimeAgo className={style.when} datetime={when} title={when} />
      </div>
      <div className={style.bd}>
        {message.body}
      </div>
    </li>
  )
}

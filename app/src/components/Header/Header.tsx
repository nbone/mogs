import React from 'react'

import { Profile } from '../Profile'
import { ServerInfo } from '../ServerInfo'
import { ChatPanel } from '../ChatPanel'

const style = require('./header.css')

export const Header: React.FunctionComponent = () => {
  return (
    <div className={style.header}>
      <div className={style.title}>
        M.O.G.S.
      </div>
      <ChatPanel />
      <ServerInfo />
      <Profile />
    </div>
  )
}

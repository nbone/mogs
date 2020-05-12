import React, { useEffect, useState } from 'react'

import { settings } from '../../state/settings'
import { ServerInfo } from '../ServerInfo'
import { ChatPanel } from '../ChatPanel'

const style = require('./app.css')

export const Profile: React.FunctionComponent = () => {
  const [name, setName] = useState(settings.getUserName() || '');

  function handleChange(event) {
    const val = event.target.value;
    settings.setUserName(val);
    setName(val);
  }

  return (
    <div className={style.profile}>
      <i className={style.iconUser}></i>
      <div className={style.panel}>
        You are signed in as<br />
        <input type="text" name="name" value={name} onChange={handleChange} />
      </div>
    </div>
  )
}

export const Main: React.FunctionComponent = () => {
  // TODO: get state from game server
  // useEffect to poll for updated state?
  // or have child component as adapter for that?

  const currentGame = null;

  return (
    <div className={style.main}>
      { !currentGame ? <Lobby /> : <GameWindow game={currentGame} /> }
    </div>
  )
}

export const Lobby: React.FunctionComponent = () => {

  return (
    <div>
      Lobby todo...
      ONLY display this if not currently JOINED in a game.
      List the current games.
      Option to start a new game (and choose type/options).
      Option to join an existing game that is WAITING for players.
    </div>
  )
}

export const GameWindow: React.FunctionComponent = (props) => {
  const { game } = props;

  return (
    <div>
      GameWindow todo...
    </div>
  )
}

export const App: React.FunctionComponent = () => {
  return (
    <div className={style.appContainer}>
      <div className={style.header}>
        <div className={style.title}>
          M.O.G.S.
        </div>
        <ChatPanel />
        <ServerInfo />
        <Profile />
      </div>
      <Main />
    </div>
  )
}

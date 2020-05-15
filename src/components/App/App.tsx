import React, { useEffect, useState } from 'react'

import { settings } from '../../state/settings'
import { ServerInfo } from '../ServerInfo'
import { ChatPanel } from '../ChatPanel'
import { listGames, createGame, getCurrentGameInfo } from '../../gameController/gameController'
import { GameStatus, GameInfo } from '../../gameController/types'
import { subscribeMessageCallback, unsubscribeMessageCallback } from '../../state/messageStore'

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
  const [gameList, setGameList] = useState<GameInfo[]>(listGames())

  const myGame = getCurrentGameInfo();

  useEffect(() => {
    const subId = subscribeMessageCallback(message => {
      console.log(message);
      setGameList(listGames());
    });

    return function cleanup() {
      unsubscribeMessageCallback(subId);
    }
  }, []);

  return (
    <div className={style.main}>
      {/* { !myGame ? <Lobby games={gameList} /> : <GameWindow game={myGame} /> } */}
      <Lobby games={gameList} />
      <GameWindow game={myGame} />
    </div>
  )
}

export const Lobby: React.FunctionComponent = (props) => {
  const { games } = props
  const [renderCreateDialog, setRenderCreateDialog] = useState<boolean>(false)

  function showCreateDialog(event) {
    setRenderCreateDialog(true)
  }

  function doCreateGame(event) {
    setRenderCreateDialog(false)
    const gameSettings = {
      gameTitleId: 'Test Game Title Id',
      minPlayers: 1,
      maxPlayers: 3,
      options: {},
    }
    createGame(gameSettings)
  }

  if (renderCreateDialog) {
    return (
      <Modal isVisible={true}>
        What game would you like to play?
        Curently there's only ZERO options, so just click this button:
        <button onClick={doCreateGame}>CREATE</button>
      </Modal>
    )
  }

  return (
    <div className={style.lobby}>
      <p>
        Lobby todo...
        ONLY display this if not currently JOINED in a game.
        List the current games.
        Option to start a new game (and choose type/options).
        Option to join an existing game that is WAITING for players.
      </p>
      <button onClick={showCreateDialog}>Create new game</button>
      <GamesList games={games} />
    </div>
  )
}

export const Modal: React.FunctionComponent = (props) => {
  const { isVisible, children } = props

  if (!isVisible)
    return null;

  return (
    <div className={style.modal}>
      {children}
    </div>
  )
}

const GamesList: React.FunctionComponent = (props) => {
  const { games } = props

  return (
    <table>
      <thead>
        <th>Game</th>
        <th>Status</th>
        <th>Host</th>
      </thead>
      <tbody>
        {games?.map(g => <GameDisplay game={g} />)}
      </tbody>
    </table>
  )
}

function gameStatusToDisplayString(gameStatus: GameStatus) {
  switch (gameStatus) {
    case GameStatus.Preparing:
      return 'Waiting for players'
    case GameStatus.Playing:
      return 'In progress'
    case GameStatus.Finished:
      return 'Finished'
    case GameStatus.Aborted:
      return 'Aborted'
  }
  throw 'Unrecognised GameStatus: ' + gameStatus
}

const GameDisplay: React.FunctionComponent = (props) => {
  const { game } = props

  return (
    <tr key={game.id}>
      <td>{game.settings.gameTitleId}</td>
      <td>{gameStatusToDisplayString(game.status)}</td>
      <td>{game.players.filter(p => p.isHost)[0].name}</td>
    </tr>
  )
}

export const GameWindow: React.FunctionComponent = (props) => {
  const { game } = props;

  return (
    <div>
      GameWindow todo...
      <pre>{JSON.stringify(game, null, 2)}</pre>
      If can start (i.e. enough players) then enable START button.
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

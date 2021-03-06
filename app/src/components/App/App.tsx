import React, { useEffect, useState } from 'react'

import { settings } from '../../state/settings'
import { Profile } from '../Profile'
import { ServerInfo } from '../ServerInfo'
import { ChatPanel } from '../ChatPanel'
import { listGames, createGame, getCurrentGameInfo, joinGame, startGame, renderGameView, subscribeGameUpdatedCallback, unsubscribeGameUpdatedCallback } from '../../gameController/gameController'
import { GameStatus, GameInfo } from '../../gameController/types'
import { Panel } from '../Panel'

const style = require('./app.css')

export const Main: React.FunctionComponent = () => {
  const [gameList, setGameList] = useState<GameInfo[]>()
  const [myGame, setMyGame] = useState<GameInfo>()

  function onGameUpdated (gameId: string) {
    console.log('Game has been updated: ' + gameId)
    setGameList(listGames())
    setMyGame(getCurrentGameInfo())
  }

  useEffect(() => {
    const subId = subscribeGameUpdatedCallback(onGameUpdated)

    onGameUpdated('(initial render)')

    return function cleanup () {
      unsubscribeGameUpdatedCallback(subId)
    }
  }, [])

  return (
    <div className={style.main}>
      { !myGame ? <Lobby games={gameList} /> : <GameWindow game={myGame} /> }
    </div>
  )
}

export const Lobby: React.FunctionComponent = (props) => {
  const { games } = props
  const [renderCreateDialog, setRenderCreateDialog] = useState<boolean>(false)

  function showCreateDialog (event) {
    setRenderCreateDialog(true)
  }

  function doCreateGame (event) {
    setRenderCreateDialog(false)
    const gameSettings = {
      gameTitleId: 'TicTacToe',
      minPlayers: 2,
      maxPlayers: 2,
      options: {}
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
    <Panel className={style.lobby}>
      <p>
        Lobby todo...
        ONLY display this if not currently JOINED in a game.
        List the current games.
        Option to start a new game (and choose type/options).
        Option to join an existing game that is WAITING for players.
      </p>
      <button onClick={showCreateDialog}>Create new game</button>
      <GamesList games={games} />
    </Panel>
  )
}

export const Modal: React.FunctionComponent = (props) => {
  const { isVisible, children } = props

  if (!isVisible) {
    return null
  }

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
        <tr>
          <th>Game</th>
          <th>Status</th>
          <th>Host</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {games?.map(g => <GameDisplay key={g.id} game={g} />)}
      </tbody>
    </table>
  )
}

function gameStatusToDisplayString (gameStatus: GameStatus) {
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
  throw new Error('Unrecognised GameStatus: ' + gameStatus)
}

const GameDisplay: React.FunctionComponent = (props) => {
  const { game } = props

  function handleJoinClick (event) {
    joinGame(game.id)
  }

  return (
    <tr>
      <td>{game.settings.gameTitleId}</td>
      <td>{gameStatusToDisplayString(game.status)}</td>
      <td>{game.players.find(p => p.isHost).name}</td>
      <td><button onClick={handleJoinClick}>Join</button></td>
    </tr>
  )
}

export const GameWindow: React.FunctionComponent = (props) => {
  const { game } = props

  const isPlaying = game.status === GameStatus.Playing
  const canStart = game.players.length >= game.settings.minPlayers
  const isHost = game.players.find(p => p.isHost).id === settings.getUserId()

  function handleStartClick (event) {
    startGame(game.id)
  }

  if (isPlaying) {
    // TODO: provide a way to exit the game
    return (
      <div className={style.gameWindow}>
        {renderGameView(game.id)}
      </div>
    )
  }

  return (
    <div className={style.gameWindow}>
      <div>
      {
        canStart ?
          isHost ? <div>Ready to start! <button onClick={handleStartClick}>start</button></div>
            : 'Waiting for host to start...'
          : 'Waiting for players...'
      }
      </div>
      <pre>{JSON.stringify(game, null, 2)}</pre>
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

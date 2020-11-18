import React, { useState } from 'react'

import { createGame, joinGame } from '../../gameController/gameController'
import { GameStatus } from '../../gameController/types'
import { Panel } from '../Panel'
import { useHistory } from 'react-router-dom'

const style = require('./lobby.css')

export const Lobby: React.FunctionComponent = (props) => {
  const { games } = props
  const [renderCreateDialog, setRenderCreateDialog] = useState<boolean>(false)
  let history = useHistory()

  function showCreateDialog (event) {
    setRenderCreateDialog(true)
  }

  async function doCreateGame (event) {
    setRenderCreateDialog(false)
    const gameSettings = {
      gameTitleId: 'TicTacToe',
      minPlayers: 2,
      maxPlayers: 2,
      options: {}
    }
    const gameId = await createGame(gameSettings)
    console.log(`created gameId ${gameId}`)
    history.push(`/game/${gameId}`)
  }

  if (renderCreateDialog) {
    // TODO: get list of supported games from server
    // TODO: allow user to choose game settings
    return (
      <Panel className={style.lobby}>
        What game would you like to play?
        Curently there's NO CHOICE, so just click this button:
        <button onClick={doCreateGame}>CREATE</button>
      </Panel>
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

const GameDisplay: React.FunctionComponent = (props) => {
  const { game } = props
  const history = useHistory()

  function handleJoinClick (event) {
    joinGame(game.id)
    history.push(`/game/${game.id}`)
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

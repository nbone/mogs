import React from 'react'

import { settings } from '../../state/settings'
import { startGame, renderGameView } from '../../gameController/gameController'
import { GameStatus } from '../../gameController/types'

const style = require('./game-window.css')

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

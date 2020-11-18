import React, { useState, useEffect } from 'react'

import { settings } from '../../state/settings'
import { startGame, renderGameView, getGameInfo, subscribeGameUpdatedCallback, unsubscribeGameUpdatedCallback, get_renderGameView_props } from '../../gameController/gameController'
import { GameStatus, GameInfo } from '../../gameController/types'
import { GameView } from '../../games/TicTacToe/components/GameView/index'

const style = require('./game-window.css')

export const GameWindow: React.FunctionComponent = (props) => {
  const { game, refresh } = props
  // const [game, setGame] = useState<GameInfo | undefined>()
  // const [refresh, setRefresh] = useState<number>(0)

  // function onGameUpdated (gameId: string) {
  //   console.log('Game has been updated: ' + gameId)
  //   setGame(getGameInfo(gameId))
  //   setRefresh(refresh + 1)
  // }

  // useEffect(() => {
  //   const subId = subscribeGameUpdatedCallback(onGameUpdated)

  //   onGameUpdated(gameId)

  //   return function cleanup () {
  //     unsubscribeGameUpdatedCallback(subId)
  //   }
  // }, [])

  console.log(props)

  if (!game) {
    return (
      <>
        <h1>404</h1>
      </>
    )
  }

  const isPlaying = game.status === GameStatus.Playing
  const canStart = game.players.length >= game.settings.minPlayers
  const isHost = game.players.find(p => p.isHost)!.id === settings.getUserId()

  function handleStartClick (event) {
    startGame(game.id)
  }

  if (isPlaying) {
    // TODO: provide a way to exit the game
    const gameViewProps = get_renderGameView_props(game.id)
    console.log(gameViewProps)
    
    return (
      <div className={style.gameWindow}>
        <h1>Last render date: {Date.now().toString(36)}</h1>
        <GameView viewState={gameViewProps.viewState} playerActionCallback={gameViewProps.playerActionCallback} />
        {/* {renderGameView(game.id)} */}
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

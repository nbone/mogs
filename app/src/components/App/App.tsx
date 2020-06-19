import React, { useEffect, useState } from 'react'

import { listGames, getCurrentGameInfo, subscribeGameUpdatedCallback, unsubscribeGameUpdatedCallback } from '../../gameController/gameController'
import { GameInfo } from '../../gameController/types'
import { Lobby } from '../Lobby'
import { Header } from '../Header'
import { GameWindow } from '../GameWindow'

const style = require('./app.css')

export const App: React.FunctionComponent = () => {
  return (
    <div className={style.appContainer}>
      <Header />
      <Main />
    </div>
  )
}

const Main: React.FunctionComponent = () => {
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

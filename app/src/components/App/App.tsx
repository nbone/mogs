import React, { useEffect, useState } from 'react'
import { Link, Route, BrowserRouter, Switch, useHistory, useParams } from 'react-router-dom'

import { listGames, getCurrentGameInfo, subscribeGameUpdatedCallback, unsubscribeGameUpdatedCallback, getGameInfo } from '../../gameController/gameController'
import { GameInfo } from '../../gameController/types'
import { Lobby } from '../Lobby'
import { Header } from '../Header'
import { GameWindow } from '../GameWindow'

const style = require('./app.css')

// const browserHistory = createBrowserHistory({
//   basename: '/'
// })

export const App: React.FunctionComponent = () => {
  return (
    <div className={style.appContainer}>
      <Header />
      <Main />
    </div>
  )
}

const Main: React.FunctionComponent = () => {
  return (
    <div className={style.main}>
      <BrowserRouter>
        <Switch>
          <Route exact path='/'>
            <HomeRoute />
          </Route>
          <Route exact path='/game/:id'>
            <GameWindowRoute />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  )
}

const HomeRoute = () => {
  const [gameList, setGameList] = useState<GameInfo[]>()

  function onGameUpdated (gameId: string) {
    console.log('Game has been updated: ' + gameId)
    setGameList(listGames())
  }

  useEffect(() => {
    const subId = subscribeGameUpdatedCallback(onGameUpdated)

    onGameUpdated('(initial render)')

    return function cleanup () {
      unsubscribeGameUpdatedCallback(subId)
    }
  }, [])

  return (
    <Lobby games={gameList} />
  )
}

const GameWindowRoute = () => {
  const { id } = useParams()
  const [game, setGame] = useState<GameInfo | undefined>()
  const [refresh, setRefresh] = useState<number>(0)

  function onGameUpdated (gameId: string) {
    console.log('Game has been updated: ' + gameId)
    setGame(getGameInfo(id))
    setRefresh(refresh + 1)
  }

  useEffect(() => {
    const subId = subscribeGameUpdatedCallback(onGameUpdated)

    onGameUpdated(id)

    return function cleanup () {
      unsubscribeGameUpdatedCallback(subId)
    }
  }, [])

  if (!game) {
    return (
      <>
        <h1>404</h1>
        <Link to='/'>go home</Link>
      </>
    )
  }

  return (
    <GameWindow game={game} refresh={refresh} />
  )
}

// const Main: React.FunctionComponent = () => {
//   const [gameList, setGameList] = useState<GameInfo[]>()
//   const [myGame, setMyGame] = useState<GameInfo>()

//   function onGameUpdated (gameId: string) {
//     console.log('Game has been updated: ' + gameId)
//     setGameList(listGames())
//     setMyGame(getCurrentGameInfo())
//   }

//   useEffect(() => {
//     const subId = subscribeGameUpdatedCallback(onGameUpdated)

//     onGameUpdated('(initial render)')

//     return function cleanup () {
//       unsubscribeGameUpdatedCallback(subId)
//     }
//   }, [])

//   return (
//     <div className={style.main}>
//       { !myGame ? <Lobby games={gameList} /> : <GameWindow game={myGame} /> }
//     </div>
//   )
// }

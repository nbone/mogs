import React, { useEffect, useState } from 'react'
import { GameViewState, TileState, GamePlayerAction, GameStatus } from '../../TicTacToe'

const style = require('./game-view.css')

type GameViewProps = { viewState: GameViewState, playerActionCallback: (action: object) => null, refresh: string }

export const GameView: React.FunctionComponent = (props: GameViewProps) => {
  const { viewState, playerActionCallback, refresh } = props

  const className = style.gameView + ' ' + (viewState.playerNumber === 1 ? style.p1 : style.p2)
  console.log(props)

  const headerText = getHeaderText(viewState)

  // TODO: Why isn't this rerendering???
  return (
    <div className={className} key={refresh}>
      {headerText}
      <Header headerText={headerText} />
      <Board state={viewState} onAction={playerActionCallback} />
    </div>
  )
}

enum GameResult {
  NoneYet,
  Win,
  Loss,
  Draw
}

const Header: React.FunctionComponent = (props) => {
  const { headerText, refresh } = props

  return (
    <div className={style.header}>
      {headerText}
    </div>
  )
}

function getHeaderText(state: GameViewState): string {
  let result: GameResult = GameResult.NoneYet
  switch (state.status) {
    case GameStatus.Draw:
      result = GameResult.Draw
      break
    case GameStatus.P1Win:
      result = state.playerNumber === 1 ? GameResult.Win : GameResult.Loss
      break
    case GameStatus.P2Win:
      result = state.playerNumber === 2 ? GameResult.Win : GameResult.Loss
      break
  }
  const headerText = result === GameResult.Draw ? 'Draw game!'
    : result === GameResult.Win ? 'You win!'
    : result === GameResult.Loss ? state.opponentName + ' wins!'
    : state.isPlayerTurn ? 'It is your turn'
    : 'Waiting for ' + state.opponentName + ' to take their turn'

  return headerText
}

const Board: React.FunctionComponent = (props) => {
  const { state, onAction } = props

  function getClassName (tile: TileState): string {
    switch (tile) {
      case TileState.Blank: return style.blank
      case TileState.P1: return style.p1
      case TileState.P2: return style.p2
    }
  }

  function handleTileClick (row: number, col: number) {
    if (!state.isPlayerTurn) {
      return
    }
    const tileState: TileState = state.board[row][col]
    console.log('Clicked on tile (' + row + ',' + col + ') with state [' + tileState + ']')
    if (tileState !== TileState.Blank) {
      return
    }
    const action: GamePlayerAction = { row, col }
    onAction(action)
  }

  return (
    <table className={style.board}>
      {state.board.map((boardRows, rowNum) =>
        <tr>
          {boardRows.map((boardTile, colNum) =>
            <td className={getClassName(boardTile)} onClick={() => handleTileClick(rowNum, colNum)}>{boardTile}</td>
          )}
        </tr>
      )}
    </table>
  )
}

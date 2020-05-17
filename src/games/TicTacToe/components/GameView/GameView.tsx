import React, { useEffect, useState } from 'react'
import { GameViewState } from '../../TicTacToe'

const style = require('./game-view.css')

export const GameView: React.FunctionComponent = (props: { state: GameViewState }) => {
    const { viewState } = props

    console.log(props)
    return (
        <div>
            <Header state={viewState} />
            <Board state={viewState} />
        </div>
    )
}

const Header: React.FunctionComponent = (props) => {
    const { state } = props

    const headerText = state.isPlayerTurn
        ? state.playerName + "'s turn"
        : "Waiting for " + state.opponentName + "...";

    return (
        <div>
            {headerText}
        </div>
    )
}

const Board: React.FunctionComponent = (props) => {
    const { state } = props

    // TODO: let player take action (if it's their turn)

    return (
        <table className={style.board}>
            {state.board.map((row, i) =>
                <tr>
                    {row.map((col, j) =>
                        <td >{col}</td>
                    )}
                </tr>
            )}
        </table>
    )
}

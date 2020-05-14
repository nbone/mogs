import React, { useEffect, useState } from 'react'
import { GameViewState } from '../../TicTacToe'

// const style = require('./game-view.css')

export const GameView: React.FunctionComponent = (props: { state: GameViewState }) => {
    const { state } = props

    return (
        <div>
            <Header state={state} />
            <Board state={state} />
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
        <table>
            {state.board.map(row => {
                <tr>
                    {row.map(cell => {
                        <td>{cell}</td>
                    })}
                </tr>
            })}
        </table>
    )
}

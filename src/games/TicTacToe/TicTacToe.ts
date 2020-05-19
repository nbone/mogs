// Game engine for Tic-Tac-Toe

export enum TileState {
  Blank = ' ',
  P1 = 'X',
  P2 = 'O'
}

export enum GameStatus {
  NotDone,
  Draw,
  P1Win,
  P2Win
}

export type GameViewState = {
  board: TileState[][],
  isPlayerTurn: boolean,
  playerName: string,
  opponentName: string
}

export class TicTacToeGame {
  private players: string[]
  private boardState: TileState[][]
  private whoseTurn: number
  private status: GameStatus = GameStatus.NotDone
  private boardW: number = 3
  private boardH: number = 3

  constructor (players: string[]) {
    this.players = Array.from(players)
    if (this.players.length !== 2) {
      throw new Error('Not exactly 2 players: ' + players)
    }
    if (this.players[0] === this.players[1]) {
      throw new Error('Both players are the same: ' + players)
    }

    this.boardState = new Array(this.boardW).fill(null).map(() => new Array(this.boardH).fill(TileState.Blank))
    this.whoseTurn = 0
  }

  public act (player: string, action: {x: number, y: number}) {
    const { x, y } = action

    if (player !== this.players[this.whoseTurn]) {
      throw new Error('Invalid player for move: ' + player)
    }
    if (this.boardState[x][y] !== TileState.Blank) {
      throw new Error('Cannot play on a non-blank space')
    }
    this.boardState[x][y] = this.whoseTurn === 0 ? TileState.P1 : TileState.P2

    this.updateStatus()

    if (this.status === GameStatus.NotDone) {
      this.whoseTurn = 1 - this.whoseTurn
    }
  }

  public getGameViewStateForPlayer (player: string): GameViewState {
    if (!this.players.includes(player)) {
      throw new Error('Invalid player: ' + player)
    }

    return {
      board: this.boardState,
      isPlayerTurn: player === this.players[this.whoseTurn],
      playerName: player,
      opponentName: this.players.find(p => p !== player) || ''
    }
  }

  private updateStatus () {
    const winners = [
      [[0,0], [0,1], [0,2]],
      [[1,0], [1,1], [1,2]],
      [[2,0], [2,1], [2,2]],
      [[0,0], [1,0], [2,0]],
      [[0,1], [1,1], [2,1]],
      [[0,2], [1,2], [2,2]],
      [[0,0], [1,1], [2,2]],
      [[0,2], [1,1], [2,0]]
    ]

    for (const coords of winners) {
      const tiles = coords.map(pair => this.boardState[pair[0]][pair[1]])
      if (tiles[0] === TileState.P1 && tiles[1] === TileState.P1 && tiles[2] === TileState.P1) {
        this.status = GameStatus.P1Win
        return
      }
      if (tiles[0] === TileState.P2 && tiles[1] === TileState.P2 && tiles[2] === TileState.P2) {
        this.status = GameStatus.P2Win
        return
      }
    }

    // No winner. If all spaces are taken then it's a draw.
    let countBlanks = 0
    for (let x = 0; x < this.boardW; x++) {
      for (let y = 0; y < this.boardH; y++) {
        if (this.boardState[x][y] === TileState.Blank) {
          countBlanks++
        }
      }
    }

    if (countBlanks === 0) {
      this.status = GameStatus.Draw
    }

    // Game still going
    this.status = GameStatus.NotDone
  }
}

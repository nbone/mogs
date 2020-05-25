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
  opponentName: string,
  playerNumber: number, // 1 = P1; 2 = P2
  status: GameStatus
}

export type GamePlayerAction = {
  row: number,
  col: number
}

function shuffle (array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
}

export class TicTacToeGame {
  private players: string[]
  private boardState: TileState[][]
  private whoseTurn: number
  private status: GameStatus = GameStatus.NotDone
  private boardRows: number = 3
  private boardCols: number = 3

  constructor (players: string[]) {
    this.players = Array.from(players)
    if (this.players.length !== 2) {
      throw new Error('Not exactly 2 players: ' + players)
    }
    if (this.players[0] === this.players[1]) {
      throw new Error('Both players are the same: ' + players)
    }
    shuffle(this.players)

    this.boardState = new Array(this.boardRows).fill(null).map(() => new Array(this.boardCols).fill(TileState.Blank))
    this.whoseTurn = 0
  }

  public act (player: string, action: GamePlayerAction) {
    const { row, col } = action

    if (this.status !== GameStatus.NotDone) {
      throw new Error('Cannot play when game is over! Status: ' + this.status)
    }
    if (player !== this.players[this.whoseTurn]) {
      throw new Error('Invalid player for move: ' + player)
    }
    if (this.boardState[row][col] !== TileState.Blank) {
      throw new Error('Cannot play on a non-blank space')
    }
    this.boardState[row][col] = this.whoseTurn === 0 ? TileState.P1 : TileState.P2

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
      isPlayerTurn: this.status === GameStatus.NotDone && player === this.players[this.whoseTurn],
      playerName: player,
      opponentName: this.players.find(p => p !== player) || '',
      playerNumber: this.players.indexOf(player) + 1,
      status: this.status
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
    for (let r = 0; r < this.boardRows; r++) {
      for (let c = 0; c < this.boardCols; c++) {
        if (this.boardState[r][c] === TileState.Blank) {
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

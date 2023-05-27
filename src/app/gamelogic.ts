export type GameFinishState = {
    winningPiece: string,
    winningSquares: number[],
    isGameOver: boolean,
    isDraw: boolean
}
  
export const DEFAULT_GAME_STATE: GameFinishState = {
    winningPiece: '',
    winningSquares: [],
    isGameOver: false,
    isDraw: false
}
  
function arrayToMatrix<T>(arr: Array<T>, rows: number, columns: number): Array<Array<T>> {
    const matrix: Array<Array<T>> = []

    if(arr.length !== rows * columns && arr.length / rows === columns)
        throw RangeError('Array length and matrix dimensions must be equal')

    for(let i = 0; i < rows; i++)
        matrix.push(arr.slice(i * rows, i * rows + columns))

    return matrix
}

const arrayColumn = (matrix: Array<Array<any>>, column: number) => 
    matrix.map(x => x[column]);

const arrayDiagonal = (matrix: Array<Array<any>>, minor: boolean) =>
    matrix.map((x,index) => x[minor ? matrix[index].length - index - 1 : index])

const allEqual = (arr: any[]) => 
    arr.every(val => val === arr[0])

const range = (start: number, stop: number, step: number) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

export function getWinState(squares: Array<string | null>, boardSize: number): GameFinishState {
    const gridMatrix = arrayToMatrix(squares, boardSize, boardSize)

    const winningSquares: number[] = []

    for(let row = 0; row < boardSize; row++) {
        if(!gridMatrix[row].includes(null) && allEqual(gridMatrix[row]))
            winningSquares.push(...range(row * boardSize, row * boardSize + boardSize - 1, 1))

        for(let col = 0; col < boardSize; col++) {
            const arrColumn = arrayColumn(gridMatrix, col)
            if(!arrColumn.includes(null) && allEqual(arrColumn))
                winningSquares.push(...range(col, (boardSize-1) * boardSize + col, boardSize))
        }
    }

    const majorDiagonal = arrayDiagonal(gridMatrix, false)
    if(!majorDiagonal.includes(null) && allEqual(majorDiagonal))
        winningSquares.push(...range(0, boardSize * boardSize - 1, boardSize + 1))

    const minorDiagonal = arrayDiagonal(gridMatrix, true)
    if(!minorDiagonal.includes(null) && allEqual(minorDiagonal))
        winningSquares.push(...range(boardSize - 1, boardSize * (boardSize - 1), boardSize - 1))

    return {
        winningPiece: squares[winningSquares[0]] ?? '',
        winningSquares: winningSquares,
        isGameOver: !squares.includes(null) || winningSquares.length > 0,
        isDraw: !squares.includes(null) && winningSquares.length === 0
    }
}

function score(
    squares: Array<string | null>, 
    boardSize: number, 
    player: string,
    opponent: string,
    depth: number
): number {
    const state = getWinState(squares, boardSize)

    if(state.winningPiece === player)
        return 10 - depth
    else if(state.winningPiece === opponent)
        return depth - 10 
    else
        return 0
}

function getAllPossibleStates(squares: Array<string | null>, player: string): Map<Array<string | null>, number> {
    const states = new Map<Array<string | null>, number>()

    for(let i = 0; i < squares.length; i++) {
        if(squares[i]) continue

        const newState = squares.slice()
        newState[i] = player
        states.set(newState, i)
    }

    return states
}

function minimax(
    squares: Array<string | null>, 
    boardSize: number, 
    player: string,
    opponent: string,
    maximize: boolean,
    depth: number,
    alpha: number,
    beta: number,
    maxDepth: number = 10
): number {
    if(getWinState(squares, boardSize).isGameOver || depth >= maxDepth) {
        return score(squares, boardSize, player, opponent, depth)
    }

    const states = getAllPossibleStates(squares, player)

    if(maximize) {
        let bestScore = -Infinity
        states.forEach((val, state) => {
            const result = minimax(state, boardSize, opponent, player, false, depth + 1, alpha, beta, maxDepth)
            
            if(result >= bestScore && val != -1) {
                bestScore = result

                if(bestScore >= beta)
                    return

                alpha = Math.max(alpha, bestScore)
            }
        })

        return bestScore
    } else {
        let bestScore = Infinity
        states.forEach((val, state) => {
            const result = minimax(state, boardSize, opponent, player, true, depth + 1, alpha, beta, maxDepth)
            
            if(result <= bestScore && val != -1) {
                bestScore = result

                if(bestScore <= alpha)
                    return

                beta = Math.min(beta, bestScore)
            }
        })
        
        return bestScore
    }
}

export function getBestMove(
    squares: Array<string | null>, 
    boardSize: number, 
    player: string,
    opponent: string,
    maxDepth: number = 100
): number {
    let score = -Infinity
    let bestMove = -1

    getAllPossibleStates(squares, player).forEach((val, state) => {
        let curScore = minimax(state, boardSize, opponent, player, false, 0, -100, 100, maxDepth)

        if(curScore >= score) {
            score = curScore
            bestMove = val
        }
    })

    // Force the stupid algorithm to pick the middle if it's empty
    if(squares.filter(e => e).length <= 1 && !squares[Math.floor(squares.length / 2)])
        return Math.floor(squares.length / 2)

    return bestMove
}
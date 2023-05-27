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

const arrayColumn = (matrix: Array<Array<any>>, column: number) => matrix.map(x => x[column]);
const arrayDiagonal = (matrix: Array<Array<any>>, minor: boolean) => {
    return matrix.map((x,index) => x[minor ? matrix[index].length - index - 1 : index])
}
const allEqual = (arr: any[]) => arr.every(val => val === arr[0])

const range = (start: number, stop: number, step: number) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

export function determineWinner(squares: Array<string | null>, boardSize: number): GameFinishState {
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
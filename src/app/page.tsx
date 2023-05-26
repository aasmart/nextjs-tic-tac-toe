'use client'

import Image from 'next/image'
import styles from './page.module.css'
import { useState } from 'react'
import { isNull } from 'util'

function Square({
  value, 
  onSquareClicked, 
  isWinningSquare, 
  isGameOver,
  squareFlipDelay
}: {
  value: String, 
  onSquareClicked: () => void, 
  isWinningSquare: boolean, 
  isGameOver: boolean,
  squareFlipDelay: number
}) {
  const [isFlipped, setIsFlipped] = useState(false)

  const flip = isFlipped ? 'flip' : ''
  const fade = !isWinningSquare && isGameOver ? 'fade' : ''
  const defaultClass = 'square'
  
  const isDisabled = (value != null) || isGameOver

  if(isWinningSquare)
    setTimeout(() => setIsFlipped(true), squareFlipDelay)
  else if(isFlipped)
    setIsFlipped(false)

  return (
    <button 
      className={`${defaultClass} ${flip} ${fade}`} 
      onClick={ onSquareClicked } 
      data-value={ value}
      disabled={ isDisabled }
    >
      { value }
    </button>
  )
}

function Replay({
  isGameOver,
  onClick
}: {
  isGameOver: boolean,
  onClick: () => void
}) {
  return (
    <button className='replay' disabled={!isGameOver} onClick={onClick}>Replay</button>
  )
}

function Grid({size}: {size: number}) {
  const SQUARE_FLIP_DELAY = 75

  const [isXNext, setIsXNext] = useState(true)
  const [squares, setSquares] = useState(Array(size * size).fill(null))
  const [gameFinishState, setGameFinishState] = useState(DEFAULT_GAME_STATE)

  function handleSquareClick(index: number) {
    if(squares[index] || gameFinishState.isGameOver) return

    const nextSquares = squares.slice() as Array<string | null>
    nextSquares[index] = isXNext ? 'X' : 'O'
    setSquares(nextSquares)

    const winner = determineWinner(size, nextSquares, index)
    if(winner != null) {
      setGameFinishState(winner)
    }

    setIsXNext(!isXNext)
  }

  function handleRestartClick() {
    setIsXNext(true)
    setSquares(Array(size * size).fill(null))
    setGameFinishState(DEFAULT_GAME_STATE)
  }

  let status
  if(gameFinishState.isDraw)
    status = 'The game has ended in a draw!'
  else if(gameFinishState.isGameOver)
    status = `${gameFinishState.winningPiece} has won!`
  else
    status = `Next Player: ${isXNext ? 'X' : 'O'}`

  let numWinningSquares = 0
  const gridSquares = squares.map((val, index) => {
    const isWinning = gameFinishState?.winningSquares.includes(index) || false
    const delay = isWinning ? numWinningSquares * SQUARE_FLIP_DELAY : 0

    if(isWinning) numWinningSquares++

    return <Square 
      value={val} 
      onSquareClicked={() => handleSquareClick(index)} 
      isWinningSquare={isWinning}
      isGameOver={gameFinishState.isGameOver}
      squareFlipDelay={delay}
    />
  })

  return (
    <>
      <h2>{status}</h2>
      <div 
        className="board"
        style={{
          gridTemplateColumns: `repeat(${size}, var(--grid-square-size))`,
          gridTemplateRows: `repeat(${size}, var(--grid-square-size))`
        }}
      >
        {gridSquares}
      </div>
      <Replay isGameOver={gameFinishState.isGameOver} onClick={() => handleRestartClick()}/>
    </>
  )
}

export default function Home() {
  return (
    <Grid size={3} />
  )
}

type GameFinishState = {
  winningPiece: string,
  winningSquares: number[],
  isGameOver: boolean,
  isDraw: boolean
}

const DEFAULT_GAME_STATE: GameFinishState = {
  winningPiece: '',
  winningSquares: [],
  isGameOver: false,
  isDraw: false
}

function matrixToArrayIndex(
  rows: number, 
  row: number, 
  column: number
) {
  return row * rows + column
}

function indexArrayAsMatrix<T>(
  arr: T[], 
  rows: number, columns: number, 
  row: number, column: number
): T {
  if(column >= columns || row >= rows)
    throw new RangeError(`Attempting to index value [${row},${column}] outside of the matrix's dimensios, [${rows},${columns}]`)

  return arr[row * rows + column]
}

function determineWinner(
  size: number, 
  squares: Array<string | null>, 
  placedIndex: number
): GameFinishState {
  if(size * size != squares.length)
    return DEFAULT_GAME_STATE

  const piece = squares[placedIndex]

  if(!piece)
    return DEFAULT_GAME_STATE

  const row = Math.floor(placedIndex / size)
  const column = placedIndex - row * size

  const checkVertical = Array(size).fill(null)
  const checkHorizontal = Array(size).fill(null)
  const downDiagonal = Array(size).fill(null)
  const upDiagonal = Array(size).fill(null)

  for(let i = 0; i < size; i++) {
    if(indexArrayAsMatrix(squares, size, size, i, column) === piece)
      checkVertical[i] = matrixToArrayIndex(size, i, column)

    if(indexArrayAsMatrix(squares, size, size, row, i) === piece)
      checkHorizontal[i] = matrixToArrayIndex(size, row, i)
  }

  for(let i = 0; i < size; i++) {
    if(indexArrayAsMatrix(squares, size, size, i, i) === piece)
      downDiagonal[i] = matrixToArrayIndex(size, i, i)

    if(indexArrayAsMatrix(squares, size, size, i, (size - 1) - i) === piece)
      upDiagonal[i] = matrixToArrayIndex(size, i, (size - 1) - i)
  }

  let winningSquares: number[] = [];
  if(!checkVertical.includes(null))
    winningSquares = winningSquares.concat(checkVertical)
  if(!checkHorizontal.includes(null))
    winningSquares = winningSquares.concat(checkHorizontal)
  if(!downDiagonal.includes(null))
    winningSquares = winningSquares.concat(downDiagonal)
  if(!upDiagonal.includes(null))
    winningSquares = winningSquares.concat(upDiagonal)

  if(winningSquares.length === 0)
    return {
      winningPiece: '',
      winningSquares: [],
      isGameOver: !squares.includes(null),
      isDraw: !squares.includes(null)
    }

  return {
    winningPiece: piece,
    winningSquares: winningSquares,
    isGameOver: true,
    isDraw: false
  }
}
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
  const defaultClass = 'square'
  
  const isDisabled = (value != null) || isGameOver

  if(isWinningSquare)
    setTimeout(() => setIsFlipped(true), squareFlipDelay)

  return (
    <button 
      className={`${defaultClass} ${flip}`} 
      onClick={ onSquareClicked } 
      data-value={ value}
      disabled={ isDisabled }
    >
      { value }
    </button>
  )
}

function Grid({size}: {size: number}) {
  const SQUARE_FLIP_DELAY = 75

  const [isXNext, setIsXNext] = useState(true)
  const [squares, setSquares] = useState(Array(size * size).fill(null))
  const [gameWinner, setGameWinner] = useState<GameWinner | null>(null)

  function handleClick(index: number) {
    if(squares[index] || gameWinner) return

    const nextSquares = squares.slice() as Array<string | null>
    nextSquares[index] = isXNext ? 'X' : 'O'
    setSquares(nextSquares)

    const winner = determineWinner(size, nextSquares, index)
    if(winner != null)
      setGameWinner(winner)

    setIsXNext(!isXNext)
  }

  let status
  if(gameWinner)
    status = `${gameWinner.piece} has won!`
  else if(!gameWinner && !squares.includes(null))
    status = 'The game has ended in a draw!'
  else
    status = `Next Player: ${isXNext ? 'X' : 'O'}`

  let numWinningSquares = 0
  const gridSquares = squares.map((val, index) => {
    const isWinning = gameWinner?.squares.includes(index) || false
    const delay = isWinning ? numWinningSquares * SQUARE_FLIP_DELAY : 0

    if(isWinning) numWinningSquares++

    return <Square 
      value={val} 
      onSquareClicked={() => handleClick(index)} 
      isWinningSquare={isWinning}
      isGameOver={gameWinner !== null}
      squareFlipDelay={delay}
    />
  })

  return (
    <>
      <h2>{status}</h2>
      <div className="board">
        {gridSquares}
      </div>
    </>
  )
}

export default function Home() {
  return (
    <Grid size={3} />
  )
}

type GameWinner = {
  piece: string,
  squares: number[]
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
): GameWinner | null {
  if(size * size != squares.length)
    return null

  const piece = squares[placedIndex]

  if(!piece)
    return null

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
    return null

  return {
    piece: piece,
    squares: winningSquares
  }
}
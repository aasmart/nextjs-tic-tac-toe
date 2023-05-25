'use client'

import Image from 'next/image'
import styles from './page.module.css'
import { useState } from 'react'

function Square(
  {value, onSquareClicked, isWinningTile}: 
  {value: String, onSquareClicked: () => void, isWinningTile: boolean}
) {
  const flip = isWinningTile ? 'flip' : ''
  const defaultName = 'square'

  return (
    <button 
      className={`${defaultName} ${flip}`} 
      onClick={ onSquareClicked } 
      data-value={ value}
    >
      { value }
    </button>
  )
}

function Grid({size}: {size: number}) {
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
  else
    status = `Next Player: ${isXNext ? 'X' : 'O'}`

  const gridSquares = squares.map((val, index) => {
    return <Square 
      value={val} 
      onSquareClicked={() => handleClick(index)} 
      isWinningTile={gameWinner?.squares.includes(index) || false}
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

  let winningTitles: number[] = [];
  if(!checkVertical.includes(null))
    winningTitles = winningTitles.concat(checkVertical)
  if(!checkHorizontal.includes(null))
    winningTitles = winningTitles.concat(checkHorizontal)
  if(!downDiagonal.includes(null))
    winningTitles = winningTitles.concat(downDiagonal)
  if(!upDiagonal.includes(null))
    winningTitles = winningTitles.concat(upDiagonal)

  if(winningTitles.length === 0)
    return null

  return {
    piece: piece,
    squares: winningTitles
  }
}
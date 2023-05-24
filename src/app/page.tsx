'use client'

import Image from 'next/image'
import styles from './page.module.css'
import { useState } from 'react'

function Square({value, onSquareClicked}: {value: String, onSquareClicked: () => void}) {
  return (
    <button className="flip" onClick={ onSquareClicked }>{ value }</button>
  )
}

function Grid({size}: {size: number}) {
  const [isXNext, setIsXNext] = useState(true)
  const [squares, setSquares] = useState(Array(size * size).fill(null))
  const [gameWinner, setGameWinner] = useState<Winner | null>(null)

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
    return <Square value={val} onSquareClicked={() => handleClick(index)}/>
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

type Winner = {
  piece: string,
  squares: number[]
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

function determineWinner(size: number, squares: Array<string | null>, placedIndex: number): Winner | null {
  if(size * size != squares.length)
    return null

  const piece = squares[placedIndex]

  if(!piece)
    return null

  const row = Math.floor(placedIndex / size)
  const column = placedIndex - row * size

  const toIndex = 
    (rows: number, row: number, column: number) => row * rows + column

  const checkVertical = Array(size).fill(-1)
  const checkHorizontal = Array(size).fill(-1)
  const downDiagonal = Array(size).fill(-1)
  const upDiagonal = Array(size).fill(-1)

  for(let i = 0; i < size; i++) {
    if(indexArrayAsMatrix(squares, size, size, i, column) === piece)
      checkVertical[i] = toIndex(size, i, column)

    if(indexArrayAsMatrix(squares, size, size, row, i) === piece)
      checkHorizontal[i] = toIndex(size, row, i)
  }

  for(let i = 0; i < size; i++) {
    if(indexArrayAsMatrix(squares, size, size, i, i) === piece)
      downDiagonal[i] = toIndex(size, i, i)

    if(indexArrayAsMatrix(squares, size, size, i, (size - 1) - i) === piece)
      upDiagonal[i] = toIndex(size, i, (size - 1) - i)
  }

  let winningTitles: number[] = [];
  if(checkVertical.find(e => e == -1) !== -1)
    winningTitles = winningTitles.concat(checkVertical)
  if(checkHorizontal.find(e => e == -1) !== -1)
    winningTitles = winningTitles.concat(checkHorizontal)
  if(downDiagonal.find(e => e == -1) !== -1)
    winningTitles = winningTitles.concat(downDiagonal)
  if(upDiagonal.find(e => e == -1) !== -1)
    winningTitles = winningTitles.concat(upDiagonal)

  console.log(winningTitles)

  if(winningTitles.length === 0)
    return null

  return {
    piece: piece,
    squares: winningTitles
  }
}
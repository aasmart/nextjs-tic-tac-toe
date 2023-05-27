'use client'

import { useState, useRef } from 'react'
import { GameFinishState, DEFAULT_GAME_STATE, getWinState, getBestMove } from './gamelogic'

function Square({
  value, 
  onSquareClicked, 
  isWinningSquare, 
  isGameOver,
  squareFlipDelay,
  index,
  reset
}: {
  value: string, 
  onSquareClicked: () => void, 
  isWinningSquare: boolean, 
  isGameOver: boolean,
  squareFlipDelay: number,
  index: number,
  reset: boolean
}) {
  const RESET_FLIP_DELAY = 50

  const [isFlipping, setIsFlipping] = useState(false)
  const [isFaded, setIsFaded] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const doReset= useRef(false)
  const resetValue = useRef<string | null>(null)
  const button = useRef<HTMLButtonElement | null>(null)

  const flip = isResetting ? 'flip-reset' : (isFlipping ? 'flip' : '')
  const fade = isFaded ? 'fade' : ''
  const defaultClass = 'square'
  
  const isDisabled = (value != null) || isGameOver

  if(reset && !doReset.current) {
    doReset.current = true

    setTimeout(() => {
      resetValue.current = null
      setIsFlipping(false)
      setIsFaded(false)
      setIsResetting(true)

      button.current?.addEventListener('animationend', e => {
        setIsResetting(false)
      })
    }, index * RESET_FLIP_DELAY)
  } 
  
  if(!isFlipping && isWinningSquare) {
    setTimeout(() => setIsFlipping(true), squareFlipDelay)
  } else if(!isFaded && !isWinningSquare && isGameOver) {
    setIsFaded(true)
  }

  if(!reset && !isResetting)
    doReset.current = false

  if(!doReset.current)
    resetValue.current = value

  return (
    <button 
      className={`${defaultClass} ${flip} ${fade}`} 
      onClick={ onSquareClicked } 
      data-value={ resetValue.current }
      disabled={ isDisabled }
      ref={button}
    >
      {resetValue.current}
    </button>
  )
}

function Restart({
  onClick,
  isBoardEmpty,
}: {
  onClick: () => void,
  isBoardEmpty: boolean
}) {
  return (
    <button className='restart' disabled={isBoardEmpty} onClick={onClick}>Restart Game</button>
  )
}

function Grid({size}: {size: number}) {
  const SQUARE_FLIP_DELAY = 75

  const [isXNext, setIsXNext] = useState(true)
  const [squares, setSquares] = useState(Array(size * size).fill(null))
  const [gameFinishState, setGameFinishState] = useState(DEFAULT_GAME_STATE)
  const reset = useRef(Array(size * size).fill(false))

  function handleSquareClick(index: number) {
    if(squares[index] || gameFinishState.isGameOver || reset.current.includes(true)) return

    const nextSquares = squares.slice() as Array<string | null>
    nextSquares[index] = isXNext ? 'X' : 'O'
    setSquares(nextSquares)

    const winner = getWinState(nextSquares, size)
    if(winner != null) {
      setGameFinishState(winner)
    }

    setIsXNext(!isXNext)
  }

  function handleReplayClick() {
    setIsXNext(true)
    setGameFinishState(DEFAULT_GAME_STATE)
    setSquares(Array(size * size).fill(null))
    reset.current = reset.current.fill(true)
  }

  if(!isXNext) {
    const pos = getBestMove(squares, size, 'O', 'X', 10)
    handleSquareClick(pos)
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

    const doReset = reset.current[index]
    if(doReset)
      reset.current[index] = false

    return <Square 
      key={index}
      value={val} 
      onSquareClicked={() => handleSquareClick(index)} 
      isWinningSquare={isWinning}
      isGameOver={gameFinishState.isGameOver}
      squareFlipDelay={delay}
      index={index}
      reset={doReset}
    />
  })

  return (
    <main>
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
      <div className='inputs'>
        <Restart 
          isBoardEmpty={!squares.some(e => e !== null)} 
          onClick={() => handleReplayClick()}/>
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <Grid size={3} />
  )
}
import React, { useState, useEffect, useCallback, useRef } from 'react';

const Game2048 = () => {
  const [board, setBoard] = useState(() => initializeBoard());
  const [score, setScore] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [showDemo, setShowDemo] = useState(true);
  const [demoStep, setDemoStep] = useState(0);
  const [demoBoard, setDemoBoard] = useState([
    [2, 0, 0, 0],
    [2, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]);

  function initializeBoard() {
    const newBoard = Array(4).fill().map(() => Array(4).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    return newBoard;
  }

  function addRandomTile(board) {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) {
          emptyCells.push({ row: i, col: j });
        }
      }
    }
    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      board[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  function moveLeft(board) {
    const newBoard = board.map(row => [...row]);
    let moved = false;
    let scoreGained = 0;

    for (let i = 0; i < 4; i++) {
      const row = newBoard[i].filter(cell => cell !== 0);
      
      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          scoreGained += row[j];
          row[j + 1] = 0;
          if (row[j] === 2048) setGameWon(true);
        }
      }
      
      const filteredRow = row.filter(cell => cell !== 0);
      while (filteredRow.length < 4) {
        filteredRow.push(0);
      }
      
      for (let j = 0; j < 4; j++) {
        if (newBoard[i][j] !== filteredRow[j]) {
          moved = true;
        }
        newBoard[i][j] = filteredRow[j];
      }
    }

    return { board: newBoard, moved, scoreGained };
  }

  function rotateBoard(board) {
    const newBoard = Array(4).fill().map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        newBoard[j][3 - i] = board[i][j];
      }
    }
    return newBoard;
  }

  function move(direction) {
    if (gameOver) return;

    let currentBoard = board.map(row => [...row]);
    let result;

    switch (direction) {
      case 'left':
        result = moveLeft(currentBoard);
        break;
      case 'right':
        currentBoard = rotateBoard(rotateBoard(currentBoard));
        result = moveLeft(currentBoard);
        result.board = rotateBoard(rotateBoard(result.board));
        break;
      case 'up':
        currentBoard = rotateBoard(rotateBoard(rotateBoard(currentBoard)));
        result = moveLeft(currentBoard);
        result.board = rotateBoard(result.board);
        break;
      case 'down':
        currentBoard = rotateBoard(currentBoard);
        result = moveLeft(currentBoard);
        result.board = rotateBoard(rotateBoard(rotateBoard(result.board)));
        break;
    }

    if (result.moved) {
      addRandomTile(result.board);
      setBoard(result.board);
      setScore(prev => prev + result.scoreGained);
      
      if (isGameOver(result.board)) {
        setGameOver(true);
      }
    }
  }

  function isGameOver(board) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) return false;
      }
    }

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (
          (i < 3 && board[i][j] === board[i + 1][j]) ||
          (j < 3 && board[i][j] === board[i][j + 1])
        ) {
          return false;
        }
      }
    }
    return true;
  }

  const handleKeyPress = useCallback((e) => {
    if (showDemo) return;
    if (e.key === 'ArrowLeft') move('left');
    if (e.key === 'ArrowRight') move('right');
    if (e.key === 'ArrowUp') move('up');
    if (e.key === 'ArrowDown') move('down');
  }, [board, showDemo]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const handleTouchStart = (e) => {
    if (showDemo) return;
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchEnd = (e) => {
    if (showDemo || !touchStart.x || !touchStart.y) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };

    const diffX = touchStart.x - touchEnd.x;
    const diffY = touchStart.y - touchEnd.y;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) move('left');
      else move('right');
    } else {
      if (diffY > 0) move('up');
      else move('down');
    }

    setTouchStart({ x: 0, y: 0 });
  };

  const resetGame = () => {
    setBoard(initializeBoard());
    setScore(0);
    setGameWon(false);
    setGameOver(false);
  };

  const getTileColor = (value) => {
    const colors = {
      0: 'bg-gray-200',
      2: 'bg-pink-200 text-pink-800',
      4: 'bg-pink-300 text-pink-900',
      8: 'bg-purple-300 text-purple-900',
      16: 'bg-purple-400 text-white',
      32: 'bg-blue-400 text-white',
      64: 'bg-blue-500 text-white',
      128: 'bg-green-400 text-white',
      256: 'bg-green-500 text-white',
      512: 'bg-yellow-400 text-white',
      1024: 'bg-orange-400 text-white',
      2048: 'bg-red-500 text-white'
    };
    return colors[value] || 'bg-red-600 text-white';
  };

  const nextDemoStep = () => {
    if (demoStep === 0) {
      // Show swipe up demo
      setDemoBoard([
        [4, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]);
      setDemoStep(1);
    } else if (demoStep === 1) {
      // Show adding new tile
      setDemoBoard([
        [4, 0, 0, 2],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]);
      setDemoStep(2);
    } else {
      setShowDemo(false);
    }
  };

  const FloatingStars = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={`absolute text-2xl animate-bounce`}
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 80 + 10}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${2 + Math.random()}s`
          }}
        >
          {['⭐', '✨', '🌟', '💫', '🎀', '🦄'][i]}
        </div>
      ))}
    </div>
  );

  if (showDemo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-4 flex flex-col items-center justify-center relative">
        <FloatingStars />
        
        <div className="max-w-md w-full text-center relative z-10">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-purple-800 mb-4 animate-pulse transform-gpu">
              🎮 2048 🎮
            </h1>
            <p className="text-2xl text-purple-600 font-bold mb-2">
              Welcome Nariman! 👑
            </p>
            <p className="text-lg text-purple-500">
              From Baba Khaled with love 💕
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-2xl mb-6 transform-gpu">
            <h2 className="text-xl font-bold text-purple-700 mb-4">
              {demoStep === 0 && "👆 Swipe UP to combine tiles!"}
              {demoStep === 1 && "🎉 Great! They became 4!"}
              {demoStep === 2 && "✨ A new tile appears!"}
            </h2>
            
            <div className="bg-gray-300 rounded-lg p-3 mb-4">
              <div className="grid grid-cols-4 gap-3">
                {demoBoard.flat().map((cell, index) => (
                  <div
                    key={index}
                    className={`
                      aspect-square rounded-lg flex items-center justify-center text-xl font-bold
                      transition-all duration-500 transform-gpu hover:scale-105
                      ${getTileColor(cell)}
                      ${cell !== 0 ? 'animate-pulse shadow-lg' : ''}
                      ${demoStep === 0 && (index === 0 || index === 4) ? 'animate-bounce border-4 border-yellow-400' : ''}
                      ${demoStep === 1 && index === 0 ? 'animate-bounce border-4 border-green-400' : ''}
                      ${demoStep === 2 && index === 3 ? 'animate-bounce border-4 border-blue-400' : ''}
                    `}
                    style={{
                      transform: cell !== 0 ? 'perspective(1000px) rotateY(10deg)' : '',
                      boxShadow: cell !== 0 ? '0 10px 20px rgba(0,0,0,0.1)' : ''
                    }}
                  >
                    {cell !== 0 && cell}
                  </div>
                ))}
              </div>
            </div>

            {demoStep === 0 && (
              <div className="text-center mb-4">
                <div className="text-4xl animate-bounce mb-2">👆</div>
                <p className="text-purple-600">The two 2's will combine to make 4!</p>
              </div>
            )}

            <button
              onClick={nextDemoStep}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {demoStep < 2 ? "Next! ➡️" : "Let's Play! 🚀"}
            </button>
          </div>

          <div className="text-purple-600 text-lg font-medium">
            <p className="mb-2">🎯 Goal: Reach 2048!</p>
            <p>📱 Swipe to move tiles</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-4 flex flex-col items-center justify-center relative">
      <FloatingStars />
      
      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-purple-800 mb-2 transform-gpu hover:scale-105 transition-transform">
            🎮 2048 🎮
          </h1>
          <p className="text-lg text-purple-600 font-medium">For Princess Nariman 👑</p>
          <p className="text-sm text-purple-500">From Baba Khaled 💕</p>
        </div>

        {/* Score */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-2xl transform-gpu">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Score</p>
              <p className="text-2xl font-bold text-purple-800 transform-gpu hover:scale-110 transition-transform">
                {score}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDemo(true)}
                className="bg-blue-500 text-white px-3 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm"
              >
                📚 Demo
              </button>
              <button
                onClick={resetGame}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-600 transition-colors"
              >
                🔄 New Game
              </button>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div 
          className="bg-gray-300 rounded-xl p-3 shadow-2xl transform-gpu hover:shadow-3xl transition-shadow"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="grid grid-cols-4 gap-3">
            {board.flat().map((cell, index) => (
              <div
                key={index}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-xl font-bold
                  transition-all duration-300 transform-gpu hover:scale-105
                  ${getTileColor(cell)}
                  ${cell !== 0 ? 'shadow-lg' : ''}
                `}
                style={{
                  transform: cell !== 0 ? 'perspective(1000px) rotateY(5deg)' : '',
                  boxShadow: cell !== 0 ? '0 8px 16px rgba(0,0,0,0.1)' : ''
                }}
              >
                {cell !== 0 && (
                  <span className="transform-gpu hover:rotate-12 transition-transform">
                    {cell}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center text-sm text-purple-600">
          <p className="mb-2">📱 Swipe to move tiles!</p>
          <p>🎯 Combine numbers to reach 2048!</p>
        </div>

        {/* Game Status */}
        {gameWon && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 text-center max-w-sm mx-4 shadow-2xl transform-gpu animate-bounce">
              <h2 className="text-4xl font-bold text-green-600 mb-4">🎉 YOU WON! 🎉</h2>
              <p className="text-xl text-gray-700 mb-4">
                Amazing job, Princess Nariman! 👑✨
              </p>
              <p className="text-lg text-purple-600 mb-6">
                You reached 2048! 🏆
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setGameWon(false)}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:scale-105 transition-transform"
                >
                  Keep Playing! 🚀
                </button>
                <button
                  onClick={resetGame}
                  className="bg-purple-500 text-white px-6 py-2 rounded-lg font-medium hover:scale-105 transition-transform"
                >
                  New Game 🎮
                </button>
              </div>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 text-center max-w-sm mx-4 shadow-2xl">
              <h2 className="text-3xl font-bold text-red-600 mb-4">Game Over 😢</h2>
              <p className="text-lg text-gray-700 mb-4">
                Great try, Nariman! 🌟
              </p>
              <p className="text-xl text-purple-600 mb-6">
                Final score: {score} 🏆
              </p>
              <button
                onClick={resetGame}
                className="bg-purple-500 text-white px-6 py-2 rounded-lg font-medium hover:scale-105 transition-transform"
              >
                Try Again! 🎮
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game2048;

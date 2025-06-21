const boardEl = document.getElementById('board'),
      msgEl = document.getElementById('message'),
      modeSel = document.getElementById('mode'),
      diffSel = document.getElementById('difficulty'),
      diffWrapper = document.getElementById('difficulty-wrapper'),
      restartBtn = document.getElementById('restart'),
      clickSound = document.getElementById('click-sound'),
      winSound = document.getElementById('win-sound'),
      drawSound = document.getElementById('draw-sound');
      backgrownSound = document.getElementById('bg-sound');

let cells = Array(9).fill('');
let gameActive = true;
let currentPlayer = 'X';
let mode = modeSel.value;
let difficulty = diffSel.value;

modeSel.addEventListener('change', () => {
  mode = modeSel.value;
  diffWrapper.style.display = mode === 'single' ? '' : 'none';
  restartGame();
});

diffSel.addEventListener('change', () => { 
  difficulty = diffSel.value; 
  restartGame();
});

restartBtn.addEventListener('click', restartGame);

function drawBoard() {
  backgrownSound.play();
  boardEl.innerHTML = '';
  cells.forEach((c,i) => {
    const div = document.createElement('div');
    div.className = 'cell' + (c? ' taken':'');
    div.textContent = c;
    div.addEventListener('click', () => handleClick(i));
    boardEl.appendChild(div);
    
  });
}

function handleClick(idx) {
  if (!gameActive || cells[idx] !== '') return;
  makeMove(idx, currentPlayer);
  clickSound.play();

  if (checkWinner(currentPlayer)) return endGame(currentPlayer);
  if (isDraw()) return endGame();

  if (mode === 'multi') {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    msgEl.textContent = `Turn: ${currentPlayer}`;
  } else {
    setTimeout(() => aiTurn(), 500);
  }
}

function aiTurn() {
  let idx;
  const avail = cells.map((v,i)=> v===''?i:null).filter(i=>i!==null);

  if (difficulty==='easy') {
    idx = avail[Math.floor(Math.random()*avail.length)];
  } else {
    const best = minimax(cells.slice(), 'O', difficulty);
    idx = best.index;
  }

  makeMove(idx, 'O');
  clickSound.play();

  if (checkWinner('O')) return endGame('O');
  if (isDraw()) return endGame();
}

function makeMove(idx, player) {
  cells[idx] = player;
  drawBoard();
  
}

function endGame(winner) {
  gameActive = false;
  if (winner) {
    msgEl.textContent = winner === 'X'? '🎉 Player X Wins!': winner==='O'&&mode==='multi'? '🎉 Player O Wins!':'🤖 Computer Wins!';
    
    winSound.play();
  } else {
    msgEl.textContent = '🤝 Draw!';
    drawSound.play();
  }
}

function checkWinner(p) {
  const combos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return combos.some(c => c.every(i=>cells[i]===p));
}

function isDraw() { return cells.every(c=>c!==''); }

function restartGame() {
  cells.fill('');
  gameActive = true;
  currentPlayer = 'X';
  msgEl.textContent = mode==='multi'? `Turn: ${currentPlayer}` : 'Your Turn!';
  drawBoard();
}

function minimax(boardState, player, difficulty) {
  const avail = boardState.map((v,i)=> v===''?i:null).filter(i=>i!==null);

  if (checkArrWin(boardState,'X')) return {score:-10};
  if (checkArrWin(boardState,'O')) return {score:10};
  if (avail.length===0) return {score:0};

  let moves = avail.map(i => {
    const state = boardState.slice();
    state[i] = player;
    const next = minimax(state, player==='O'?'X':'O', difficulty);
    return {index:i, score: next.score};
  });

  if (player==='O') {
    return moves.reduce((a,b)=> b.score>a.score? b:a);
  } else {
    if (difficulty === 'hard') {
      return moves.reduce((a,b)=> b.score<a.score? b:a);
    } else {
      // medium: random pick among top 3
      const sorted = moves.sort((a,b)=> a.score-b.score);
      const top3 = sorted.slice(0,3);
      return top3[Math.floor(Math.random()*top3.length)];
    }
  }
}

function checkArrWin(arr,p) {
  const combos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return combos.some(c=> c.every(i=>arr[i]===p));
}

// init
diffWrapper.style.display = mode==='single'? '' : 'none';
msgEl.textContent = mode==='multi'? `Turn: ${currentPlayer}` : 'Your Turn!';
drawBoard();
 

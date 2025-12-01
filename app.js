const board = document.querySelectorAll('.box');
const restartBtn = document.querySelector('.resetbtn');
const difficulty = document.querySelector('.difficulty');
const result = document.querySelector('.result');

let gameBoard = ["", "", "", "", "", "", "", "", ""]; // 9 cells
let gameActive = true;

const HUMAN = "X";
const BOT = "O";

const winPatterns = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

// PLAYER CLICK
board.forEach(box => {
  box.addEventListener("click", () => playerMove(box));
});

function playerMove(box) {
  let index = box.dataset.index;

  if (gameBoard[index] !== "" || !gameActive) return;

  gameBoard[index] = HUMAN;
  box.innerHTML = "X";
  box.classList.add("x");

  if (checkWinner(HUMAN)) return endGame("You Win!");
  if (isDraw()) return endGame("Draw!");

  setTimeout(botMove, 200); // small delay for realistic bot
}

// BOT MOVE
function botMove() {
  let level = difficulty.value;
  let index;

  if (level === "easy") index = botEasy();
  else if (level === "medium") index = botMedium();
  else index = bestMove(); // HARD mode

  gameBoard[index] = BOT;
  let box = document.querySelector(`.box[data-index="${index}"]`);
  box.innerHTML = "O";
  box.classList.add("o");

  if (checkWinner(BOT)) return endGame("Bot Wins!");
  if (isDraw()) return endGame("Draw!");
}

// EASY – Random Move
function botEasy() {
  let empty = gameBoard
    .map((v, i) => v === "" ? i : null)
    .filter(v => v !== null);

  return empty[Math.floor(Math.random() * empty.length)];
}

// MEDIUM – 50% random + 50% best move
function botMedium() {
  if (Math.random() < 0.5) return botEasy();
  return bestMove();
}

// HARD – Minimax
function bestMove() {
  let bestScore = -Infinity;
  let move;

  for (let i = 0; i < 9; i++) {
    if (gameBoard[i] === "") {
      gameBoard[i] = BOT;
      let score = minimax(gameBoard, 0, false);
      gameBoard[i] = "";

      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }

  return move;
}

// MINIMAX ALGORITHM
function minimax(boardState, depth, isMaximizing) {
  if (checkWin(BOT, boardState)) return 10 - depth;
  if (checkWin(HUMAN, boardState)) return depth - 10;
  if (boardState.every(v => v !== "")) return 0;

  if (isMaximizing) {
    let best = -Infinity;

    for (let i = 0; i < 9; i++) {
      if (boardState[i] === "") {
        boardState[i] = BOT;
        best = Math.max(best, minimax(boardState, depth + 1, false));
        boardState[i] = "";
      }
    }
    return best;

  } else {
    let best = Infinity;

    for (let i = 0; i < 9; i++) {
      if (boardState[i] === "") {
        boardState[i] = HUMAN;
        best = Math.min(best, minimax(boardState, depth + 1, true));
        boardState[i] = "";
      }
    }
    return best;
  }
}

// CHECK WIN (for actual game)
function checkWinner(player) {
  return winPatterns.some(pattern =>
    pattern.every(i => gameBoard[i] === player)
  );
}

// CHECK WIN (for minimax)
function checkWin(player, arr) {
  return winPatterns.some(pattern =>
    pattern.every(i => arr[i] === player)
  );
}

function isDraw() {
  return gameBoard.every(box => box !== "");
}

function endGame(msg) {
    gameActive = false;
    result.innerHTML = msg;

    if (msg === "You Win!") {
        celebrationEffect(); // call confetti
    } else if (msg === "Bot Wins!") {
        sadEffect(); // call sad animation
    }
}

// RESET GAME
restartBtn.addEventListener("click", () => {
  gameBoard = ["", "", "", "", "", "", "", "", ""]; // FIXED 9 cells
  gameActive = true;
  result.innerHTML = "";

  board.forEach(c => {
    c.innerHTML = "";
    c.classList.remove("x", "o");
  });
});




function celebrationEffect() {
  let confettiBox = document.createElement("div");
  confettiBox.classList.add("confetti");
  document.body.appendChild(confettiBox);

  for (let i = 0; i < 50; i++) {
    let piece = document.createElement("div");
    piece.classList.add("confetti-piece");
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.setProperty("--hue", Math.random() * 360);
    piece.style.animationDuration = (2 + Math.random() * 2) + "s";
    confettiBox.appendChild(piece);
  }

  setTimeout(() => confettiBox.remove(), 3000);
}

function sadEffect() {
  // Vibration for 500ms
  if (navigator.vibrate) {
    navigator.vibrate(500);
  }

  // Add blue overlay
  const overlay = document.createElement("div");
  overlay.classList.add("sad-overlay");
  document.body.appendChild(overlay);

  // Screen shake
  document.body.classList.add("shake");
  setTimeout(() => document.body.classList.remove("shake"), 500);

  // Falling sad emojis
  for (let i = 0; i < 20; i++) {
    const emoji = document.createElement("div");
    emoji.classList.add("sademoji");
    emoji.textContent = "😢";
    emoji.style.left = Math.random() * 100 + "vw";
    emoji.style.animationDelay = (Math.random() * 1) + "s";
    document.body.appendChild(emoji);
    setTimeout(() => emoji.remove(), 3000);
  }

  // Remove overlay after 3s
  setTimeout(() => overlay.remove(), 3000);
}
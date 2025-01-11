const boardElement = document.getElementById("board");
const blackScoreElement = document.getElementById("black-score");
const whiteScoreElement = document.getElementById("white-score");
const turnIndicatorElement = document.getElementById("turn-indicator");
const winnerMessageElement = document.getElementById("winner-message");
const noMovesElement = document.getElementById("no-moves");

const BOARD_SIZE = 8;
let board = [];
let currentTurn = "black";
let characterPool = [];
let initialCharacters = {}; // Track initial characters per square

// Hiragana pools (as before)
const hiraganaOnly = [
    "あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ",
    "さ", "し", "す", "せ", "そ", "た", "ち", "つ", "て", "と",
    "な", "に", "ぬ", "ね", "の", "は", "ひ", "ふ", "へ", "ほ",
    "ま", "み", "む", "め", "も", "や", "ゆ", "よ", "ら", "り",
    "る", "れ", "ろ", "わ", "を", "ん"
];
const hiraganaWithTenTen = [
    "が", "ぎ", "ぐ", "げ", "ご", "ざ", "じ", "ず", "ぜ", "ぞ", 
    "だ", "ぢ", "づ", "で", "ど", "ば", "び", "ぶ", "べ", "ぼ", 
];
const hiraganaWithMaru = [
    "ぱ", "ぴ", "ぷ", "ぺ", "ぽ"
];

// Katakana pools (as before)
const katakanaOnly = [
    "ア", "イ", "ウ", "エ", "オ", "カ", "キ", "ク", "ケ", "コ",
    "サ", "シ", "ス", "セ", "ソ", "タ", "チ", "ツ", "テ", "ト",
    "ナ", "ニ", "ヌ", "ネ", "ノ", "ハ", "ヒ", "フ", "ヘ", "ホ",
    "マ", "ミ", "ム", "メ", "モ", "ヤ", "ユ", "ヨ", "ラ", "リ",
    "ル", "レ", "ロ", "ワ", "ヲ", "ン"
];
const katakanaWithTenTen = [
    "ガ", "ギ", "グ", "ゲ", "ゴ", "ザ", "ジ", "ズ", "ゼ", "ゾ", 
    "ダ", "ヂ", "ヅ", "デ", "ド", "バ", "ビ", "ブ", "ベ", "ボ", 
];
const katakanaWithMaru = [
    "パ", "ピ", "プ", "ペ", "ポ"
];

// Initialize game settings
let characterType = 'hiragana'; // Default character type (hiragana)
let isTentenOn = false;
let isMaruOn = false;

// Event listeners for settings
document.getElementById("character-type").addEventListener("change", handleCharacterTypeChange);
document.getElementById("tenten").addEventListener("change", updateSettings);
document.getElementById("maru").addEventListener("change", updateSettings);

function handleCharacterTypeChange(event) {
    characterType = event.target.value;
    updateSettings();
}

function updateSettings() {
    isTentenOn = document.getElementById("tenten").checked;
    isMaruOn = document.getElementById("maru").checked;
    updateCharacterPool();
}

function updateCharacterPool() {
    let pool = [];

    // Logic for updating the character pool based on selected settings
    if (characterType === "hiragana") {
        pool = [...hiraganaOnly];

        if (isTentenOn) pool = pool.concat(hiraganaWithTenTen);
        if (isMaruOn) pool = pool.concat(hiraganaWithMaru);
    } else if (characterType === "katakana") {
        pool = [...katakanaOnly];

        if (isTentenOn) pool = pool.concat(katakanaWithTenTen);
        if (isMaruOn) pool = pool.concat(katakanaWithMaru);
    } else if (characterType === "both") {
        // Include both Hiragana and Katakana based on toggles
        pool = [...hiraganaOnly, ...katakanaOnly];

        if (isTentenOn) pool = pool.concat(hiraganaWithTenTen, katakanaWithTenTen);
        if (isMaruOn) pool = pool.concat(hiraganaWithMaru, katakanaWithMaru);
    }

    characterPool = pool;  // Update the pool
    renderBoard(true);  // Re-render board when settings change
}

function getRandomCharacter() {
    // Ensure each square gets a character, with at most two occurrences
    let availablePool = [...characterPool];
    let charCount = {};

    // Count the occurrences of each character on the board
    board.forEach(row => row.forEach(cell => {
        if (cell) {
            charCount[cell] = (charCount[cell] || 0) + 1;
        }
    }));

    // Filter available characters to ensure none appear more than twice
    availablePool = availablePool.filter(char => (charCount[char] || 0) < 2);

    return availablePool[Math.floor(Math.random() * availablePool.length)];
}

function initializeBoard() {
    board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    board[3][3] = "white";
    board[3][4] = "black";
    board[4][3] = "black";
    board[4][4] = "white";
    initialCharacters = {}; // Clear initial characters

    updateCharacterPool();  // Initialize the character pool
    renderBoard(true);  // First rendering of the board
    updateScore();
}

function renderBoard(settingsChanged) {
    boardElement.innerHTML = ""; // Clear previous board
    let squareNumber = 1;

    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const square = document.createElement("div");
            square.classList.add("square");
            square.dataset.row = row;
            square.dataset.col = col;

            // Add piece (if any)
            const piece = board[row][col];
            if (piece) {
                square.classList.add("has-piece");
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", piece);
                square.appendChild(pieceElement);
            }

            // Add number
            const number = document.createElement("div");
            number.classList.add("number");
            number.textContent = squareNumber++;
            square.appendChild(number);

            const character = document.createElement("div");
            character.classList.add("character");

            // Only randomize characters if settings have changed, otherwise use initial characters
            if (settingsChanged || !initialCharacters[`${row},${col}`]) {
                const randomCharacter = getRandomCharacter();
                initialCharacters[`${row},${col}`] = randomCharacter; // Save the randomized character for future renders
                character.textContent = randomCharacter;
            } else {
                // If settings haven't changed, use the previously stored character
                character.textContent = initialCharacters[`${row},${col}`];
            }
            square.appendChild(character);

            // Add event listener for handling moves
            square.addEventListener("click", () => handleMove(row, col));

            boardElement.appendChild(square);
        }
    }

    // After rendering, check if the game is over
    checkGameOver();
}

function handleMove(row, col) {
    if (board[row][col] !== null) return;  // Cannot place a piece here if it's not empty

    const validMove = isValidMove(row, col);
    if (!validMove) return;  // Ignore invalid moves

    // Place piece on the board
    board[row][col] = currentTurn;

    // Flip the pieces in all directions
    flipPieces(row, col);

    // Switch turn
    currentTurn = currentTurn === "black" ? "white" : "black";

    // Re-render the board to update everything
    renderBoard(false);
    updateScore();
    turnIndicatorElement.textContent = `Turn: ${currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1)}`;
}

function isValidMove(row, col) {
    const opponent = currentTurn === "black" ? "white" : "black";

    const directions = [
        { dr: -1, dc: 0 }, { dr: 1, dc: 0 },  // Up and Down
        { dr: 0, dc: -1 }, { dr: 0, dc: 1 },  // Left and Right
        { dr: -1, dc: -1 }, { dr: -1, dc: 1 }, // Diagonal Up-left and Up-right
        { dr: 1, dc: -1 }, { dr: 1, dc: 1 },  // Diagonal Down-left and Down-right
    ];

    for (const { dr, dc } of directions) {
        let r = row + dr;
        let c = col + dc;
        let piecesToFlip = [];

        // Look in the direction until we find an empty square or a piece of the same color
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
            if (board[r][c] === null) break;
            if (board[r][c] === opponent) {
                piecesToFlip.push([r, c]);
            } else if (board[r][c] === currentTurn) {
                // We found a piece of the same color, flip the pieces in between
                if (piecesToFlip.length > 0) return true;
                break;
            } else {
                break;
            }

            r += dr;
            c += dc;
        }
    }

    return false;
}

function flipPieces(row, col) {
    const opponent = currentTurn === "black" ? "white" : "black";
    const directions = [
        { dr: -1, dc: 0 }, { dr: 1, dc: 0 },  // Up and Down
        { dr: 0, dc: -1 }, { dr: 0, dc: 1 },  // Left and Right
        { dr: -1, dc: -1 }, { dr: -1, dc: 1 }, // Diagonal Up-left and Up-right
        { dr: 1, dc: -1 }, { dr: 1, dc: 1 },  // Diagonal Down-left and Down-right
    ];

    for (const { dr, dc } of directions) {
        let r = row + dr;
        let c = col + dc;
        let piecesToFlip = [];

        // Look in the direction until we find an empty square or a piece of the same color
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
            if (board[r][c] === null) break;
            if (board[r][c] === opponent) {
                piecesToFlip.push([r, c]);
            } else if (board[r][c] === currentTurn) {
                // We found a piece of the same color, flip the pieces in between
                if (piecesToFlip.length > 0) {
                    piecesToFlip.forEach(([flipRow, flipCol]) => {
                        board[flipRow][flipCol] = currentTurn;
                    });
                }
                break;
            } else {
                break;
            }

            r += dr;
            c += dc;
        }
    }
}

function updateScore() {
    const blackCount = board.flat().filter(cell => cell === "black").length;
    const whiteCount = board.flat().filter(cell => cell === "white").length;
    blackScoreElement.textContent = `Black: ${blackCount}`;
    whiteScoreElement.textContent = `White: ${whiteCount}`;
}

function checkGameOver() {
    // Check if there are valid moves for both players
    const blackHasValidMove = hasValidMove("black");
    const whiteHasValidMove = hasValidMove("white");

    // If neither player has a valid move, the game is over
    if (!blackHasValidMove && !whiteHasValidMove) {
        const blackCount = board.flat().filter(cell => cell === "black").length;
        const whiteCount = board.flat().filter(cell => cell === "white").length;

        if (blackCount > whiteCount) {
            winnerMessageElement.textContent = "Black wins!";
        } else if (whiteCount > blackCount) {
            winnerMessageElement.textContent = "White wins!";
        } else {
            winnerMessageElement.textContent = "It's a draw!";
        }

        noMovesElement.style.display = "block";
    } else {
        winnerMessageElement.textContent = "";
        noMovesElement.style.display = "none";
    }
}

function hasValidMove(player) {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (isValidMoveForPlayer(row, col, player)) {
                return true;
            }
        }
    }
    return false;
}

function isValidMoveForPlayer(row, col, player) {
    if (board[row][col] !== null) return false;

    const opponent = player === "black" ? "white" : "black";
    const directions = [
        { dr: -1, dc: 0 }, { dr: 1, dc: 0 },  // Up and Down
        { dr: 0, dc: -1 }, { dr: 0, dc: 1 },  // Left and Right
        { dr: -1, dc: -1 }, { dr: -1, dc: 1 }, // Diagonal Up-left and Up-right
        { dr: 1, dc: -1 }, { dr: 1, dc: 1 },  // Diagonal Down-left and Down-right
    ];

    for (const { dr, dc } of directions) {
        let r = row + dr;
        let c = col + dc;
        let piecesToFlip = [];

        // Look in the direction until we find an empty square or a piece of the same color
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
            if (board[r][c] === null) break;
            if (board[r][c] === opponent) {
                piecesToFlip.push([r, c]);
            } else if (board[r][c] === player) {
                // We found a piece of the same color, flip the pieces in between
                if (piecesToFlip.length > 0) return true;
                break;
            } else {
                break;
            }

            r += dr;
            c += dc;
        }
    }

    return false;
}

initializeBoard();

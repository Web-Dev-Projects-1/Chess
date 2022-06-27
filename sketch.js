const winnerEl = document.querySelector("#winner");

// sprites
let white_pawn_img, white_knight_img, white_bishop_img, white_rook_img, white_queen_img, white_king_img;
let black_pawn_img, black_knight_img, black_bishop_img, black_rook_img, black_queen_img, black_king_img;
let move_sound, capture_sound;

// Initiate classes
let board = new Board();
let matrix;
let whiteTurn = true;
let check = false;
let noMoves = false;
let gameEnd = false;

function preload() {
    white_king_img = loadImage("sprites/white_king.png");
    white_queen_img = loadImage("sprites/white_queen.png");
    white_rook_img = loadImage("sprites/white_rook.png");
    white_bishop_img = loadImage("sprites/white_bishop.png");
    white_knight_img = loadImage("sprites/white_knight.png");
    white_pawn_img = loadImage("sprites/white_pawn.png");
    black_king_img = loadImage("sprites/black_king.png");
    black_queen_img = loadImage("sprites/black_queen.png");
    black_rook_img = loadImage("sprites/black_rook.png");
    black_bishop_img = loadImage("sprites/black_bishop.png");
    black_knight_img = loadImage("sprites/black_knight.png");
    black_pawn_img = loadImage("sprites/black_pawn.png");
    move_sound = loadSound("sounds/Move.mp3");
    capture_sound = loadSound("sounds/Capture.mp3");
}

function setup() {
    let myCanvas = createCanvas(544, 544);
    myCanvas.parent("chess-window");
}

function playMoveSound() {
    move_sound.play();
}

function playCaptureSound() {
    capture_sound.play();
}

function draw() {
    // Draw the chessboard
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            noStroke();
            ((i + j) % 2 == 0) ? fill(255, 237, 203) : fill(182, 149, 100);
            rect(i * 68, j * 68, 68, 68);
        }
    }

    matrix = board.getMatrix();
    // Add the pieces
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (typeof matrix[i][j] === "object") {
                // highlight attacked pieces
                if (matrix[i][j].attacked) {
                    fill(0, 150, 0, 75);
                    rect(j * 68, i * 68, 68, 68);
                }
                // highlight selected piece
                else if (matrix[i][j].selected) {
                    fill(220, 220, 0, 75);
                    rect(j * 68, i * 68, 68, 68);
                }
                let pieceType = matrix[i][j].constructor.name;
                let pieceIsWhite = matrix[i][j].white;
                if (pieceType === "Pawn") {
                    (pieceIsWhite) ? image(white_pawn_img, j * 68, i * 68, 68, 68) : image(black_pawn_img, j * 68, i * 68, 68, 68);
                }
                else if (pieceType === "Knight") {
                    (pieceIsWhite) ? image(white_knight_img, j * 68, i * 68, 68, 68) : image(black_knight_img, j * 68, i * 68, 68, 68);
                }
                else if (pieceType === "Bishop") {
                    (pieceIsWhite) ? image(white_bishop_img, j * 68, i * 68, 68, 68) : image(black_bishop_img, j * 68, i * 68, 68, 68);
                }
                else if (pieceType === "Rook") {
                    (pieceIsWhite) ? image(white_rook_img, j * 68, i * 68, 68, 68) : image(black_rook_img, j * 68, i * 68, 68, 68);
                }
                else if (pieceType === "Queen") {
                    (pieceIsWhite) ? image(white_queen_img, j * 68, i * 68, 68, 68) : image(black_queen_img, j * 68, i * 68, 68, 68);
                }
                else if (pieceType === "King") {
                    (pieceIsWhite) ? image(white_king_img, j * 68, i * 68, 68, 68) : image(black_king_img, j * 68, i * 68, 68, 68);
                }
            }
            // show squares where piece can go
            else if (matrix[i][j] == 1) {
                fill(0, 150, 0, 75);
                ellipse(j * 68 + 34, i * 68 + 34, 25, 25);
            }
        }
    }

}

function mouseReleased(event) {
    if (!gameEnd) {
        // coordinates of clicked square
        let i = Math.floor(mouseY / 68);
        let j = Math.floor(mouseX / 68);
        matrix = board.getMatrix();
        if (i >= 0 && i < 8 && j >= 0 && j < 8) {
            // if piece was clicked
            if (typeof matrix[i][j] === "object") {
                // own piece is clicked
                //white to move
                if (whiteTurn && matrix[i][j].white) {
                    board.showMoves(i, j, true, true);
                }
                // black to move
                else if (!whiteTurn && !matrix[i][j].white) {
                    board.showMoves(i, j, true, true);
                }
                // attacked piece is clicked
                else if (matrix[i][j].attacked) {
                    // capture piece
                    board.movePiece(i, j, true);
                    (whiteTurn) ? whiteTurn = false : whiteTurn = true;
                    playCaptureSound();
                    checkForDrawAndCheckmate();
                    checkForInsuffMaterial();
                }
            }
            // empty square was clicked
            else if (matrix[i][j] == 1) {
                // move piece to allowed square
                board.movePiece(i, j, true);
                (whiteTurn) ? whiteTurn = false : whiteTurn = true;
                playMoveSound();
                checkForDrawAndCheckmate();
                checkForInsuffMaterial();
            }
        }
    }
}

function checkForDrawAndCheckmate() {
    // check whether the side, whose turn it is, is checkmated or there is a stalemate
    check = board.didCheckHappen(whiteTurn);
    noMoves = board.areThereNoMoves(whiteTurn);
    if (check && noMoves) {
        showCheckmateMessage();
    }
    else if (noMoves) {
        showDrawMessage();
    }
}

function checkForInsuffMaterial() {
    let whitePieces = [];
    let blackPieces = [];
    let draw = false;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (typeof matrix[i][j] === "object") {
                if (matrix[i][j].white) {
                    whitePieces.push(matrix[i][j].constructor.name);
                }
                else {
                    blackPieces.push(matrix[i][j].constructor.name);
                }
            }
        }
    }
    if (whitePieces.length == 1 && blackPieces.length == 1) {
        draw = true;
    }
    else if (whitePieces.length == 2 && blackPieces.length == 1) {
        if (whitePieces.includes("Knight") || whitePieces.includes("Bishop")) {
            draw = true;
        }
    }
    else if (whitePieces.length == 1 && blackPieces.length == 2) {
        if (blackPieces.includes("Knight") || blackPieces.includes("Bishop")) {
            draw = true;
        }
    }
    else if (whitePieces.length == 2 && blackPieces.length == 2) {
        let whiteBishop, blackBishop;
        if (whitePieces.includes("Bishop") && blackPieces.includes("Bishop")) {
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    if (typeof matrix[i][j] === "object") {
                        if (matrix[i][j].white && matrix[i][j].constructor.name === "Bishop") {
                            whiteBishop = matrix[i][j];
                        }
                        else if (!matrix[i][j].white && matrix[i][j].constructor.name === "Bishop") {
                            blackBishop = matrix[i][j];
                        }
                    }
                }
            }
            if ((whiteBishop.x + whiteBishop.y) % 2 == (blackBishop.x + blackBishop.y) % 2) {
                draw = true;
            }
        }
    }
    if (draw) {
        showDrawMessage();
    }
}

function showCheckmateMessage() {
    gameEnd = true;
    if (whiteTurn) {
        winnerEl.innerText = "Black won!";
        winnerEl.style.color = "black";
    }
    else {
        winnerEl.innerText = "White won!";
        winnerEl.style.color = "white";
    }
}

function showDrawMessage() {
    gameEnd = true;
    winnerEl.innerText = "Draw!";
    winnerEl.style.color = "red";
}
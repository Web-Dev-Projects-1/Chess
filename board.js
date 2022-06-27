class Board {
    constructor() {
        this.checked = false;
        // moves matrix - to only store allowed moves for the clicked piece
        this.movesMatrix = [];
        for (let i = 0; i < 8; i++) {
            this.movesMatrix[i] = [];
            for (let j = 0; j < 8; j++) {
                this.movesMatrix[i][j] = 0;
            }
        }
        // main matrix to store the board with the pieces and temporary moves to check for self checks
        this.matrix = [];
        for (let i = 0; i < 8; i++) {
            this.matrix[i] = [];
            for (let j = 0; j < 8; j++) {
                this.matrix[i][j] = 0;
            }
        }
        this.matrix[0][0] = new Rook(false, 0, 0);
        this.matrix[0][7] = new Rook(false, 0, 7);
        this.matrix[0][1] = new Knight(false, 0, 1);
        this.matrix[0][6] = new Knight(false, 0, 6);
        this.matrix[0][2] = new Bishop(false, 0, 2);
        this.matrix[0][5] = new Bishop(false, 0, 5);
        this.matrix[0][3] = new Queen(false, 0, 3);
        this.matrix[0][4] = new King(false, 0, 4);
        // empty squares with value 0 are neutral, and with value 1 are squares where piece can go
        for (let i = 2; i < 6; i++) {
            for (let j = 0; j < 8; j++) {
                this.matrix[i][j] = 0;
            }
        }
        for (let i = 0; i < 8; i++) {
            this.matrix[1][i] = new Pawn(false, 1, i);
        }
        for (let i = 0; i < 8; i++) {
            this.matrix[6][i] = new Pawn(true, 6, i);
        }
        this.matrix[7][0] = new Rook(true, 7, 0);
        this.matrix[7][7] = new Rook(true, 7, 7);
        this.matrix[7][1] = new Knight(true, 7, 1);
        this.matrix[7][6] = new Knight(true, 7, 6);
        this.matrix[7][2] = new Bishop(true, 7, 2);
        this.matrix[7][5] = new Bishop(true, 7, 5);
        this.matrix[7][3] = new Queen(true, 7, 3);
        this.matrix[7][4] = new King(true, 7, 4);
    }

    getMatrix() {
        return this.matrix;
    }

    showMoves(i, j, toHideMoves, mainMove) {
        /*
        Shows moves for clicked piece
        params: i = x-coordinate of the piece
                j = y-coordinate of the piece
                toHideMoves = whether to hide previously drawn possible moves
                mainMove = whether the moves are being shown for the piece clicked by the player
                or piece selected within the code
        returns:
                none, marks the allowed moves on the board
        */
       // hide moves if same piece is clicked
        if (this.matrix[i][j].selected) {
            this.hideMovesMainMatrix();
            this.hideMovesMovesMatrix();
            return;
        }
        if (mainMove) {
            this.checked = this.didCheckHappen(this.matrix[i][j].white);
        }
        // previous moves are hidden on each click, but not when determining whether the move results in a self check
        if (toHideMoves) {
            this.hideMovesMainMatrix();
            this.hideMovesMovesMatrix();
        }
        // update to newly clicked piece
        let clickedPiece = this.matrix[i][j];
        clickedPiece.selected = true;

        let oneSquare = clickedPiece.oneSquare(); // check if piece only moves one square in each direction
        let legalMoves = clickedPiece.legalMoves();
        for (let index in legalMoves) {
            // for single move pieces, aka pawns, knights and kings
            let legal_i = i + legalMoves[index][0];
            let legal_j = j + legalMoves[index][1];
            // pawns can't capture pieces in front of them, so we stop when we encounter a piece
            if (this.matrix[i][j].constructor.name === "Pawn" && typeof this.matrix[legal_i][legal_j] === "object") {
                break;
            }
            // main move means we include moves in the moves matrix, not means it is just temp moves to check for self checking
            if (mainMove) {
                this.showMovesHelperMovesMatrix(i, j, legal_i, legal_j);
            }
            else {
                this.showMovesHelperMainMatrix(i, j, legal_i, legal_j);
            }
            // for rooks, bishops and queens aka pieces that can move farther than just one square in each direction
            if (!oneSquare) {
                while (legal_i >= 0 && legal_i < 8 && legal_j >= 0 && legal_j < 8 && (typeof this.matrix[legal_i][legal_j] !== "object")) {
                    legal_i += legalMoves[index][0];
                    legal_j += legalMoves[index][1];
                    if (mainMove) {
                        this.showMovesHelperMovesMatrix(i, j, legal_i, legal_j);
                    }
                    else {
                        this.showMovesHelperMainMatrix(i, j, legal_i, legal_j);
                    }
                }
            }
        }
        // show additional moves for certain pieces
        if (this.matrix[i][j].constructor.name === "Pawn") {
            let captureMoves = this.matrix[i][j].captureMoves();
            if (mainMove) {
                this.showPawnCaptureMovesMovesMatrix(i, j, captureMoves);
            }
            else {
                this.showPawnCaptureMovesMainMatrix(i, j, captureMoves);
            }
        }
        if (this.matrix[i][j].constructor.name === "King") {
            if (!this.matrix[i][j].moved && !this.checked) {
                if (mainMove) {
                    this.showCastleMovesMovesMatrix(this.matrix[i][j].white);
                }
            }
        }
        // removing self check moves
        if (mainMove) {
            this.removeSelfCheckMoves(i, j);
        }
        // hide castle moves if pass through check
        if (mainMove) {
            if (this.matrix[i][j].constructor.name === "King") {
                if (!this.matrix[i][j].moved && !this.checked) {
                    if (mainMove) {
                        this.hideCastleMovesMovesMatrix(this.matrix[i][j].white);
                    }
                }
            }
        }
        // copy the allowed moves from the moves matrix into our main matrix in the end
        if (mainMove) {
            this.movesMatrix.forEach((e1, pieceI) => {e1.forEach((e2, pieceJ) => {
                if (e2 == 1) {
                    this.showMovesHelperMainMatrix(i, j, pieceI, pieceJ);
                }
            })});
        }
    }

    showMovesHelperMovesMatrix(i, j, legal_i, legal_j) {
        /*
        Marks the square as allowed
        params: i = x-coordinate of the piece
                j = y-coordinate of the piece
                legal_i = x-coordinate of the allowed square
                legal_j = y-coordinate of the allowed square
        returns:
                none, marks the allowed move on the board
        */
        if (legal_i >= 0 && legal_i < 8 && legal_j >= 0 && legal_j < 8) {
            if (typeof this.matrix[legal_i][legal_j] === "object") {
                // attack if enemy piece
                if (this.matrix[i][j].white != this.matrix[legal_i][legal_j].white) {
                    this.movesMatrix[legal_i][legal_j] = 1;
                }
            }
            else {
                this.movesMatrix[legal_i][legal_j] = 1;
            }
        }
    }

    showMovesHelperMainMatrix(i, j, legal_i, legal_j) {
        if (legal_i >= 0 && legal_i < 8 && legal_j >= 0 && legal_j < 8) {
            if (typeof this.matrix[legal_i][legal_j] === "object") {
                // attack if enemy piece
                if (this.matrix[i][j].white != this.matrix[legal_i][legal_j].white) {
                    this.matrix[legal_i][legal_j].attacked = true;
                }
            }
            else {
                this.matrix[legal_i][legal_j] = 1;
            }
        }
    }

    showPawnCaptureMovesMovesMatrix(i, j, captureMoves) {
        /*
        Marks the squares as allowed
        params: i = x-coordinate of the pawn
                j = y-coordinate of the pawn
                captureMoves = squares at which the pawn can capture
        returns:
                none, marks the squares as capture-able if enemy piece is there or en passant
        */
        for (let index in captureMoves) {
            let legal_i = i + captureMoves[index][0];
            let legal_j = j + captureMoves[index][1];
            if (legal_i >= 0 && legal_i < 8 && legal_j >= 0 && legal_j < 8) {
                if (typeof this.matrix[legal_i][legal_j] === "object") {
                    // if enemy piece
                    if (this.matrix[i][j].white != this.matrix[legal_i][legal_j].white) {
                        this.showMovesHelperMovesMatrix(i, j, legal_i, legal_j);
                    }
                }
            }
        }
        // en passant
        let leftSquare = j - 1;
        let rightSquare = j + 1;
        if (leftSquare >= 0) {
            if (typeof this.matrix[i][leftSquare] === "object") {
                if (this.matrix[i][leftSquare].constructor.name === "Pawn") {
                    if (this.matrix[i][leftSquare].enpassantable) {
                        if (this.matrix[i][j].white) {
                            this.showMovesHelperMovesMatrix(i, j, i - 1, leftSquare);
                        }
                        else if (!this.matrix[i][j].white) {
                            this.showMovesHelperMovesMatrix(i, j, i + 1, leftSquare);
                        }
                    }
                }
            }
        }
        if (rightSquare < 8) {
            if (typeof this.matrix[i][rightSquare] === "object") {
                if (this.matrix[i][rightSquare].constructor.name === "Pawn") {
                    if (this.matrix[i][rightSquare].enpassantable) {
                        if (this.matrix[i][j].white) {
                            this.showMovesHelperMovesMatrix(i, j, i - 1, rightSquare);
                        }
                        else if (!this.matrix[i][j].white) {
                            this.showMovesHelperMovesMatrix(i, j, i + 1, rightSquare);
                        }
                    }
                }
            }
        }
    }

    showPawnCaptureMovesMainMatrix(i, j, captureMoves) {
        for (let index in captureMoves) {
            let legal_i = i + captureMoves[index][0];
            let legal_j = j + captureMoves[index][1];
            if (legal_i >= 0 && legal_i < 8 && legal_j >= 0 && legal_j < 8) {
                if (typeof this.matrix[legal_i][legal_j] === "object") {
                    if (this.matrix[i][j].white != this.matrix[legal_i][legal_j].white) {
                        this.showMovesHelperMainMatrix(i, j, legal_i, legal_j);
                    }
                }
            }
        }
    }

    showCastleMovesMovesMatrix(white) {
        /*
        Marks the squares the king can castle to
        params: white = whether the moving side is white or not
        returns:
            none, marks the squares as castle-able for the king if complies with the rules
        */
        let row;
        (white) ? row = 7 : row = 0;
        this.matrix[row][4].selected = true;
        if (this.matrix[row][5] == 0 && this.matrix[row][6] == 0 && typeof this.matrix[row][7] === "object") {
            if (this.matrix[row][7].constructor.name === "Rook") {
                if (!this.matrix[row][7].moved) {
                    this.showMovesHelperMovesMatrix(row, 4, row, 6);
                }
            }
        }
        if (this.matrix[row][1] == 0 && this.matrix[row][2] == 0 && this.matrix[row][3] == 0 && typeof this.matrix[row][0] === "object") {
            if (this.matrix[row][0].constructor.name === "Rook") {
                if (!this.matrix[row][0].moved) {
                    this.showMovesHelperMovesMatrix(row, 4, row, 2);
                }
            }
        }
    }

    hideCastleMovesMovesMatrix(white) {
        /*
        Unmarks the squares the king can castle to if he will castle through check
        params: white = whether the moving side is white or not
        returns:
            none, marks the squares as uncastle-able for the king if goes through check
        */
        let row;
        (white) ? row = 7 : row = 0;
        this.matrix[row][4].selected = true;
        if (this.matrix[row][5] == 0 && this.matrix[row][6] == 0 && typeof this.matrix[row][7] === "object") {
            if (this.matrix[row][7].constructor.name === "Rook") {
                if (this.movesMatrix[row][5] == 0) {
                    this.movesMatrix[row][6] = 0;
                }
            }
        }
        if (this.matrix[row][1] == 0 && this.matrix[row][2] == 0 && this.matrix[row][3] == 0 && typeof this.matrix[row][0] === "object") {
            if (this.matrix[row][0].constructor.name === "Rook") {
                if (this.movesMatrix[row][3] == 0) {
                    this.movesMatrix[row][2] = 0;
                }
            }
        }
    }

    hideMovesMovesMatrix() {
        /*
        Unmarks all of the marked squares
        */
        this.movesMatrix.forEach((e1, pieceI) => {e1.forEach((e2, pieceJ) => {
            this.movesMatrix[pieceI][pieceJ] = 0;
        })});
    }

    hideMovesMainMatrix() {
        this.matrix.forEach((e1, i) => {e1.forEach((e2, j) => {
            if (typeof e2 === "object") {
                e2.attacked = false; e2.selected = false;
            }
            else {
                this.matrix[i][j] = 0;
            }
        })});
    }

    removeEnpassantablePawns() {
        this.matrix.forEach(e1 => {e1.forEach(e2 => {
            if (typeof e2 === "object") {
                if (e2.constructor.name === "Pawn") {
                    e2.enpassantable = false;
                }
            }
        })});
    }

    removeSelfCheckMoves(i, j) {
        /*
        Removes marked squares which result in a self check
        params: i = x-coordinate of the piece
                j = y-coordinate of the piece
        returns:
                none, unmarks squares which result in a self check
        */
        // check with every move in the move matrix
        this.movesMatrix.forEach((e1, pieceI) => {e1.forEach((e2, pieceJ) => {
            if (e2 == 1) {
                if (this.moveCausesSelfCheck(i, j, pieceI, pieceJ)) {
                    this.movesMatrix[pieceI][pieceJ] = 0;
                }
            }
        })});
    }

    moveCausesSelfCheck(i, j, legal_i, legal_j) {
        /*
        Returns whether the move causes a self check
        params: i = x-coordinate of the piece
                j = y-coordinate of the piece
                legal_i = x-coordinate of the square
                legal_j = y-coordinate of the square
        returns:
                boolean, whether the move causes a self check
        */
        // move piece to allowed position, see if self check happened, and take back the move
        let selfChecked = false;
        let temp = this.movePiece(legal_i, legal_j, false);
        this.matrix[legal_i][legal_j].selected = true;
        selfChecked = this.didCheckHappen(this.matrix[legal_i][legal_j].white);
        this.matrix[legal_i][legal_j].selected = true;
        this.movePiece(i, j, false);
        this.matrix[legal_i][legal_j] = temp;
        this.matrix[i][j].selected = true;
        return selfChecked;
    }

    didCheckHappen(white) {
        /*
        Returns whether the currently moving side is in check
        params: white = a boolean whether the side to move is white or not (black)
        returns:
                boolean, whether the currently moving side is in check
        */
        let checked = false;
        // show moves for all enemy pieces
        this.matrix.forEach((e1, pieceI) => {e1.forEach((e2, pieceJ) => {
            if (typeof e2 === "object") {
                if (e2.white != white) {
                    this.showMoves(pieceI, pieceJ, false, false);
                }
            }
        })});
        // see if our king is in check
        this.matrix.forEach(e1 => {e1.forEach(e2 => {
            if (typeof e2 === "object") {
                if (e2.white == white && e2.constructor.name === "King") {
                    if (e2.attacked) {
                        checked = true;
                    }
                }
            }
        })});
        this.hideMovesMainMatrix();
        return checked;
    }

    areThereNoMoves(whiteTurn) {
        /*
        Returns whether the currently moving side has no moves
        params: whiteTurn = a boolean whether the side to move is white or not (black)
        returns:
                boolean, whether the currently moving side has no moves
        */
        let noMoves = true;
        // display each of our piece's moves
        this.matrix.forEach((e1, i) => {e1.forEach((e2, j) => {
            if (typeof e2 === "object") {
                if (e2.white == whiteTurn) {
                    this.showMoves(i, j, false, true);
                }
                // immediately check whether we have a move, since squares marked as allowed can be overwritten as not allowed by subsequent pieces
                this.movesMatrix.forEach(d1 => {d1.forEach(d2 => {
                    if (d2 == 1) {
                        noMoves = false;
                    }
                })});
            }
        })});
        this.hideMovesMainMatrix();
        this.hideMovesMovesMatrix();
        return noMoves;
    }

    movePiece(i, j, mainMove) {
        /*
        Moves the selected piece to the square
        params: i = x-coordinate of the square
                j = y-coordinate of the square
        returns:
                none, moves the selected piece to the square
        */
        if (mainMove) {
            this.removeEnpassantablePawns();
        }
        // finding the selected piece
        let selectedPieceI = 0;
        let selectedPieceJ = 0;
        this.matrix.forEach((e1, pieceI) => {e1.forEach((e2, pieceJ) => {
            if (e2.selected) {
                selectedPieceI = pieceI;
                selectedPieceJ = pieceJ;
            }
        })});
        // castling
        if (mainMove) {
            if (this.matrix[selectedPieceI][selectedPieceJ].constructor.name === "King") {
                if (!this.matrix[selectedPieceI][selectedPieceJ].moved) {
                    if (j == 6) {
                        this.matrix[selectedPieceI][selectedPieceJ].selected = false;
                        this.matrix[selectedPieceI][7].selected = true;
                        this.movePiece(selectedPieceI, 5, true);
                        this.matrix[selectedPieceI][selectedPieceJ].selected = true;
                    }
                    else if (j == 2) {
                        this.matrix[selectedPieceI][selectedPieceJ].selected = false;
                        this.matrix[selectedPieceI][0].selected = true;
                        this.movePiece(selectedPieceI, 3, true);
                        this.matrix[selectedPieceI][selectedPieceJ].selected = true;
                    }
                }
            }
        }
        // en passant
        if (mainMove) {
            if (this.matrix[selectedPieceI][selectedPieceJ].constructor.name === "Pawn") {
                if (this.matrix[selectedPieceI][selectedPieceJ].white) {
                    if (j != selectedPieceJ && this.matrix[i][j] === 1) {
                        this.matrix[i + 1][j] = 0;
                    }
                }
                else {
                    if (j != selectedPieceJ && this.matrix[i][j] === 1) {
                        this.matrix[i - 1][j] = 0;
                    }
                }
            }
        }

        // moving the piece
        let temp = this.matrix[i][j];
        this.matrix[i][j] = this.matrix[selectedPieceI][selectedPieceJ];
        this.matrix[i][j].x = i;
        this.matrix[i][j].y = j;
        this.matrix[selectedPieceI][selectedPieceJ] = 0;

        // king move, rook move, pawn promotion and en passant
        if (mainMove) {
            if (this.matrix[i][j].constructor.name === "King") {
                this.matrix[i][j].moved = true;
            }
            else if (this.matrix[i][j].constructor.name === "Rook") {
                this.matrix[i][j].moved = true;
            }
            else if (this.matrix[i][j].constructor.name === "Pawn") {
                if (i == 0 || i == 7) {
                    this.matrix[i][j] = new Queen(this.matrix[i][j].white, i, j);
                }
                else if ((this.matrix[i][j].white && selectedPieceI == 6 && i == 4) ||
                        (!this.matrix[i][j].white && selectedPieceI == 1 && i == 3)) {
                    this.matrix[i][j].enpassantable = true;
                }
            }
        }
        this.hideMovesMainMatrix();
        // if an actual move is made by the player, we want to clear the move matrix
        // else we are just testing the possible moves (from the moves matrix) to see if any result in self check
        if (mainMove) {
            this.hideMovesMovesMatrix();
        }
        return temp;
    }
}
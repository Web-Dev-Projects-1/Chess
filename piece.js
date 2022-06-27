class Piece {
    constructor(white, x, y) {
        this.selected = false;
        this.attacked = false;
        this.white = white;
        this.x = x;
        this.y = y;
    }
}

class Pawn extends Piece {
    constructor(white, x, y) {
        super(white, x, y);
        this.enpassantable = false;
    }

    // whether piece moves one square in each direction or multiple
    oneSquare() {
        return true;
    }

    legalMoves() {
        if (this.white) {
            if (this.x == 6)
                return [[-1, 0], [-2, 0]];
            else
                return [[-1, 0]];
        }
        else {
            if (this.x == 1)
                return [[1, 0], [2, 0]];
            else
                return [[1, 0]];
        }
    }

    captureMoves() {
        if (this.white) {
            return [[-1, -1], [-1, 1]];
        }
        else {
            return [[1, -1], [1, 1]];
        }
    }
}

class Knight extends Piece {
    constructor(white, x, y) {
        super(white, x, y);
    }

    oneSquare() {
        return true;
    }

    legalMoves() {
        return [[-2, -1], [-1, -2], [1, -2], [2, -1], [2, 1], [1, 2], [-1, 2], [-2, 1]];
    }
}

class Bishop extends Piece {
    constructor(white, x, y) {
        super(white, x, y);
    }

    oneSquare() {
        return false;
    }

    legalMoves() {
        return [[-1, -1], [-1, 1], [1, 1], [1, -1]];
    }
}

class Rook extends Piece {
    constructor(white, x, y) {
        super(white, x, y);
        this.moved = false;
    }

    oneSquare() {
        return false;
    }

    legalMoves() {
        return [[0, -1], [-1, 0], [0, 1], [1, 0]];
    }
}

class Queen extends Piece {
    constructor(white, x, y) {
        super(white, x, y);
    }

    oneSquare() {
        return false;
    }

    legalMoves() {
        return [[-1, -1], [-1, 1], [1, 1], [1, -1], [0, -1], [-1, 0], [0, 1], [1, 0]];
    }
}

class King extends Piece {
    constructor(white, x, y) {
        super(white, x, y);
        this.moved = false;
    }

    oneSquare() {
        return true;
    }

    legalMoves() {
        return [[-1, -1], [-1, 1], [1, 1], [1, -1], [0, -1], [-1, 0], [0, 1], [1, 0]];
    }
}
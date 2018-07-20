class Puzzle {
    constructor(puzzle) {
        this.date = new Date();
        this.puzzle = puzzle;
        this.progress = puzzle;
        this.timer = 0;
        this.solutions = [];
        this.isSolved = false;
        this.hasSolution = false;
        this.status = "New";
        this.moves = [];
    }
}
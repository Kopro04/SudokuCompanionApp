class SolutionGenerator {
    constructor(puzzle) {
        //generate generic sudoku exact cover matrix
        this.matrix = [];
        this.generateMatrix();

        //eliminate clue cells from the generic matrix
        this.puzzle = puzzle;
        this.adjustMatrix();

        //create the dancing links list representation of the adjusted matrix
        this.numSolutions = 0;
        this.answer = [];
        this.solutions = [];
        this.header = this.createDancingLinks();
    }

    generateMatrix() {
        var cursor = 0;

        // Generate cell constraints
        for (var r1 = 0; r1 < 9; r1++) {
            for (var c1 = 0; c1 < 9; c1++) {
                for (var val1 = 0; val1 < 9; val1++) {
                    var temp = this.getMatrixRow(r1, c1, val1);
                    this.matrix[temp] = [];
                    this.matrix[temp][cursor] = 1;
                }
                cursor++;
            }
        }

        // Generate row constraints
        for (var r2 = 0; r2 < 9; r2++) {
            for (var val2 = 0; val2 < 9; val2++) {
                for (var c2 = 0; c2 < 9; c2++) {
                    this.matrix[this.getMatrixRow(r2, c2, val2)][cursor] = 1;
                }
                cursor++;
            }
        }

        // Generate column constraints
        for (var c3 = 0; c3 < 9; c3++) {
            for (var val3 = 0; val3 < 9; val3++) {
                for (var r3 = 0; r3 < 9; r3++) {
                    this.matrix[this.getMatrixRow(r3, c3, val3)][cursor] = 1;
                }
                cursor++;
            }
        }

        // Generate subgrid constraints
        for (var r4 = 0; r4 < 9; r4 += 3) {
            for (var c4 = 0; c4 < 9; c4 += 3) {
                for (var val4 = 0; val4 < 9; val4++) {
                    for (var deltaR = 0; deltaR < 3; deltaR++) {
                        for (var deltaC = 0; deltaC < 3; deltaC++) {
                            this.matrix[this.getMatrixRow(r4 + deltaR, c4 + deltaC, val4)][cursor] = 1;
                        }
                    }
                    cursor++;
                }
            }
        }
        
        // Fill holes
        for (var i = 0; i < this.matrix.length; i++) {
            for (var j = 0; j < 9 * 9 * 4; j++) {
                if (this.matrix[i][j] !== 1) this.matrix[i][j] = 0;
            }
        }
    }

    adjustMatrix() {
        var index = 0;
        for (var r = 0; r < 9; r++){
            for (var c = 0; c < 9; c++){
                index = r * 9 + c;
                var clueValue = parseInt(this.puzzle[index]);
                if (clueValue >= 1 && clueValue <= 9) {
                    for (var val = 0; val < 9; val++) 
                        if (val !== clueValue - 1)
                            this.matrix[this.getMatrixRow(r, c, val)].fill(0);
                }
            }
        }
    }

    getMatrixRow(row, column, value) {
        return row * 9 * 9 + column * 9 + value;
    }

    createDancingLinks() {
        const ROWS = this.matrix.length;
        const COLS = this.matrix[0].length;

        let headerNode = new ColumnNode("Header");
        var columns = [];
        columns.push(headerNode);

        var colCursor = headerNode;
        for (var i = 0; i < COLS; i++) {
            var node = new ColumnNode("" + i);
            columns.push(node);
            colCursor.addRight(node);
            colCursor = node;
        }

        for (var r = 0; r < ROWS; r++) {
            var rowCursor = null;
            for (var c = 0; c < COLS; c++) {
                if (this.matrix[r][c] === 1) {
                    var col = columns[c + 1];
                    var newNode = new MatrixNode(col);

                    if (rowCursor === null) rowCursor = newNode;

                    col.up.addDown(newNode);
                    col.size++;

                    rowCursor.addRight(newNode);
                    rowCursor = newNode;
                }
            }
        }

        headerNode.size = COLS;
        return headerNode;
    }

    generateSolution() {
        this.search();
        return this.solutions;
    }

    search() {
        if (this.header === this.header.right) {
            this.solutions.push(this.formatSolution());
            this.numSolutions++;
        }
        else {
            var col = this.selectColumnNode();
            col.cover();

            for (var i = col.down; i !== col; i = i.down){
                this.answer.push(i);
                for (var j = i.right; j !== i; j = j.right) {
                    j.column.cover();
                }

                if (this.numSolutions < 10) this.search();

                i = this.answer.pop();
                col = i.column;

                for (var m = i.right; m !== i; m = m.right) {
                    m.column.uncover();
                }

            }
            col.uncover();
        }
    }

    selectColumnNode() {
        var min = 1000;
        var temp = null;

        for (var i = this.header.right; i !== this.header; i = i.right) {
            if (i.size < min) {
                min = i.size;
                temp = i;
            }
        }

        return temp;
    }

    formatSolution() {
        var solution = [];

        for (var i = 0; i < this.answer.length; i++){
            var node = this.answer[i];
            var min = parseInt(node.column.name);

            for (var temp = this.answer[i].right; temp !== this.answer[i]; temp = temp.right){
                var val = parseInt(temp.column.name);
                if (val < min) {
                    min = val;
                    node = temp;
                }
            }

            var index = parseInt(node.column.name);
            var contents = "" + (parseInt(node.right.column.name) % 9 + 1);
            solution[index] = contents;
        }

        return solution;
    }
}
var board = document.getElementById("gameboard");
const BOARD_ROWS = 9;
const BOARD_COLUMNS = 9;
var selectedCell = null;

var puzzle = null;
var solutions = null;
var currSolution = 0;
var numSolutions = 0;

var image1 = null;
var image2 = null;
var imgLoc = "images/";
var imgExt = ".png";

$(document).ready(function () {
    image1 = document.getElementById("title1");
    image2 = document.getElementById("title2");

    var temp = sessionStorage.getItem("solvedPuzzle");
    if (temp !== null) {
        puzzle = JSON.parse(temp);
        solutions = puzzle.solutions;
        numSolutions = solutions.length;
        if (numSolutions >= 10) document.getElementById("numSolutions").innerHTML = "This puzzle has 10+ solutions.";
        else if (!puzzle.hasSolution) document.getElementById("numSolutions").innerHTML = "This puzzle has does not have a solution.";
        else document.getElementById("numSolutions").innerHTML = "This puzzle has " + numSolutions + " solution(s).";
    }

    // Apply cell selection listeners and add the puzzle to the puzzle board
    if (board !== null) {
        for (var r = 0; r < BOARD_ROWS; r++) {
            for (var c = 0; c < BOARD_COLUMNS; c++) {
                var cell = document.getElementById("c" + r + c);

                cell.onclick = function () {
                    selectCell(this.id);
                };
            }
        }
        displaySolution(currSolution);
    }

    displayBtns();
});

function displaySolution(n) {
    if (n >= 0 && n < numSolutions) {
        image1.src = imgLoc + "solution" + imgExt;
        if (n === 0 && numSolutions === 1) {
            if (!image2.classList.contains("invisible"))
                image2.classList.add("invisible");
        }
        else {
            image2.src = imgLoc + (n + 1) + imgExt;
            image2.classList.remove("invisible");
        }

        for (var r = 0; r < BOARD_ROWS; r++) {
            for (var c = 0; c < BOARD_COLUMNS; c++) {
                var cell = document.getElementById("c" + r + c);
                var index = r * BOARD_ROWS + c;

                if (puzzle.isSolved && puzzle.hasSolution && puzzle.puzzle[index] === solutions[n][index]) {
                    cell.innerHTML = puzzle.puzzle[index];
                    cell.classList.add("clue");
                }
                else if (puzzle.isSolved && puzzle.hasSolution) {
                    cell.innerHTML = solutions[n][index];
                    cell.classList.remove("clue");
                }    
            }
        }
    }
    else if (!puzzle.hasSolution) {
        image1.src = imgLoc + "noSolution" + imgExt;
        image2.src = "";

        for (var r = 0; r < BOARD_ROWS; r++) {
            for (var c = 0; c < BOARD_COLUMNS; c++) {
                var cell = document.getElementById("c" + r + c);
                var index = r * BOARD_ROWS + c;

                if (puzzle.isSolved && !puzzle.hasSolution && puzzle.puzzle[index] !== "") {
                    cell.innerHTML = puzzle.puzzle[index];
                    cell.classList.add("clue");
                }
                else {
                    cell.innerHTML = "";
                    cell.classList.remove("clue");
                }
            }
        }
    }
}

document.getElementById("prevBtn").addEventListener("click", function () {
    if (currSolution > 0) {
        currSolution--;
        displaySolution(currSolution);
        displayBtns();
    }
});

document.getElementById("nextBtn").addEventListener("click", function () {
    if (currSolution < numSolutions - 1) {
        currSolution++;
        displaySolution(currSolution);
        displayBtns();
    }
});

function displayBtns() {
    if (currSolution >= numSolutions - 1) document.getElementById("nextBtn").style.display = "none";
    if (currSolution < numSolutions - 1) document.getElementById("nextBtn").style.display = "block";

    if (currSolution === 0) document.getElementById("prevBtn").style.display = "none";
    else document.getElementById("prevBtn").style.display = "block";
}

$(document).ready(function () {
    $('#body').on('click', function (event) {
        if (selectedCell !== null && !$(event.target).closest('table').length) {
            deselectCell();
        }
    });
});

function selectCell(id) {
    if (selectedCell !== null) {
        deselectMatchingValues();
        unhighlightClassElements(getRowClass(selectedCell));
        unhighlightClassElements(getColumnClass(selectedCell));
        unhighlightClassElements(getQuadrantClass(selectedCell));

        selectedCell.style.boxShadow = "";
    }

    selectedCell = document.getElementById(id);

    highlightClassElements(getRowClass(selectedCell));
    highlightClassElements(getColumnClass(selectedCell));
    highlightClassElements(getQuadrantClass(selectedCell));

    selectedCell.style.boxShadow = "0px 0px 0px 3px blue inset";

    selectMatchingValues();
}

function deselectCell() {
    unhighlightClassElements(getRowClass(selectedCell));
    unhighlightClassElements(getColumnClass(selectedCell));
    unhighlightClassElements(getQuadrantClass(selectedCell));

    selectedCell.style.boxShadow = "";

    deselectMatchingValues();
    selectedCell = null;
}

function deselectMatchingValues() {
    if (selectedCell !== null && selectedCell.innerHTML !== null &&
        selectedCell.innerHTML !== "") {
        for (var r = 0; r < BOARD_ROWS; r++){
            for (var c = 0; c < BOARD_COLUMNS; c++){
                var cell = document.getElementById("c" + r + c);
                var cellValue = cell.innerHTML;
                if (selectedCell.innerHTML === cellValue)
                    cell.classList.remove("match");
            }
        }
    }
}

function selectMatchingValues() {
    if (selectedCell !== null && selectedCell.innerHTML !== null &&
        selectedCell.innerHTML !== "" && !selectedCell.classList.contains("note")) {
        for (var r = 0; r < BOARD_ROWS; r++) {
            for (var c = 0; c < BOARD_COLUMNS; c++) {
                var cell = document.getElementById("c" + r + c);
                var cellValue = cell.innerHTML;
                if (selectedCell.innerHTML === cellValue)
                    cell.classList.add("match");
            }
        }
    }
}

function getRowClass(cell) {
    var rowIndex = parseInt(cell.id.charAt(1));
    return "row" + rowIndex;
}

function getColumnClass(cell) {
    var colIndex = parseInt(cell.id.charAt(2));
    return "col" + colIndex;
}

function getQuadrantClass(cell) {
    row = parseInt(cell.id.charAt(1));
    col = parseInt(cell.id.charAt(2));
    quad = parseInt(row / 3) * 3 + parseInt(col / 3);
    return "quad" + quad;
}

function highlightClassElements(className) {
    var elements = document.getElementsByClassName(className);

    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.add("highlight");
    }
}

function unhighlightClassElements(className) {
    var elements = document.getElementsByClassName(className);

    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.remove("highlight");
    }
}
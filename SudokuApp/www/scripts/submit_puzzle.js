var board = document.getElementById("gameboard");
var numPad = document.getElementById("numPad");
var controlPad = document.getElementById("controlPad");
const BOARD_ROWS = 9;
const BOARD_COLUMNS = 9;
const BOARD_CELLS = 81;
var potentialErrors = 0;
var cellsFilled = 0;
var selectedCell = null;
var puzzle = null;


$(document).ready(function () {
    // Apply cell selection listeners and add the puzzle to the puzzle board
    if (board !== null) {
        for (var r = 0; r < BOARD_ROWS; r++) {
            for (var c = 0; c < BOARD_COLUMNS; c++) {
                var cell = document.getElementById("c" + r + c);

                cell.innerHTML = "";

                cell.onclick = function () {
                    selectCell(this.id);
                };
            }
        }
    }

    // Apply event listeners to number buttons
    if (numPad !== null) {
        var allBtns = document.getElementsByTagName("button");
        for (var i = 0; i < allBtns.length; i++) {
            allBtns[i].style.backgroundColor = "#e6e6e6";
        }

        for (var j = 1; j < 10; j++)
            document.getElementById("btn" + j).addEventListener("click", function () {
                editCell(this.id);
            });
    }
});

$(document).ready(function () {
    $('#body').on('click', function (event) {
        if (selectedCell !== null && !$(event.target).closest('table').length) {
            deselectCell();
        }
    });
});

document.addEventListener('deviceready', function () {
    document.getElementById("clearBtn").addEventListener("click", function () {
        if (selectedCell !== null && selectedCell.innerHTML !== "" && selectedCell.innerHTML !== null) {
            if (selectedCell.classList.contains("error"))
                checkErrorsResolved(selectedCell.innerHTML);

            cellsFilled--;
            deselectMatchingValues();
            selectedCell.innerHTML = "";
        }
    });

    document.getElementById("solveBtn").addEventListener("click", function () {
        if (potentialErrors > 0) {
            navigator.notification.alert("Your puzzle has " + potentialErrors + " error(s).  Please fix and retry.",
                ignore,
                "Errors Detected!",
                "Confirm");
        }
        else if (cellsFilled < 1) {
            navigator.notification.alert("Your puzzle does not have any clue(s).",
                ignore,
                "Invalid Puzzle!",
                "Confirm");
        }
        else {
            puzzle = getPuzzle();

            var solver = new SolutionGenerator(puzzle.puzzle);
            puzzle.solutions = solver.generateSolution();
            puzzle.isSolved = true;
            var numSolutions = puzzle.solutions.length;
            if (numSolutions > 0) puzzle.hasSolution = true;

            if (numSolutions > 1 && numSolutions < 10) {
                navigator.notification.confirm("Your puzzle has " + numSolutions + " solutions. Do you still wish to solve this puzzle?",
                    confirmSolve,
                    "Multiple Solutions",
                    ["Continue", "Cancel"]);
            }
            else if (numSolutions >= 10) {
                navigator.notification.confirm("Your puzzle has 10+ solutions. Do you still wish to solve this puzzle?",
                    confirmSolve,
                    "Multiple Solutions",
                    ["Continue", "Cancel"]);
            }
            else if (numSolutions <= 0) {
                navigator.notification.alert("Your puzzle does not have a solution. Please enter a new puzzle.",
                    ignore,
                    "No Solution!",
                    "Confirm");
            }
            else {
                window.sessionStorage.setItem("activePuzzle", JSON.stringify(puzzle));
                window.sessionStorage.setItem("activePuzzleID", null);
                window.location = "game.html";
            }            
        }
    });

    document.getElementById("saveBtn").addEventListener("click", function () {
        if (potentialErrors > 0) {
            navigator.notification.alert("Your puzzle has " + potentialErrors + " error(s).  Please fix and retry.",
                ignore,
                "Errors Detected!",
                "Confirm");
        }
        else if (cellsFilled < 1) {
            navigator.notification.alert("Your puzzle does not have any clue(s).",
                ignore,
                "Invalid Puzzle!",
                "Confirm");
        }
        else {
            puzzle = getPuzzle();

            var solver = new SolutionGenerator(puzzle.puzzle);
            puzzle.solutions = solver.generateSolution();
            puzzle.isSolved = true;
            var numSolutions = puzzle.solutions.length;
            if (numSolutions > 0) puzzle.hasSolution = true;

            if (numSolutions > 1 && numSolutions < 10) {
                navigator.notification.confirm("Your puzzle has " + numSolutions + " solutions. Do you still wish to save this puzzle?",
                    confirmSave,
                    "Multiple Solutions",
                    ["Continue", "Cancel"]);
            }
            else if (numSolutions >= 10) {
                navigator.notification.confirm("Your puzzle has 10+ solutions. Do you still wish to save this puzzle?",
                    confirmSave,
                    "Multiple Solutions",
                    ["Continue", "Cancel"]);
            }
            else if (numSolutions <= 0) {
                navigator.notification.alert("Your puzzle does not have a solution. Please enter a new puzzle.",
                    ignore,
                    "No Solution!",
                    "Confirm");
            }
            else {
                savePuzzle();
            }            
        }
    });

    document.getElementById("resetBtn").addEventListener("click", function () {
        reset();
    });
});

function confirmSolve(index) {
    if (index === 1) {
        window.sessionStorage.setItem("activePuzzle", JSON.stringify(puzzle));
        window.sessionStorage.setItem("activePuzzleID", null);
        window.location = "game.html";
    }
}

function confirmSave(index) {
    if (index === 1) {
        savePuzzle();
    }
}

async function savePuzzle() {
    var db = new SudokuDatabase();
    if ("success" === await db.insertPuzzle(JSON.stringify(puzzle)))
        navigator.notification.alert("Your puzzle has been saved successfully!",
            reset,
            "Success!",
            "Confirm");
}

function getPuzzle() {
    let p = new Array();
    for (var r = 0; r < BOARD_ROWS; r++) {
        for (var c = 0; c < BOARD_COLUMNS; c++) {
            p.push(document.getElementById("c" + r + c).innerHTML);
        }
    }
    return new Puzzle(p);
}

function ignore() { }

function reset() {
    cellsFilled = 0;
    potentialErrors = 0;
    if (selectedCell !== null) deselectCell();

    for (var r = 0; r < BOARD_ROWS; r++) {
        for (var c = 0; c < BOARD_COLUMNS; c++) {
            var cell = document.getElementById("c" + r + c);
            cell.innerHTML = "";
            if (cell.classList.contains("error")) cell.classList.remove("error");
        }
    }
}

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
        for (var r = 0; r < BOARD_ROWS; r++) {
            for (var c = 0; c < BOARD_COLUMNS; c++) {
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

function checkErrors(value) {
    var rowError = false;
    var colError = false;
    var quadError = false;
    rowError = identifyErrors(getRowClass(selectedCell), value);
    colError = identifyErrors(getColumnClass(selectedCell), value);
    quadError = identifyErrors(getQuadrantClass(selectedCell), value);

    if (rowError > 0 || colError > 0 || quadError > 0) {
        selectedCell.classList.add("error");
        potentialErrors++;
    }
}

function identifyErrors(className, value) {
    var elements = document.getElementsByClassName(className);
    var duplicates = [];

    for (var x = 0; x < elements.length; x++) {
        if (elements[x].innerHTML === value && elements[x].id !== selectedCell.id)
            duplicates.push(elements[x]);
    }

    //starts at 0 because the btn value hasn't been added to the grid yet
    if (duplicates.length > 0) {
        for (var i = 0; i < duplicates.length; i++) {
            if (!duplicates[i].classList.contains("error")) {
                duplicates[i].classList.add("error");
                potentialErrors++;
            }
        }
    }
    return duplicates.length;
}

function checkErrorsResolved(value) {
    if (!selectedCell.classList.contains("error")) return;

    identifyResolvedErrors(getRowClass(selectedCell), value);
    identifyResolvedErrors(getColumnClass(selectedCell), value);
    identifyResolvedErrors(getQuadrantClass(selectedCell), value);

    selectedCell.classList.remove("error");
    potentialErrors--;
}

function identifyResolvedErrors(className, value) {
    var elements = document.getElementsByClassName(className);
    var duplicates = [];

    for (var x = 0; x < elements.length; x++) {
        if (elements[x].innerHTML === value && elements[x].id !== selectedCell.id)
            duplicates.push(elements[x]);
    }

    // starts at 1 because only one value can match the selected value
    if (duplicates.length <= 1) {
        for (var i = 0; i < duplicates.length; i++) {
            if (duplicates[i].classList.contains("error") &&
                (identifyErrors(getRowClass(duplicates[i]), value) - 1 === 0 &&
                    identifyErrors(getColumnClass(duplicates[i]), value) - 1 === 0 &&
                    identifyErrors(getQuadrantClass(duplicates[i]), value) - 1 === 0)) {
                duplicates[i].classList.remove("error");
                potentialErrors--;
            }
        }
    }
    else
        for (var j = 0; j < duplicates.length; j++) {
            if (!duplicates[j].classList.contains("error")) {
                duplicates[j].classList.add("error");
                potentialErrors++;
            }
        }
}

function editCell(btnID) {
    var btnValue = document.getElementById(btnID).value;
    var newValue = null;

    if (selectedCell !== null) {

        // If the cell is empty and the note button is not selected fill it with the value of 
        // the button selected. If applicable remove the note tag
        if (selectedCell.innerHTML === null || selectedCell.innerHTML === "") {
            newValue = document.createTextNode(btnValue);
            cellsFilled++;
            checkErrors(btnValue);
        }

        // If the cell is filled with a value that matches the value of the selected button, 
        // clear the contents of the cell
        else if (selectedCell.innerHTML === btnValue) {
            newValue = document.createTextNode("");
            cellsFilled--;
            checkErrorsResolved(btnValue);
            deselectMatchingValues();
        }
        else {
            var currentValue = selectedCell.innerHTML;
            deselectMatchingValues();
            checkErrorsResolved(currentValue);
            newValue = document.createTextNode(btnValue);
            checkErrors(btnValue);
        }

        selectedCell.innerHTML = "";
        selectedCell.appendChild(newValue);
        selectMatchingValues();
    }
}
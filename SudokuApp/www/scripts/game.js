var board = document.getElementById("gameboard");
var keypad = document.getElementById("keypad");
const BOARD_ROWS = 9;
const BOARD_COLUMNS = 9;
const BOARD_CELLS = 81;
const MOVE_TYPE_EMPTY = 0;
const MOVE_TYPE_NORMAL = 1;
const MOVE_TYPE_NOTE = 2;
var potentialErrors = 0;
var cellsFilled = 0;
var selectedCell = null;
var noteModeActive = false;
let timer;
let moves = new Array();

var aPuzzle = null;
var aProgress = null;
var aID = null;
var aTimer = 0;
var aStatus = "";
var aMoves = null;
var db = null;

var defaultPuzzle = ["", "", "7", "", "", "", "9", "", "",
    "", "5", "", "", "1", "4", "8", "", "",
    "", "1", "8", "2", "", "", "", "", "5",
    "", "4", "6", "1", "8", "", "", "5", "",
    "8", "", "", "7", "", "6", "", "", "3",
    "", "9", "", "", "4", "5", "2", "8", "",
    "5", "", "", "", "", "3", "1", "6", "",
    "", "", "2", "8", "5", "", "", "9", "",
    "", "", "9", "", "", "", "5", "", ""];


$(document).ready(function () {
    db = new SudokuDatabase();

    var temp = sessionStorage.getItem("activePuzzle");
    aID = sessionStorage.getItem("activePuzzleID");

    if (temp !== null) {
        aPuzzle = JSON.parse(temp).puzzle;
        aProgress = JSON.parse(temp).progress;
        aTimer = JSON.parse(temp).timer;
        aStatus = JSON.parse(temp).status;
        aMoves = JSON.parse(temp).moves;
    }
    else
        aPuzzle = defaultPuzzle;

    // Apply cell selection listeners and add the puzzle to the puzzle board
    if (board !== null) {
        for (var r = 0; r < BOARD_ROWS; r++) {
            for (var c = 0; c < BOARD_COLUMNS; c++) {
                var cell = document.getElementById("c" + r + c);
                var index = r * BOARD_ROWS + c;

                cell.onclick = function () {
                    selectCell(this.id);
                };
            }
        }

        if (aStatus === "New")
            newGame();
        else
            resumeGame();
    }

    // Apply event listeners to number buttons
    if (keypad !== null) {
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

document.getElementById("notesBtn").addEventListener("click", function () {
    if (!noteModeActive) {
        noteModeActive = true;
        this.style.backgroundColor = "#bfbfbf";
        this.style.border = "1px solid darkslategrey";
        this.style.boxShadow = "0px 0px 0px 1px darkslategrey inset";
    }
    else {
        noteModeActive = false;
        this.style.backgroundColor = "#e6e6e6";
        this.style.border = "";
        this.style.boxShadow = "";
    }
});

document.getElementById("clearBtn").addEventListener("click", function () {
    if (selectedCell !== null && !selectedCell.classList.contains("clue") &&
        selectedCell.innerHTML !== "" && selectedCell.innerHTML !== null) {
        if (selectedCell.classList.contains("error")) {
            checkErrorsResolved(selectedCell.innerHTML);
        }
        if (!selectedCell.classList.contains("note"))
            cellsFilled--;
        var clrMove = null;
        if (selectedCell.classList.contains("note"))
            clrMove = new Move(selectedCell.id, MOVE_TYPE_NOTE, selectedCell.innerHTML, MOVE_TYPE_EMPTY, "");
        else
            clrMove = new Move(selectedCell.id, MOVE_TYPE_NORMAL, selectedCell.innerHTML, MOVE_TYPE_EMPTY, "");

        deselectMatchingValues();
        selectedCell.innerHTML = "";
        moves.push(clrMove);
    }
});

document.getElementById("undoBtn").addEventListener("click", function () {
    if (moves.length >= 1) {
        let move = moves.pop();

        selectCell(move.cellID);
        var previousType = move.previousType;
        var previousValue = move.previousValue;
        var newType = move.newType;
        var newValue = move.newValue;

        var undoResult = null;

        if (previousType === MOVE_TYPE_EMPTY && newType === MOVE_TYPE_NORMAL) {
            cellsFilled--;
            checkErrorsResolved(newValue);
            undoResult = document.createTextNode("");
            deselectMatchingValues();
        }
        else if (previousType === MOVE_TYPE_EMPTY && newType === MOVE_TYPE_NOTE) {
            undoResult = document.createTextNode("");
        }
        else if (previousType === MOVE_TYPE_NORMAL && newType === MOVE_TYPE_EMPTY) {
            cellsFilled++;
            checkErrors(previousValue);
            undoResult = document.createTextNode(previousValue);
        }
        else if (previousType === MOVE_TYPE_NORMAL && newType === MOVE_TYPE_NOTE) {
            cellsFilled++;
            checkErrors(previousValue);
            selectedCell.classList.remove("note");
            undoResult = document.createTextNode(previousValue);
        }
        else if (previousType === MOVE_TYPE_NOTE && newType === MOVE_TYPE_NORMAL) {
            cellsFilled--;
            checkErrorsResolved(newValue);
            selectedCell.classList.add("note");
            undoResult = getNote(previousValue);
            deselectMatchingValues();
        }
        else if (previousType === MOVE_TYPE_NOTE && newType === MOVE_TYPE_EMPTY) {
            selectedCell.classList.add("note");
            undoResult = getNote(previousValue);
        }
        else if (previousType === MOVE_TYPE_NOTE && newType === MOVE_TYPE_NOTE) {
            undoResult = getNote(previousValue);
        }

        selectedCell.innerHTML = "";
        selectedCell.appendChild(undoResult);
        if (previousType === MOVE_TYPE_NORMAL) selectMatchingValues();
    }
});

$(document).ready(function () {
    $('#body').on('click', function (event) {
        if (selectedCell !== null && !$(event.target).closest('table').length) {
            deselectCell();
        }
    });
});

function newGame() {
    for (var r = 0; r < BOARD_ROWS; r++) {
        for (var c = 0; c < BOARD_COLUMNS; c++) {
            var cell = document.getElementById("c" + r + c);
            var index = r * BOARD_ROWS + c;
            selectedCell = cell;

            if (aPuzzle[index] !== null && aPuzzle[index] !== "" && aPuzzle[index] !== "0") {
                cell.innerHTML = aPuzzle[index];
                cell.classList.add("clue");
                cellsFilled++;
                checkErrors(aPuzzle[index]);
            }
            else {
                cell.innerHTML = "";
                cell.classList.remove("clue");
            }
        }
    }

    selectedCell = null;

    timer = new Timer("timer");
    timer.run();
}

function resumeGame() {
    for (var r = 0; r < BOARD_ROWS; r++) {
        for (var c = 0; c < BOARD_COLUMNS; c++) {
            var cell = document.getElementById("c" + r + c);
            var index = r * BOARD_ROWS + c;
            selectedCell = cell;

            if (aPuzzle[index] !== null && aPuzzle[index] !== "" && aPuzzle[index] !== "0") {
                cell.innerHTML = aPuzzle[index];
                cell.classList.add("clue");
                cellsFilled++;
                checkErrors(aPuzzle[index]);
            }
            else if (aProgress !== null && aProgress[index] !== null && aProgress[index] !== ""
                && aProgress[index] !== "0") {
                cell.innerHTML = aProgress[index];
                cell.classList.remove("clue");

                if (aProgress[index] !== "1" && aProgress[index] !== "2" && aProgress[index] !== "3"
                    && aProgress[index] !== "4" && aProgress[index] !== "5" && aProgress[index] !== "6"
                    && aProgress[index] !== "7" && aProgress[index] !== "8" && aProgress[index] !== "9")
                    cell.classList.add("note");

                if (!cell.classList.contains("note")) {
                    cellsFilled++;
                    checkErrors(aProgress[index]);
                }
            }
            else {
                cell.innerHTML = "";
                cell.classList.remove("clue");
            }        
        }
    }
    if (aMoves === null)
        moves = [];
    else
        moves = aMoves;

    selectedCell = null;

    timer = new Timer("timer");
    if (aTimer !== 0)
        timer.resume(timer.getTimeMillis(aTimer));
    else
        timer.run();
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
    let move = null;

    if (selectedCell !== null && !selectedCell.classList.contains("clue")) {

        // If the cell is empty and the note button is not selected fill it with the value of 
        // the button selected. If applicable remove the note tag
        if ((selectedCell.innerHTML === null || selectedCell.innerHTML === "") && !noteModeActive) {
            newValue = document.createTextNode(btnValue);
            selectedCell.classList.remove("note");
            cellsFilled++;
            checkErrors(btnValue);
            move = new Move(selectedCell.id, MOVE_TYPE_EMPTY, "", MOVE_TYPE_NORMAL, btnValue);
        }

        else if ((selectedCell.innerHTML === null || selectedCell.innerHTML === "") && noteModeActive){           
            newValue = initializeNoteAsString(currentValue, btnValue);
            selectedCell.classList.add("note");
            move = new Move(selectedCell.id, MOVE_TYPE_EMPTY, "",
                MOVE_TYPE_NOTE, btnValue);
        }

        // If the cell is filled with a value that matches the value of the selected button, 
        // clear the contents of the cell
        else if (selectedCell.innerHTML === btnValue) {
            newValue = document.createTextNode("");
            cellsFilled--;
            checkErrorsResolved(btnValue);
            move = new Move(selectedCell.id, MOVE_TYPE_NORMAL, selectedCell.innerHTML, MOVE_TYPE_EMPTY, "");
            deselectMatchingValues();
        }

        // If the cell is not empty or note mode is active and it's current value does not match the value of 
        // the selected button proceed enter this block
        else {

            // If the selected cell does not contains a note value transform the contents into note format and 
            // add the new value to the list of notes and add the note tag
            if (!selectedCell.classList.contains("note")) {
                var currentValue = selectedCell.innerHTML;
                deselectMatchingValues();
                newValue = initializeNoteAsString(currentValue, btnValue);
                cellsFilled--;
                selectedCell.classList.add("note");
                checkErrorsResolved(currentValue);
                move = new Move(selectedCell.id, MOVE_TYPE_NORMAL, currentValue,
                    MOVE_TYPE_NOTE, currentValue + btnValue);
            }
            else {
                var currNotes = getNoteValues(selectedCell); // string containing all the note values in the selected cell without spaces
                var newNotes = null;

                // If the note list in the selected cell does not contain the value of the selected button
                // add the new value to the list of notes
                if (!currNotes.includes(btnValue)) {
                    newNotes = currNotes + btnValue;
                    newValue = getNote(newNotes);
                    move = new Move(selectedCell.id, MOVE_TYPE_NOTE, currNotes, MOVE_TYPE_NOTE, newNotes);
                }

                // If the note contains the value of the button remove that value from the list of notes
                else {
                    newNotes = currNotes.replace(btnValue, "");

                    // If there is one or fewer note values remaining in the list of notes proceed here
                    if (newNotes.length <= 1) {

                        // If the note button is not selected and the there is one value remaining in the 
                        // note list, remove the note tag
                        if (!noteModeActive && newNotes.length === 1) {
                            newValue = document.createTextNode(newNotes);
                            selectedCell.classList.remove("note");
                            cellsFilled++;
                            checkErrors(newNotes.charAt(0));
                            move = new Move(selectedCell.id, MOVE_TYPE_NOTE, currNotes, MOVE_TYPE_NORMAL, newNotes);
                        }

                        // Remove the note from the note list but leave the contents in note format
                        else if (newNotes.length === 1) {
                            newValue = getNote(newNotes);
                            move = new Move(selectedCell.id, MOVE_TYPE_NOTE, currNotes, MOVE_TYPE_NOTE, newNotes);
                        }

                        // If there are no values remaining in the note 
                        else {
                            newValue = document.createTextNode("");
                            selectedCell.classList.remove("note");
                            //checkErrorsResolved("-1");
                            move = new Move(selectedCell.id, MOVE_TYPE_NOTE, currNotes, MOVE_TYPE_EMPTY, "");
                        }
                    }

                    // If there is more than one note value remaining in the cell
                    else {
                        newValue = getNote(newNotes);
                        move = new Move(selectedCell.id, MOVE_TYPE_NOTE, currNotes, MOVE_TYPE_NOTE, newNotes);
                    }
                }
            }
        }
        
        selectedCell.innerHTML = "";
        selectedCell.appendChild(newValue);
        moves.push(move);
        selectMatchingValues();
        checkGameOver();
    }
}

function checkGameOver(){
    if (cellsFilled === BOARD_CELLS && potentialErrors === 0) {

        deselectCell();
        timer.stopTimer();

        navigator.notification.alert("You finished the puzzle!\nYour time was " + timer.getTime(),
            endGame,
            "Congratulations!",
            "Finish");
    }
}

document.addEventListener("backbutton", onBackKeyDown, false);

async function onBackKeyDown() {
    for (var r = 0; r < BOARD_ROWS; r++) {
        for (var c = 0; c < BOARD_COLUMNS; c++) {
            var cell = document.getElementById("c" + r + c);
            var index = r * BOARD_ROWS + c;

            if (cell.innerHTML === null || cell.innerHTML === "" || cell.innerHTML === "0")
                aProgress[index] = "";
            else
                aProgress[index] = cell.innerHTML;
        }
    }

    var temp = sessionStorage.getItem("activePuzzle");

    if (temp !== null && aID !== null) {
        var p = JSON.parse(temp);
        p.progress = aProgress;        
        p.moves = moves;
        p.date = new Date();

        if (moves.length === 0) {
            p.timer = 0;
            p.status = "New";
        }
        else {
            p.timer = timer.getTime();
            p.status = "In Progress";
        }


        await db.updatePuzzle(aID, JSON.stringify(p));
    }

    window.history.back();
}

async function endGame() {
    for (var r = 0; r < BOARD_ROWS; r++) {
        for (var c = 0; c < BOARD_COLUMNS; c++) {
            var cell = document.getElementById("c" + r + c);
            var index = r * BOARD_ROWS + c;

            if (cell.innerHTML === null || cell.innerHTML === "" || cell.innerHTML === "0")
                aProgress[index] = "";
            else
                aProgress[index] = cell.innerHTML;
        }
    }

    var temp = sessionStorage.getItem("activePuzzle");

    if (temp !== null && aID !== null) {
        var p = JSON.parse(temp);
        p.progress = aProgress;
        p.timer = timer.getTime();
        p.date = new Date();
        p.moves = moves;
        p.status = "Completed";

        await db.updatePuzzle(aID, JSON.stringify(p));
    }

    window.history.back();
}

function initializeNoteAsString(currValue, newValue) {
    var table = document.createElement("table");
    table.classList.add("noteTable");

    var cursor = 1;
    for (var r = 0; r < 3; r++) {
        var row = document.createElement("tr");
        row.classList.add("noteRow");

        for (var c = 0; c < 3; c++) {
            var cell = document.createElement("td");
            cell.classList.add("noteCell");

            if ("" + cursor === currValue || "" + cursor === newValue)
                cell.appendChild(document.createTextNode(cursor));

            row.appendChild(cell);
            cursor++;
        }

        table.appendChild(row);
    }

    return table;
}

function getNoteValues(cell, value) {
    var string = cell.innerText;
    string = string.replace(/\s/g, "");
    return string;
}

function getNote(notes) {
    var table = document.createElement("table");
    table.classList.add("noteTable");

    var cursor = 1;
    for (var r = 0; r < 3; r++) {
        var row = document.createElement("tr");
        row.classList.add("noteRow");

        for (var c = 0; c < 3; c++) {
            var cell = document.createElement("td");
            cell.classList.add("noteCell");

            if (notes.includes(cursor))
                cell.appendChild(document.createTextNode(cursor));

            row.appendChild(cell);
            cursor++;
        }

        table.appendChild(row);
    }

    return table;
}
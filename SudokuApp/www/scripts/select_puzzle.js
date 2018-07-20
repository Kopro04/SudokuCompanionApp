var sudokuDB = null;
var puzzles = [];
const ID = 0;
const PUZZLE = 1;
var selectedListIndex = null;

document.addEventListener('deviceready', function () {
    readPuzzles();
});

async function readPuzzles() {
    sudokuDB = new SudokuDatabase();

    puzzles = await sudokuDB.getPuzzles();
    formatPuzzleList();
}

function formatPuzzleList() {
    var list = "";
    for (var i = 0; i < puzzles.length; i++) {
        var p = JSON.parse(puzzles[i][PUZZLE]);
        var date = new Date(Date.parse(p.date));

        list += "<div id='" + i + "'>";
        list += "<span id='id" + i + "' class='puzzleID'>ID: " + puzzles[i][ID] + "</span>";
        list += "<p><span class='puzzleName'>Puzzle " + (i + 1) + "       </span>";

        if (p.status === "New")
            list += "<span class='puzzleStatus'>(Status: <span style='color: #0fef0b;'>"
                + p.status + "</span>)<br></span>";
        else if (p.status === "In Progress")
            list += "<span class='puzzleStatus'>(Status: <span style='color: #1524f2;'>"
                + p.status + "</span>)<br></span>";
        else if (p.status === "Completed")
            list += "<span class='puzzleStatus'>(Status: <span style='color: #e50909;'>"
                + p.status + "</span>)<br></span>";
        else
            list += "<br>";

        list += "<span class='puzzleDate'>Created/Updated on: " + date.toLocaleDateString() + " "
            + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
            + "</span>";
        list += "</p></div>";
    }
    if (list === "") list = "(No puzzles available)";

    document.getElementById("puzzleMenu").innerHTML = list;

    applyListeners();
}

function applyListeners() {
    for (var i = 0; i < puzzles.length; i++) {

        if (i === 0) {
            if (i !== puzzles.length - 1)
                document.getElementById("" + i).classList.add("bottom");
        }
        else if (i === puzzles.length - 1) document.getElementById("" + i).classList.add("top");
        else {
            document.getElementById("" + i).classList.add("top");
            document.getElementById("" + i).classList.add("bottom");
        }

        document.getElementById("" + i).addEventListener("click", function () {
            var selectedPuzzle = JSON.parse(puzzles[parseInt(this.id)][PUZZLE]);
            var selectedPuzzleID = puzzles[parseInt(this.id)][ID];
            selectedListIndex = parseInt(this.id);

            if (selectedPuzzle !== null && selectedPuzzleID !== null
                && selectedPuzzle.status === "New") {
                navigator.notification.confirm("What would you like to do?",
                    newPuzzleSelected,
                    "Puzzle Selected",
                    ["Solve Now", "Delete"]);
            }
            else if (selectedPuzzle !== null && selectedPuzzleID !== null
                && selectedPuzzle.status === "In Progress") {
                navigator.notification.confirm("What would you like to do?",
                    inProgressPuzzleSelected,
                    "Puzzle Selected",
                    ["Resume Solving", "Reset Puzzle", "Delete"]);
            }
            else if (selectedPuzzle !== null && selectedPuzzleID !== null
                && selectedPuzzle.status === "Completed") {
                navigator.notification.confirm("What would you like to do?",
                    completedPuzzleSelected,
                    "Puzzle Selected",
                    ["Reset Puzzle", "Delete"]);
            }
        });
    }
}

async function newPuzzleSelected(index) {
    if (index === 1) {
        window.sessionStorage.setItem("activePuzzle", puzzles[selectedListIndex][PUZZLE]);
        window.sessionStorage.setItem("activePuzzleID", puzzles[selectedListIndex][ID]);

        window.location = "game.html";
    }
    else if (index === 2) {
        var id = puzzles[selectedListIndex][ID];
        if (await sudokuDB.deletePuzzle(puzzles[selectedListIndex][ID]))
            navigator.notification.alert("Your puzzle has been deleted successfully!",
                reload,
                "Success!",
                "Confirm");
        else
            navigator.notification.alert("An error occurred, the puzzle was not deleted.",
                reload,
                "Error!",
                "Confirm");
    }
}

async function inProgressPuzzleSelected(index) {
    if (index === 1) {
        window.sessionStorage.setItem("activePuzzle", puzzles[selectedListIndex][PUZZLE]);
        window.sessionStorage.setItem("activePuzzleID", puzzles[selectedListIndex][ID]);

        window.location = "game.html";
    }
    else if (index === 2) {
        var p = JSON.parse(puzzles[selectedListIndex][PUZZLE]);
        p.progress = p.puzzle;
        p.moves = [];
        p.date = new Date();
        p.timer = 0;
        p.status = "New";

        if (await sudokuDB.updatePuzzle(puzzles[selectedListIndex][ID], JSON.stringify(p)))
            navigator.notification.alert("Your puzzle has been reset successfully!",
                reload,
                "Success!",
                "Confirm");
        else
            navigator.notification.alert("An error occurred, the puzzle was not reset.",
                reload,
                "Error!",
                "Confirm");
    }
    else if (index === 3) {
        if (await sudokuDB.deletePuzzle(puzzles[selectedListIndex][ID]))
            navigator.notification.alert("Your puzzle has been deleted successfully!",
                reload,
                "Success!",
                "Confirm");
        else
            navigator.notification.alert("An error occurred, the puzzle was not deleted.",
                reload,
                "Error!",
                "Confirm");
    }
}

async function completedPuzzleSelected(index) {
    if (index === 1) {
        var p = JSON.parse(puzzles[selectedListIndex][PUZZLE]);
        p.progress = p.puzzle;
        p.moves = [];
        p.date = new Date();
        p.timer = 0;
        p.status = "New";

        var p = JSON.parse(puzzles[selectedListIndex][PUZZLE]);
        p.progress = p.puzzle;
        p.moves = [];
        p.date = new Date();
        p.timer = 0;
        p.status = "New";

        if (await sudokuDB.updatePuzzle(puzzles[selectedListIndex][ID], JSON.stringify(p)))
            navigator.notification.alert("Your puzzle has been reset successfully!",
                reload,
                "Success!",
                "Confirm");
        else
            navigator.notification.alert("An error occurred, the puzzle was not reset.",
                reload,
                "Error!",
                "Confirm");
    }
    else if (index === 2) {
        if (await sudokuDB.deletePuzzle(puzzles[selectedListIndex][ID]))
            navigator.notification.alert("Your puzzle has been deleted successfully!",
                reload,
                "Success!",
                "Confirm");
        else
            navigator.notification.alert("An error occurred, the puzzle was not deleted.",
                reload,
                "Error!",
                "Confirm");
    }
}

function reload() {
    window.location.reload(true);
}
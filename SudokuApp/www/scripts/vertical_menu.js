$(document).ready(function () {
    var selectPuzzle = document.getElementById("selectPuzzle");
    var submitPuzzle = document.getElementById("submitPuzzle");
    var autosolve = document.getElementById("autosolve");

    selectPuzzle.addEventListener("click", function () {
        window.location = "select_puzzle.html";
    });

    submitPuzzle.addEventListener("click", function () {
        window.location = "submit_puzzle.html";
    });

    autosolve.addEventListener("click", function () {
        window.location = "autosolve.html";
    });
});
class SudokuDatabase {
    constructor() {
        this.sudokuDB = null;
    }

    connect() {
        this.openDatabase();
        this.openTable();
    }

    openDatabase() {
        this.sudokuDB = window.sqlitePlugin.openDatabase({
            name: "sudoku.db",
            location: 'default'
        });
    }

    openTable() {
        this.sudokuDB.transaction(function (trans) {
            trans.executeSql('CREATE TABLE IF NOT EXISTS PuzzleTable (id integer primary key, puzzle text)');
        }, function (error) {
            console.log('transaction error (table opening): ' + error.message);
        }, function () {
            console.log('Table Opened');
        });
    }

    closeDatabase() {
        this.sudokuDB.close(function () {
            console.log("DB closed!");
        }, function (error) {
            console.log("Error closing DB:" + error.message);
        });
    }

    insertPuzzle(puzzle) {
        return new Promise(resolve => {
            this.connect();

            this.sudokuDB.transaction(function (trans) {
                var query = "INSERT INTO PuzzleTable (puzzle) VALUES (?)";

                trans.executeSql(query, [puzzle], function (trans, resultSet) {
                    console.log('Puzzle Inserted');
                }, function (trans, error) {
                    console.log('INSERT error: ' + error.message);
                });
            }, function (error) {
                console.log('transaction error (insert): ' + error.message);
                resolve("failure");
            }, function () {
                console.log('Transaction Success (insert): Puzzle Inserted');
                resolve("success");
            });

        });
    }

    updatePuzzle(puzzle) {

    }

    getPuzzles() {
        return new Promise(resolve => {
            this.connect();
            var puzzleDB = [];

            this.sudokuDB.transaction(function (trans) {

                var query = "SELECT id, puzzle FROM PuzzleTable";

                trans.executeSql(query, [], function (trans, resultSet) {
                    console.log('Select Success: Read Puzzles');
                    for (var x = 0; x < resultSet.rows.length; x++) {
                        puzzleDB.push([resultSet.rows.item(x).id, resultSet.rows.item(x).puzzle]);
                    }
                },
                    function (trans, error) {
                        console.log('SELECT error (read puzzles): ' + error.message);
                    });
            }, function (error) {
                console.log('transaction error (read puzzles): ' + error.message);
                resolve([]);
            }, function () {
                console.log('Transaction Success: Read Puzzles');
                resolve(puzzleDB);
            });
        });
    }

    updatePuzzle(id, puzzle) {
        return new Promise(resolve => {
            this.connect();
            this.sudokuDB.transaction(function (trans) {

                var query = "UPDATE puzzleTable SET puzzle = ? WHERE id = ?";

                trans.executeSql(query, [puzzle, id], function (trans, resultSet) {
                    console.log("UpdateId: " + resultSet.insertId);
                    console.log("rowsAffected: " + resultSet.rowsAffected);
                },
                    function (trans, error) {
                        console.log('UPDATE error: ' + error.message);
                    });
            }, function (error) {
                console.log('transaction error: ' + error.message);
                resolve(false);
            }, function () {
                console.log('transaction ok');
                resolve(true);
            });
        });
    }

    deletePuzzle(id) {
        return new Promise(resolve => {
            this.connect();
            this.sudokuDB.transaction(function (trans) {

                var query = "DELETE FROM puzzleTable WHERE id = ?";

                trans.executeSql(query, [id], function (trans, resultSet) {
                    console.log("removeId: " + resultSet.insertId);
                    console.log("rowsAffected: " + resultSet.rowsAffected);
                },
                    function (trans, error) {
                        console.log('DELETE error: ' + error.message);
                    });
            }, function (error) {
                console.log('transaction error: ' + error.message);
                resolve(false);
            }, function () {
                console.log('transaction ok');
                resolve(true);
            });
        });
    }

    dropTable() {
        this.connect();

        this.sudokuDB.transaction(function (trans) {

            var query = "DROP TABLE PuzzleTable";

            trans.executeSql(query, [], function (trans, resultSet) {
                console.log("Table Dropped");
            }, function (trans, error) {
                console.log('DROP error: ' + error.message);
            });
        }, function (error) {
            console.log('transaction error (drop): ' + error.message);
        }, function () {
            console.log('transaction ok (drop)');
        });
    }
}
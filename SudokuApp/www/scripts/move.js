class Move {
    constructor(cellID, previousType, previousValue, newType, newValue) {
        this.cellID = cellID; // id of cell where move ocurred
        this.previousType = previousType; // note = 2, normal = 1 or empty = 0, prior to edit
        this.previousValue = previousValue; // the value in the cell prior it being edited
        this.newType = newType; // note = 2, normal = 1 or empty = 0, after edit the edit
        this.newValue = newValue; // the value in the cell after it has been edited
    }

    getCellID() {
        return this.cellID;
    }

    getPreviousType() {
        return this.previousType;
    }

    getPreviousValue() {
        return this.previousValue;
    }

    getNewType() {
        return this.newType;
    }

    getNewValue() {
        return this.newValue;
    }

    printMove() {
        var str = "";
        str += "Cell ID: " + this.cellID + "\n";
        str += "Previous Type: " + this.previousType + "\n";
        str += "Previous Value: " + this.previousValue + "\n";
        str += "New Type: " + this.newType + "\n";
        str += "New Value: " + this.newValue + "\n";
        alert(str);
    }
}
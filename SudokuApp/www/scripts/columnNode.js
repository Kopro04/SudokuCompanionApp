class ColumnNode extends MatrixNode{
    constructor(name) {
        super(null);
        this.name = name;
        this.size = 0;
        this.initializeColumn();
    }

    initializeColumn() {
        this.column = this;
    }

    cover() {
        this.unlinkRL();
        for (var i = this.down; i !== this; i = i.down) {
            for (var j = i.right; j !== i; j = j.right) {
                j.unlinkUD();
                j.column.size--;
            }
        }
    }

    uncover() {
        for (var i = this.down; i !== this; i = i.down){
            for (var j = i.right; j !== i; j = j.right){
                j.relinkUD();
                j.column.size++;
            }
        }
        this.relinkRL();
    }
}
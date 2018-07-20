class MatrixNode{
    constructor(column) {
        this.up = null;
        this.down = null;
        this.left = null;
        this.right = null;
        this.column = column;
        this.initialize();
    }

    initialize() {
        this.up = this;
        this.down = this;
        this.left = this;
        this.right = this;
    }

    addDown(node) {
        if (this.column == node.column) {
            node.down = this.down;
            this.down = node;
            node.down.up = node;
            node.up = this;
        }
    }

    addRight(node) {
        node.right = this.right;
        this.right = node;
        node.right.left = node;
        node.left = this;
    }

    unlinkUD() {
        this.up.down = this.down;
        this.down.up = this.up;
    }

    relinkUD() {
        this.up.down = this;
        this.down.up = this;
    }

    unlinkRL() {
        this.left.right = this.right;
        this.right.left = this.left;
    }

    relinkRL() {
        this.left.right = this;
        this.right.left = this;
    }
}


class Graph {

    xMin: number = -10;
    xMax: number = 10;
    yMin: number = -10;
    yMax: number = 10;

    constructor() {
        game.currentScene().eventContext.registerFrameHandler(100, () => {
            this.render()
        });

    }

    render() {
        screen.fill(15);
        this.drawGrid()
    }

    drawGrid() {
        let originX = this.getScreenX(0);
        let originY = this.getScreenY(0);
        if (originX) {
            screen.fillRect(originX - 1, 0, 2, screen.height, 1);
        }
        if (originY) {
            screen.fillRect(0, originY - 1, screen.width, 2, 1);
        }
    }

    private getScreenX(x: number) {
        if (x > this.xMax || x < this.xMin) {
            return undefined;
        }

        return (screen.width / (this.xMax - this.xMin)) * (x - this.xMin);
    }

    private getScreenY(y: number) {
        if (y > this.yMax || y < this.yMin) {
            return undefined;
        }

        return (screen.height / (this.yMax - this.yMin)) * (y - this.yMin);
    }

}
let g: Graph = new Graph();
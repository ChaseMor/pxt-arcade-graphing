namespace graphs {
    export enum FunctionType {
        XBased,
        YBased,
        Parametric,
        Polar
    }

    export class Graph {

        xMin: number = -10;
        xMax: number = 10;
        yMin: number = -10;
        yMax: number = 10;

        functions: GraphableFunction[];

        constructor() {
            game.currentScene().eventContext.registerFrameHandler(100, () => {
                this.render();
            });
            this.functions = [];

        }

        addXBasedFunction(eq: (x: number) => number) {
            this.functions.push(new XBasedFunction(eq));
        }

        addYBasedFunction(eq: (y: number) => number) {
            this.functions.push(new YBasedFunction(eq));
        }

        addParametricFunction(eq: (t: number) => number[]) {
            this.functions.push(new ParametricFunction(eq));
        }

        addPolarFunction(eq: (theta: number) => number) {
            this.functions.push(new PolarFunction(eq));
        }

        render() {
            screen.fill(15);
            this.drawFunctions();
            this.drawGrid()
        }

        drawFunctions() {
            for (let f of this.functions) {
                let last: number[] = undefined;
                let bounds: number[];
                let interval: number;
                switch (f.functionType) {
                    case FunctionType.XBased:
                        bounds = [this.xMin, this.xMax];
                        interval = (this.xMax - this.xMin) / screen.width;
                        break;
                    case FunctionType.YBased:
                        bounds = [this.yMin, this.yMax];
                        interval = (this.yMax - this.yMin) / screen.height;
                        break;
                    case FunctionType.Parametric:
                        bounds = f.bounds;
                        interval = f.int;
                        break;
                    case FunctionType.Polar:
                        bounds = f.bounds;
                        interval = f.int;
                        break;
                }
                for (let p: number = bounds[0]; p < bounds[1]; p += f.int ? f.int : (this.xMax - this.xMin) / screen.width) {
                    let temp = f.compute(p);
                    if ((temp[0] >= this.yMin) && (temp[0] <= this.yMax)
                        && (temp[1] >= this.yMin) && (temp[1] <= this.yMax)) {
                        if (last) {
                            screen.drawLine(this.getScreenX(temp[0]), this.getScreenY(temp[1]),
                                this.getScreenX(last[0]), this.getScreenY(last[1]), 1);
                        }
                        last = temp;
                    }
                }
            }
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

            return screen.height - (screen.height / (this.yMax - this.yMin)) * (y - this.yMin);
        }

    }
    let g: Graph = new Graph();
    g.addXBasedFunction(function (x: number) { return 5 * Math.sin(x); });
}
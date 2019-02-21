namespace graphs {

    export enum FunctionType {
        XBased,
        YBased,
        Parametric,
        Polar
    }

    const xMin: number = 0;
    const xMax: number = 5;
    const yMin: number = 0;
    const yMax: number = 10;

    export class Graph {

        

        functions: GraphableFunction[];
        dataSeq: DataSequence[];
        dataSets: DataSet[];

        gridVisability: boolean;

        constructor() {
            game.currentScene().eventContext.registerFrameHandler(100, () => {
                this.render();
            });
            this.functions = [];
            this.dataSeq = [];
            this.dataSets = [];
            this.gridVisability = true;
        }

        addXBasedFunction(eq: (x: number) => number, color: number) {
            this.functions.push(new XBasedFunction(eq, color));
        }

        addYBasedFunction(eq: (y: number) => number, color: number) {
            this.functions.push(new YBasedFunction(eq, color));
        }

        addParametricFunction(eq: (t: number) => number[], color: number, bounds?: number[]) {
            this.functions.push(new ParametricFunction(eq, color, bounds));
        }

        addPolarFunction(eq: (theta: number) => number, color: number, bounds?: number[]) {
            this.functions.push(new PolarFunction(eq, color, bounds));
        }

        render() {
            screen.fill(1);
            this.drawCharts();
            this.drawDataSets();
            this.drawFunctions();
            if (this.gridVisability) {
                this.drawGrid()
            }
        }

        drawFunctions() {
            for (let f of this.functions) {
                let last: number[] = undefined;
                let bounds: number[];
                let interval: number;
                switch (f.functionType) {
                    case FunctionType.XBased:
                        bounds = [xMin, xMax];
                        interval = (xMax - xMin) / screen.width;
                        break;
                    case FunctionType.YBased:
                        bounds = [yMin, yMax];
                        interval = (yMax - yMin) / screen.height;
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
                for (let p: number = bounds[0]; p <= bounds[1]; p += interval) {
                    let temp = f.compute(p);
                    if ((temp[0] >= xMin) && (temp[0] <= xMax)
                        && (temp[1] >= yMin) && (temp[1] <= yMax)) {
                        if (last) {
                            screen.drawLine(this.getScreenX(temp[0]), this.getScreenY(temp[1]),
                                this.getScreenX(last[0]), this.getScreenY(last[1]), f.color);
                        }
                    }
                    last = temp;
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
            if (x > xMax || x < xMin) {
                return undefined;
            }
            return (screen.width / (xMax - xMin)) * (x - xMin);
        }

        private getScreenY(y: number) {
            if (y > yMax || y < yMin) {
                return undefined;
            }
            return screen.height - (screen.height / (yMax - yMin)) * (y - yMin);
        }

        chartDataSeq(data: number[], kind: GraphType, color?: number) {
            this.dataSeq.push(new DataSequence(data, kind, color ? color : 1));
        }

        plotDataSeq(data: number[], color?: number) {
            let dataSet: number[][] = [[], []];
            let width: number = (yMax - yMin) / data.length;
            for (let i = 0; i < data.length; i++) {
                dataSet[0].push(yMin + (width / 2) + (i * width));
                dataSet[1].push(data[i]);
            }
            this.plotDataSet(dataSet, 0, 1, color ? color : 1);
        }

        plotDataSet(data: number[][], x: number, y: number, color?: number) {
            this.dataSets.push(new DataSet(data, x, y, color ? color : 1))
        }

        drawCharts() {
            for (let sequence of this.dataSeq) {
                let width: number = screen.width / sequence.data.length;
                switch (sequence.kind) {
                    case GraphType.Bar:
                        for (let i = 0; i < sequence.data.length; i++) {
                            let value: number = sequence.data[i];
                            screen.fillRect(Math.floor(i * width),
                                value > 0 ? this.getScreenY(value) : this.getScreenY(0),
                                Math.floor((i + 1) * width) - Math.floor(i * width),
                                value == 0 ? 1 : (screen.height / (yMax - yMin)) * Math.abs(value),
                                sequence.color);

                        }
                        break;
                    case GraphType.Line:
                        width = screen.width / (sequence.data.length - 1);
                        for (let i = 0; i < sequence.data.length - 1; i++) {
                            let value1: number = sequence.data[i];
                            let value2: number = sequence.data[i + 1];
                            screen.drawLine(width * i, this.getScreenY(value1), width * (i + 1), this.getScreenY(value2), sequence.color);
                        }
                        break;
                }
            }
        }

        drawDataSets() {
            for (let dataSet of this.dataSets) {
                for (let i = 0; i < dataSet.data[0].length; i++) {
                    screen.setPixel(this.getScreenX(dataSet.data[0][i]), this.getScreenY(dataSet.data[1][i]), dataSet.color);
                }
            }
        }

    }
}
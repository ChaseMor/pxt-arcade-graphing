namespace display {

    enum PlotType {
        Scatter,
        Line,
        Histogram
    }

    interface DataSeries {
        dataSet: stats.DataSet;
        kind: PlotType;
        color: number;
    }

    interface GraphLines {
        coeff: number[];
        color: number;
    }

    class Chart {
        // Variables used for data configuration.
        private font: image.Font;

        // grid
        private gridRows: number;
        private gridCols: number;
        private gridWidth: number;
        private gridHeight: number;
        private xTicks: number;
        private yTicks: number;

        // chart rendering
        private chartWidth: number;
        private chartHeight: number;
        private scaleXMin: number;
        private scaleXMax: number;
        private scaleYMin: number;
        private scaleYMax: number;
        private axisPaddingX: number;
        private axisPaddingY: number;
        private xRange: number;
        private yRange: number;
        private xFactor: number;
        private yFactor: number;

        // estimated best number of entries
        private maxEntries: number;

        public backgroundColor: number;
        public axisColor: number;
        public plotColors: number[];

        private dataSets: DataSeries[];
        private lines: GraphLines[];

        constructor() {
            this.font = image.font5;
            this.backgroundColor = 0;
            this.axisColor = 1;
            this.plotColors = [0x9, 0x2, 0x7, 0x4, 0xa, 0x5, 0x1, 0x3, 0x6, 0xb, 0x8, 0xc, 0xd, 0xe];

            this.axisPaddingX = 22;
            this.axisPaddingY = this.font.charHeight + 4;
            this.gridRows = 2;
            this.gridCols = 2; // computed on the fly
            this.chartWidth = screen.width - this.axisPaddingX;
            this.chartHeight = screen.height - this.axisPaddingY;
            this.maxEntries = (this.chartWidth - 2);

            this.xTicks = 4;
            this.yTicks = 6;

            this.dataSets = [];
            this.lines = []
        }

        public plotSeries(xValues: number[], yValues: number[], dontSort?: boolean) {
            let data: stats.DataSet = new stats.DataSet(xValues, yValues);

            if (!dontSort) {
                data.sort();
            }
            this.dataSets.push({
                dataSet: data,
                kind: PlotType.Scatter,
                color: this.plotColors[(this.dataSets.length + this.lines.length) % this.plotColors.length]
            });
        }

        public graphSeries(xValues: number[], yValues: number[], dontSort?: boolean) {
            let data: stats.DataSet = new stats.DataSet(xValues, yValues);
            if (!dontSort) {
                data.sort();
            }
            this.dataSets.push({
                dataSet: data,
                kind: PlotType.Line,
                color: this.plotColors[(this.dataSets.length + this.lines.length) % this.plotColors.length]
            });
        }

        public graphLine(coeff: number[]) {
            this.lines.push({
                coeff: coeff,
                color: this.plotColors[(this.dataSets.length + this.lines.length) % this.plotColors.length]
            });
        }

        public render() {
            //if (this.times.length < 2) return;
            this.calculateScale();
            screen.fill(this.backgroundColor);
            this.drawAxes();
            this.drawChartGrid();
            this.drawGraphPoints();
            this.drawLines();
        }

        private calculateScale() {
            // Find min and max x values

            if (this.dataSets.length > 0) {
                this.scaleXMin = this.dataSets[0].dataSet.getMinX();
                this.scaleXMax = this.dataSets[0].dataSet.getMaxX();
                this.scaleYMin = this.dataSets[0].dataSet.getMinY();
                this.scaleYMax = this.dataSets[0].dataSet.getMaxY();

                for (let i = 1; i < this.dataSets.length; i++) {
                    this.scaleXMin = Math.min(this.scaleXMin, this.dataSets[i].dataSet.getMinX());
                    this.scaleXMax = Math.min(this.scaleXMax, this.dataSets[i].dataSet.getMaxX());
                    this.scaleYMin = Math.min(this.scaleYMin, this.dataSets[i].dataSet.getMinY());
                    this.scaleYMax = Math.min(this.scaleYMax, this.dataSets[i].dataSet.getMaxY());
                }
            }

            // avoid empty interval
            if (this.scaleXMin === this.scaleXMax)
                this.scaleXMax = this.scaleXMin + 1; // TODO
            if (this.scaleYMin === this.scaleYMax)
                this.scaleYMax = this.scaleYMin + 1; // TODO

            // update axis to look better
            let rx = generateSteps(this.scaleXMin, this.scaleXMax, this.xTicks);
            this.scaleXMin = rx[0];
            this.scaleXMax = rx[1];
            this.gridCols = rx[2];
            let ry = generateSteps(this.scaleYMin, this.scaleYMax, this.yTicks);
            this.scaleYMin = ry[0];
            this.scaleYMax = ry[1];
            this.gridRows = ry[2];

            // update y-axis width
            let xl = 0;
            this.yRange = this.scaleYMax - this.scaleYMin;
            const yUnit = this.yRange / this.gridRows;
            for (let i = 0; i <= this.gridRows; ++i)
                xl = Math.max(roundWithPrecision(this.scaleYMax - (i * yUnit), 2).toString().length, xl);
            this.axisPaddingX = xl * this.font.charWidth + 5;
            this.chartWidth = screen.width - this.axisPaddingX;
            this.maxEntries = (this.chartWidth - 2);

            // Calculate the grid for background / scale.
            this.gridWidth = this.chartWidth / this.gridCols;  // This is the width of the grid cells (background and axes).
            this.gridHeight = this.chartHeight / this.gridRows; // This is the height of the grid cells (background axes).

            // Determine the scaling factor based on the min / max ranges.
            this.xRange = this.scaleXMax - this.scaleXMin;

            this.xFactor = this.chartWidth / this.xRange;
            this.yFactor = this.chartHeight / this.yRange;

        }

        private drawChartGrid() {
            const c = this.axisColor;
            const tipLength = 3;

            screen.drawRect(this.axisPaddingX, 0, this.chartWidth, this.chartHeight, c);

            for (let i = 0; i < this.gridCols; i++) {
                screen.drawLine(this.axisPaddingX + i * this.gridWidth, this.chartHeight, this.axisPaddingX + i * this.gridWidth, this.chartHeight - tipLength, c);
                screen.drawLine(this.axisPaddingX + i * this.gridWidth, 0, this.axisPaddingX + i * this.gridWidth, tipLength, c);
            }
            for (let i = 0; i < this.gridRows; i++) {
                screen.drawLine(this.axisPaddingX + 0, i * this.gridHeight, this.axisPaddingX + tipLength, i * this.gridHeight, c);
                screen.drawLine(this.axisPaddingX + this.chartWidth, i * this.gridHeight, this.axisPaddingX + this.chartWidth - tipLength, i * this.gridHeight, c);
            }
        }

        private drawAxes() {
            const c = this.axisColor;
            const xRange = this.scaleXMax - this.scaleXMin;
            const yRange = this.scaleYMax - this.scaleYMin;

            const xUnit = xRange / this.gridCols;
            const yUnit = yRange / this.gridRows;

            // Draw the y-axes labels.
            let text = '';
            for (let i = 0; i <= this.gridRows; i++) {
                text = roundWithPrecision(this.scaleYMax - (i * yUnit), 2).toString();
                let y = i * this.gridHeight - this.font.charHeight / 2;
                if (i == this.gridRows)
                    y -= this.font.charHeight / 2;
                else if (i == 0)
                    y += this.font.charHeight / 2;
                screen.print(text, 0, y, c, this.font);
            }
            // Draw the x-axis labels
            for (let i = 0; i <= this.gridCols; i++) {
                text = roundWithPrecision((i * xUnit + this.scaleXMin), 2).toString();
                let x = i * this.gridWidth;

                if (i == this.xTicks) {
                    x -= this.font.charWidth * (text.length); // Move last entry on screen
                } else {
                    x -= this.font.charWidth * (text.length) / 2;
                }
                screen.print(text, x + this.axisPaddingX, this.chartHeight + (this.axisPaddingY - 2 - this.font.charHeight), c, this.font);
            }
        }

        private drawGraphPoints() {
            for (let i = 0; i < this.dataSets.length; i++) {
                let data = this.dataSets[i].dataSet;
                const c = this.dataSets[i].color;
                switch (this.dataSets[i].kind) {
                    case PlotType.Scatter:
                        for (let i = 0; i < data.length(); i++) {
                            let nextX = this.getScreenX(data.getXAtIndex(i));
                            let nextY = this.getScreenY(data.getYAtIndex(i));
                            //screen.drawLine(prevX, prevY, nextX, nextY, c);
                            const dot = img`
                                1 1 1
                                1 . 1
                                1 1 1
                            `;
                            dot.replace(1, c)
                            screen.drawTransparentImage(dot, nextX - 1, nextY - 1);
                        }
                        break;
                    case PlotType.Line:
                        if (data.length() <= 1) {
                            break;
                        }
                        let prevX = this.getScreenX(data.getXAtIndex(0));
                        let prevY = this.getScreenY(data.getYAtIndex(0));
                        for (let i = 1; i < data.length(); i++) {
                            let nextX = this.getScreenX(data.getXAtIndex(i));
                            let nextY = this.getScreenY(data.getYAtIndex(i));
                            screen.drawLine(prevX, prevY, nextX, nextY, c);
                            prevX = nextX;
                            prevY = nextY;
                        }
                        break;
                }

            }

        }

        private drawLines() {
            if (this.dataSets.length == 0) {
                // no bounds have been set
                return;
            }
            for (let i = 0; i < this.lines.length; i++) {
                let coeff = this.lines[i].coeff;
                // TODO add support for quadratics and beyond
                if (coeff.length > 2) {
                    this.lines[i].coeff.splice(coeff.length - 2, coeff.length);
                }
                let intercept: number = coeff[coeff.length - 1];
                let slope: number = coeff.length > 1 ? coeff[coeff.length - 2] : 0;
                screen.drawLine(this.axisPaddingX, this.getScreenY(intercept + slope * this.scaleXMin),
                    this.axisPaddingX + this.chartWidth, this.getScreenY(intercept + slope * this.scaleXMax), this.lines[i].color);
            }
        }

        private getScreenX(x: number): number {
            return this.axisPaddingX + (x - this.scaleXMin) * this.xFactor;
        }

        private getScreenY(y: number): number {
            return this.chartHeight - ((y - this.scaleYMin) * this.yFactor)
        }
    }



    // helpers
    function log10(x: number): number {
        return Math.log(x) / Math.log(10);
    }

    function roundWithPrecision(x: number, digits: number): number {
        if (digits <= 0) return Math.round(x);
        let d = Math.pow(10, digits);
        return Math.round(x * d) / d;
    }

    function generateSteps(start: number, end: number, numberOfTicks: number): number[] {
        let bases = [1, 5, 2, 3]; // Tick bases selection
        let currentBase: number;
        let n: number;
        let intervalSize: number, upperBound: number, lowerBound: number;
        let nIntervals: number, nMaxIntervals: number;
        let the_intervalsize = 0.1;

        let exponentYmax =
            Math.floor(Math.max(log10(Math.abs(start)), log10(Math.abs(end))));
        let mantissaYmax = end / Math.pow(10.0, exponentYmax);

        // now check if numbers can be cleaned...
        // make it pretty
        let significative_numbers = Math.min(3, Math.abs(exponentYmax) + 1);

        let expo = Math.pow(10.0, significative_numbers);
        let start_norm = Math.abs(start) * expo;
        let end_norm = Math.abs(end) * expo;
        let mant_norm = Math.abs(mantissaYmax) * expo;

        // trunc ends
        let ip_start = Math.floor(start_norm * Math.sign(start));
        let ip_end = Math.ceil(end_norm * Math.sign(end));

        start = ip_start;
        end = ip_end;

        mantissaYmax = Math.ceil(mant_norm);

        nMaxIntervals = 0;
        for (let k = 0; k < bases.length; ++k) {
            // Loop initialisation
            currentBase = bases[k];
            n = 4; // This value only allows results smaller than about 1000 = 10^n


            do // Tick vector length reduction
            {
                --n;
                intervalSize = currentBase * Math.pow(10.0, exponentYmax - n);

                upperBound =
                    Math.ceil(mantissaYmax * Math.pow(10.0, n) / currentBase)
                    * intervalSize;

                nIntervals =
                    Math.ceil((upperBound - start) / intervalSize);
                lowerBound = upperBound - nIntervals * intervalSize;
            }
            while (nIntervals > numberOfTicks);

            if (nIntervals > nMaxIntervals) {
                nMaxIntervals = nIntervals;
                ip_start = ip_start = lowerBound;
                ip_end = upperBound;
                the_intervalsize = intervalSize;
            }
        }

        // trunc ends
        if (start < 0)
            start = Math.floor(ip_start) / expo;
        else
            start = Math.ceil(ip_start) / expo;

        if (end < 0)
            end = Math.floor(ip_end) / expo;
        else
            end = Math.ceil(ip_end) / expo;

        return [start, end, nMaxIntervals];
    }


    let chart: Chart;

    export function plotSeries(xValues: number[], yValues: number[]) {
        if (!chart)
            chart = new Chart();
        chart.plotSeries(xValues, yValues);
    }

    export function graphSeries(xValues: number[], yValues: number[]) {
        if (!chart)
            chart = new Chart();
        chart.graphSeries(xValues, yValues);
    }

    export function graphLine(coeff: number[]) {
        if (!coeff || coeff.length == 0) {
            return;
        }
        if (!chart)
            chart = new Chart();
        chart.graphLine(coeff);
    }

    game.onPaint(function () {
        if (chart) {
            chart.render();
        }
    })

    /**
     * Clears the trend chart and the screen
     */
    //% group="Charts"
    //% blockid=graphclear block="graph clear"
    export function graphClear() {
        chart = undefined;
        screen.fill(0);
    }
} 
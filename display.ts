namespace display {
    class series {
        xValues: number[];
        yValues: number[];
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;

        constructor(xValues: number[], yValues: number[]) {
            if (!xValues || xValues.length == 0 || !yValues || yValues.length == 0) {
                return;
            }
            if (xValues.length != yValues.length) {
                let min: number = Math.min(xValues.length, yValues.length);
                xValues.splice(min, xValues.length - min);
                yValues.splice(min, yValues.length - min);
            }
            this.xValues = xValues;
            this.yValues = yValues;
            let bounds: number[] = this.minMax(xValues);
            this.minX = bounds[0];
            this.maxX = bounds[1];
            bounds = this.minMax(yValues);
            this.minY = bounds[0];
            this.maxY = bounds[1];
        }

        private minMax(values: number[]): number[] {
            if (!values || values.length == 0) {
                // Invalid Argument
                return [];
            }
            let min: number = values[0];
            let max: number = values[0];
            for (let i = 1; i < values.length; i++) {
                if (values[i] < min) {
                    min = values[i];
                } if (values[i] > max) {
                    max = values[i];
                }
            }
            return [min, max];
        }

    }

    class Chart {
        // Variables used for data configuration.
        private font: image.Font;
        private times: number[];
        private values: number[];

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

        // estimated best number of entries
        private maxEntries: number;

        public backgroundColor: number;
        public axisColor: number;
        public lineColor: number;

        constructor() {
            this.font = image.font5;
            this.backgroundColor = 0;
            this.axisColor = 1;
            this.lineColor = 1;

            this.axisPaddingX = 22;
            this.axisPaddingY = this.font.charHeight + 4;
            this.gridRows = 2;
            this.gridCols = 2; // computed on the fly
            this.times = [];
            this.values = [];
            this.chartWidth = screen.width - this.axisPaddingX;
            this.chartHeight = screen.height - this.axisPaddingY;
            this.maxEntries = (this.chartWidth - 2);

            this.xTicks = 4;
            this.yTicks = 6;
        }

        public plotSeries(xValues: number[], yValues: number) {

        }

        public addPoint(value: number) {
            this.addPoint2d(control.millis() / 1000, value)
        }

        public addPoint2d(valueX: number, valueY: number) {
            let i = 0;
            while (i < this.times.length && this.times[i] > valueX) {
                i++;
            }
            this.times.insertAt(i, valueX);
            this.values.insertAt(i, valueY);

            if (this.times.length > this.maxEntries) {
                this.times = this.times.slice(this.times.length - this.maxEntries - 1, this.times.length - 1);
                this.values = this.values.slice(this.values.length - this.maxEntries - 1, this.values.length - 1);
            }
        }

        public render() {
            if (this.times.length < 2) return;
            this.calculateScale();
            screen.fill(this.backgroundColor);
            this.drawAxes();
            this.drawChartGrid();
            this.drawGraphPoints();
        }

        private calculateScale() {
            this.scaleXMax = this.times[0];
            this.scaleXMin = this.times[0];
            for (let j = 0, len2 = this.times.length; j < len2; j++) {
                if (this.scaleXMax < this.times[j]) {
                    this.scaleXMax = this.times[j];
                }
                if (this.scaleXMin > this.times[j]) {
                    this.scaleXMin = this.times[j];
                }
            }
            this.scaleYMax = this.values[0];
            this.scaleYMin = this.values[0];
            for (let j = 0, len2 = this.values.length; j < len2; j++) {
                if (this.scaleYMax < this.values[j]) {
                    this.scaleYMax = this.values[j];
                }
                if (this.scaleYMin > this.values[j]) {
                    this.scaleYMin = this.values[j];
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
            // this.scaleXMin = this.times[this.times.length - 1];
            // this.scaleXMax = this.times[0];
            this.gridCols = rx[2];
            let ry = generateSteps(this.scaleYMin, this.scaleYMax, this.yTicks);
            this.scaleYMin = ry[0];
            this.scaleYMax = ry[1];
            this.gridRows = ry[2];

            // update y-axis width
            let xl = 0;
            const yRange = this.scaleYMax - this.scaleYMin;
            const yUnit = yRange / this.gridRows;
            for (let i = 0; i <= this.gridRows; ++i)
                xl = Math.max(roundWithPrecision(this.scaleYMax - (i * yUnit), 2).toString().length, xl);
            this.axisPaddingX = xl * this.font.charWidth + 5;
            this.chartWidth = screen.width - this.axisPaddingX;
            this.maxEntries = (this.chartWidth - 2);

            // Calculate the grid for background / scale.
            this.gridWidth = this.chartWidth / this.gridCols;  // This is the width of the grid cells (background and axes).
            this.gridHeight = this.chartHeight / this.gridRows; // This is the height of the grid cells (background axes).
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


        public printValues() {
            this.times.reverse();
            this.values.reverse();
            console.log("x = [" + this.times.join(", ") + "]");
            console.log("y = [" + this.values.join(", ") + "]");
            this.times.reverse();
            this.values.reverse();
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
            const c = this.lineColor;
            // Determine the scaling factor based on the min / max ranges.
            const xRange = this.scaleXMax - this.scaleXMin;
            const yRange = this.scaleYMax - this.scaleYMin;

            const xFactor = this.chartWidth / xRange;
            let yFactor = this.chartHeight / yRange;

            for (let i = 0; i < this.values.length; i++) {
                let nextX = this.axisPaddingX + (this.times[i] - this.scaleXMin) * xFactor;
                let nextY = this.chartHeight - ((this.values[i] - this.scaleYMin) * yFactor);
                //screen.drawLine(prevX, prevY, nextX, nextY, c);
                const dot = img`
                    1 1 1
                    1 . 1
                    1 1 1
                `;
                dot.replace(1, c)
                screen.drawTransparentImage(dot, nextX - 1, nextY - 1)
            }

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
    /**
     * Adds a new point to the trend chart and renders it to the screen.
     */
    //% group="Charts"
    //% blockId=graphadd block="graph %value"
    //% blockGap=8
    export function graph(value: number) {
        if (!chart)
            chart = new Chart();
        chart.addPoint(value);
        //chart.render();
    }

    /**
     * Adds a new point to the trend chart and renders it to the screen.
     */
    //% group="Charts"
    //% blockId=graphadd block="graph %value"
    //% blockGap=8
    export function graphPoint(valueX: number, valueY: number) {
        if (!chart)
            chart = new Chart();
        chart.addPoint2d(valueX, valueY);
        //chart.render();
    }

    game.onPaint(function () {
        if (chart) {
            chart.render();
        }
    })

    export function printValues() {
        chart.printValues()
    }

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
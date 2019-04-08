namespace graph {

    enum PlotType {
        Scatter,
        Line
    }

    interface DataSeries {
        dataSet: stats.DataSet;
        kind: PlotType;
        color: number;
        bounds?: GraphBounds;
    }

    interface GraphLines {
        coeff: number[];
        color: number;
        bounds?: GraphBounds;
    }

    interface GraphBounds {
        minX?: number;
        maxX?: number;
        minY?: number;
        maxY?: number;
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

        private xAxisLabel: string;
        private yAxisLabel: string;

        private xLabelPadding: number;
        private yLabelPadding: number;

        constructor() {
            this.font = image.font5;
            this.backgroundColor = 0xb;
            this.axisColor = 0xf;
            this.plotColors = [0x8,
                0x2,
                0x7,
                0x4,
                0xa,
                0x5,
                0x1,
                0x3,
                0x6,
                0xf,
                0x9,
                0xc,
                0xd,
                0xe
            ];

            this.axisPaddingX = 22;
            this.axisPaddingY = this.font.charHeight + 4;
            this.xLabelPadding = 0;
            this.yLabelPadding = 0;
            this.gridRows = 2;
            this.gridCols = 2; // computed on the fly
            this.chartWidth = screen.width - this.axisPaddingX - this.yLabelPadding;
            this.chartHeight = screen.height - this.axisPaddingY;
            this.maxEntries = (this.chartWidth - 2);

            this.xTicks = 4;
            this.yTicks = 6;

            this.dataSets = [];
            this.lines = []

            this.xAxisLabel = "";
            this.yAxisLabel = "";
        }

        public plotSeries(xValues: number[], yValues: number[], dontSort?: boolean) {
            let data: stats.DataSet = new stats.DataSet(xValues, yValues);

            if (!dontSort) {
                data.sort();
            }
            this.dataSets.push({
                dataSet: data,
                kind: PlotType.Scatter,
                color: this.plotColors[(this.dataSets.length + this.lines.length)
                    % this.plotColors.length],
                bounds: {
                    minX: data.minX,
                    maxX: data.maxX,
                    minY: data.minY,
                    maxY: data.maxY,
                }
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
                color: this.plotColors[(this.dataSets.length + this.lines.length)
                    % this.plotColors.length],
                bounds: {
                    minX: data.minX,
                    maxX: data.maxX,
                    minY: data.minY,
                    maxY: data.maxY,
                }
            });
        }

        public graphLine(coeff: number[], bounds: GraphBounds) {
            this.lines.push({
                coeff: coeff,
                color: this.plotColors[(this.dataSets.length + this.lines.length)
                    % this.plotColors.length],
                bounds: bounds
            });
        }

        public render() {
            //if (this.times.length < 2) return;
            this.calculateScale();
            screen.fill(this.backgroundColor);
            this.drawGraphPoints();
            this.drawLines();
            this.drawAxes();
            this.drawChartGrid();
            this.drawLabels();
        }

        private calculateScale() {
            // Find min and max x and y values

            // If bounds of a dataset are set use those, otherwise use min max values
            for (let i = 0; i < this.dataSets.length; i++) {
                if (this.dataSets[i].bounds && this.dataSets[i].bounds.minX != undefined) {
                    this.scaleXMin = Math.min(this.scaleXMin, this.dataSets[i].bounds.minX);
                } else {
                    this.scaleXMin = Math.min(this.scaleXMin, this.dataSets[i].dataSet.minX);
                }
                if (this.dataSets[i].bounds && this.dataSets[i].bounds.maxX != undefined) {
                    this.scaleXMax = Math.max(this.scaleXMax, this.dataSets[i].bounds.maxX);
                } else {
                    this.scaleXMax = Math.max(this.scaleXMax, this.dataSets[i].dataSet.maxX);
                }
                if (this.dataSets[i].bounds && this.dataSets[i].bounds.minY != undefined) {
                    this.scaleYMin = Math.min(this.scaleYMin, this.dataSets[i].bounds.minY);
                } else {
                    this.scaleYMin = Math.min(this.scaleYMin, this.dataSets[i].dataSet.minY);
                }
                if (this.dataSets[i].bounds && this.dataSets[i].bounds.maxY != undefined) {
                    this.scaleYMax = Math.max(this.scaleYMax, this.dataSets[i].bounds.maxY);
                } else {
                    this.scaleYMax = Math.max(this.scaleYMax, this.dataSets[i].dataSet.maxY);
                }
            }

            for (let i = 0; i < this.lines.length; i++) {
                if (this.lines[i].bounds) {
                    this.scaleXMin = Math.min(this.scaleXMin, this.lines[i].bounds.minX);
                    this.scaleXMax = Math.max(this.scaleXMax, this.lines[i].bounds.maxX);
                    this.scaleYMin = Math.min(this.scaleYMin, this.lines[i].bounds.minY);
                    this.scaleYMax = Math.max(this.scaleYMax, this.lines[i].bounds.maxY);
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

            this.chartWidth = screen.width - this.axisPaddingX - this.yLabelPadding;
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

            screen.drawRect(this.axisPaddingX + this.yLabelPadding, 0, this.chartWidth + 1, this.chartHeight + 1, c);

            for (let i = 0; i < this.gridCols; i++) {
                screen.drawLine(this.yLabelPadding + this.axisPaddingX + i * this.gridWidth, this.chartHeight, this.yLabelPadding + this.axisPaddingX + i * this.gridWidth, this.chartHeight - tipLength, c);
                screen.drawLine(this.yLabelPadding + this.axisPaddingX + i * this.gridWidth, 0, this.yLabelPadding + this.axisPaddingX + i * this.gridWidth, tipLength, c);
            }
            for (let i = 0; i < this.gridRows; i++) {
                screen.drawLine(this.axisPaddingX + this.yLabelPadding, i * this.gridHeight, this.axisPaddingX + tipLength + this.yLabelPadding, i * this.gridHeight, c);
                screen.drawLine(this.axisPaddingX + this.chartWidth + this.yLabelPadding, i * this.gridHeight, this.axisPaddingX + this.chartWidth - tipLength + this.yLabelPadding, i * this.gridHeight, c);
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
                screen.print(text, this.yAxisLabel ? this.font.charWidth : 0, y, c, this.font);
            }
            // Draw the x-axis labels
            for (let i = 0; i <= this.gridCols; i++) {
                text = roundWithPrecision((i * xUnit + this.scaleXMin), 2).toString();
                let x = i * this.gridWidth;

                if (i == this.gridCols) {
                    x -= this.font.charWidth * (text.length); // Move last entry on screen
                } else {
                    x -= this.font.charWidth * (text.length) / 2;
                }
                screen.print(text,
                    x + this.axisPaddingX + this.yLabelPadding,
                    this.chartHeight + (this.axisPaddingY - 2 - this.font.charHeight),
                    c,
                    this.font);
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
                            const dot = img`
                                1 1 1
                                1 . 1
                                1 1 1
                            `;
                            if (nextX == this.getScreenX(this.scaleXMin)) {
                                dot.setPixel(0, 0, 0);
                                dot.setPixel(0, 1, 0);
                                dot.setPixel(0, 2, 0);
                            }
                            if (nextY == this.getScreenY(this.scaleYMin)) {
                                dot.setPixel(0, 2, 0);
                                dot.setPixel(1, 2, 0);
                                dot.setPixel(2, 2, 0);
                            }
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
            for (let i = 0; i < this.lines.length; i++) {
                let coeff = this.lines[i].coeff;
                // TODO add support for quadratics and beyond
                if (coeff.length > 2) {
                    this.lines[i].coeff.splice(coeff.length - 2, coeff.length);
                }
                let intercept: number = coeff[coeff.length - 1];
                let slope: number = coeff.length > 1 ? coeff[coeff.length - 2] : 0;
                if (intercept + slope * this.scaleXMin < this.scaleYMin) {
                    let xIntercept = (this.scaleYMin - intercept) / slope;
                    screen.drawLine(this.getScreenX(xIntercept),
                        this.getScreenY(intercept + slope * xIntercept),
                        this.getScreenX(this.scaleXMax),
                        this.getScreenY(intercept + slope * this.scaleXMax),
                        this.lines[i].color);
                } else if (intercept + slope * this.scaleXMax < this.scaleYMin) {
                    let xIntercept = (this.scaleYMin - intercept) / slope;
                    screen.drawLine(this.getScreenX(this.scaleXMin),
                        this.getScreenY(intercept + slope * this.scaleXMin),
                        this.getScreenX(xIntercept),
                        this.getScreenY(intercept + slope * xIntercept),
                        this.lines[i].color);
                } else {
                    screen.drawLine(this.getScreenX(this.scaleXMin),
                        this.getScreenY(intercept + slope * this.scaleXMin),
                        this.getScreenX(this.scaleXMax),
                        this.getScreenY(intercept + slope * this.scaleXMax),
                        this.lines[i].color);
                }
            }
        }

        private drawLabels() {
            let x = screen.width - (this.chartWidth / 2) - ((this.xAxisLabel.length * this.font.charWidth) / 2)
            screen.print(this.xAxisLabel, x, screen.height - this.font.charHeight, this.axisColor, this.font);
            const letterMargin = 1;
            let y = (this.chartHeight / 2) - ((this.yAxisLabel.length * (this.font.charHeight + letterMargin)) / 2);
            for (let i = 0; i < this.yAxisLabel.length; i++) {
                screen.print(this.yAxisLabel.charAt(i),
                    0,
                    y + (i * (this.font.charHeight + letterMargin)),
                    this.axisColor,
                    this.font);
            }
        }

        private getScreenX(x: number): number {
            return Math.round((this.axisPaddingX + this.yLabelPadding) + (x - this.scaleXMin) * this.xFactor);
        }

        private getScreenY(y: number): number {
            return Math.round(this.chartHeight - (y - this.scaleYMin) * this.yFactor);
        }

        setXAxisLabel(label: string) {
            this.xAxisLabel = label;
            this.xLabelPadding = label ? this.font.charHeight : 0;
            this.chartHeight = screen.height - this.axisPaddingY - this.xLabelPadding;
        }

        setYAxisLabel(label: string) {
            this.yAxisLabel = label;
            this.yLabelPadding = label ? this.font.charWidth : 0;
            this.chartWidth = screen.width - this.axisPaddingX - this.yLabelPadding;
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
     * Plots the given series as a scatter-plot
     *
     *      * @param xValues The x values of the series
     * @param yValues The y values of the series
     */
    export function plotSeries(xValues: number[], yValues: number[]) {
        if (!chart)
            chart = new Chart();
        chart.plotSeries(xValues, yValues);
    }

    /**
     * Plots the given series as a line-graph
     *
     *      * @param xValues The x values of the series
     * @param yValues The y values of the series
     */
    export function graphSeries(xValues: number[], yValues: number[]) {
        if (!chart)
            chart = new Chart();
        chart.graphSeries(xValues, yValues);
    }

    /**
     * Graphs a line with the given coefficients
     *
     *      * @param coeff The coefficients of the line in the form [slope, y-intercept]
     * @param bounds The bounds of the line
     */
    export function graphLine(coeff: number[], bounds?: GraphBounds) {
        if (!coeff || coeff.length == 0) {
            return;
        }
        if (!chart)
            chart = new Chart();
        chart.graphLine(coeff, bounds);
    }

    /**
     * Graphs the line of best fit for the given series
     *
     *      * @param xValues The x values of the series
     * @param yValues The y values of the series
     */
    export function graphBestFit(xValues: number[], yValues: number[]) {
        const dataSet: stats.DataSet = new stats.DataSet(xValues, yValues);
        graphLine(dataSet.lineOfBestFit,
            {
                minX: dataSet.minX,
                maxX: dataSet.maxX,
                minY: dataSet.minY,
                maxY: dataSet.maxY,
            });
    }

    game.onPaint(function () {
        if (chart) {
            chart.render();
        }
    })

    /**
     * Sets the label for the x-axis. Removes axis label if given label is empty or undefined
     *
     *      * @param label The label for the x-axis
     */
    export function setXAxisLabel(label: string) {
        if (chart) {
            chart.setXAxisLabel(label);
        }
    }

    /**
     * Sets the label for the y-axis. Removes axis label if given label is empty or undefined
     *
     *      * @param label The label for the y-axis
     */
    export function setYAxisLabel(label: string) {
        if (chart) {
            chart.setYAxisLabel(label);
        }
    }

    /**
     * Clears the trend chart and the screen
     */
    export function graphClear() {
        chart = undefined;
        screen.fill(0);
    }
} 
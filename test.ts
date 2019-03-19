let index = 0;

controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    index = (index + numOfSets - 1) % numOfSets;
    plot();
})


controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    index = (index + 1) % numOfSets;
    plot();
})

let labelX = false;
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    labelX = !labelX
    display.setXAxisLabel(labelX ? "Tempatures" : "");
})

let labelY = false;
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    labelY = !labelY
    display.setYAxisLabel(labelY ? "Sales" : "");
})

function plot() {
    display.graphClear();
    switch (index) {
        case 0:
            plotIceCreme();
            break;
        case 1:
            plotMakeCodePop();
            break;
        case 2:
            plotMarvel();
            break;
        case 3:
            plotDuelData();
            break;
        case 4:
            graphIceCremeSeries();
            break;
        case 5:
            plotIceCremeSeries();
            break;
    }
}

const numOfSets = 6;

function plotIceCreme() {
    display.plotSeries(datasets.temps, datasets.sales);
    display.setXAxisLabel("Tempatures");
    display.setYAxisLabel("Sales");
}

function plotMakeCodePop() {
    display.plotSeries(datasets.days, datasets.popularity);
}

function plotMarvel() {
    display.plotSeries(datasets.boxOffice, datasets.ratings);
}

function plotDuelData() {
    display.plotSeries(datasets.duelData[0], datasets.duelData[1]);
    display.plotSeries(datasets.duelData[2], datasets.duelData[3]);
}

function plotIceCremeSeries() {
    display.plotSeries(datasets.temps, datasets.sales);
    display.graphBestFit(datasets.temps, datasets.sales);
}

function graphIceCremeSeries() {
    display.graphSeries(datasets.temps, datasets.sales);
}

namespace datasets {

    // ice cream
    export let temps = [
        14.2, 16.4, 11.9, 15.2, 18.5, 22.1, 19.4, 25.1, 23.4, 18.1, 22.6, 17.2
    ];
    export let sales = [
        215, 325, 185, 332, 406, 522, 412, 614, 544, 421, 445, 408
    ];

    // MakeCode
    export let days = [
        0, 7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84, 91, 98, 105, 112, 119, 126, 133, 140, 147, 154, 161, 168, 175, 182, 189, 196, 203, 210, 217, 224, 231, 238, 245, 252, 259, 266, 273, 280, 287, 294, 301, 308, 315, 322, 329, 336, 343, 350, 357
    ];
    export let popularity = [
        32, 30, 14, 19, 43, 23, 36, 44, 36, 28, 47, 34, 38, 18, 29, 17, 9, 21, 0, 9, 21, 21, 15, 23, 26, 35, 54, 57, 63, 39, 62, 64, 65, 97, 76, 57, 61, 45, 41, 75, 75, 94, 43, 6, 24, 36, 76, 38, 59, 100, 56, 32
    ];

    export let boxOffice = [
        318.298180, 134.518390, 312.057433, 181.015141, 176.636816, 623.279547, 408.992272, 206.360018, 228.636083, 270.592504, 429.113729, 138.002223, 408.080554, 232.630718, 389.804217, 334.166825, 314.971245, 501.105037, 664.987816
    ];

    export let ratings = [
        7.9, 6.8, 7, 7, 6.9, 8.1, 7.2, 7, 7.8, 8.1, 7.4, 7.3, 7.8, 7.5, 7.7, 7.5, 7.9, 7.4, 8.5
    ];

    export let duelData = [[50, 48, 42, 88, 67, 43, 76, 90, 74, 82, 66, 89, 94, 95, 99, 78, 87, 41, 97], [9, 11, 8, 27, 18.5, 5.5, 29, 34, 27, 24, 21, 35.5, 32, 34.5, 35.5, 32, 36.5, 9.5, 34.5], [79, 76, 40, 45, 74, 61, 61, 69, 72, 94, 68, 87, 47, 66, 63, 77, 81, 55, 48], [31.35, 33.4, 41, 41.25, 31.1, 38.65, 41.65, 39.85, 32.8, 28.1, 40.2, 29.55, 38.55, 33.9, 36.95, 35.05, 28.65, 45.75, 45.2]];
}

plot();
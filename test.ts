/*namespace graphs {
    let g: Graph = new Graph();

    // g.gridVisability = false;

    let data: number[] = [9, 6, 6, 2, 4, 6, 4, 9, 7, 3, 2, 7, 2, 6, 3, 7, 1, 9, 9, 1, 2, 7];
    g.chartDataSeq(data, GraphType.Bar, 7)
    g.plotDataSet([[0, 1, 2, 3, 4], [4, 3, 2, 1, 0], [1, 1, 1, 1, 1]], 0, 1, 15)
}

*/

/*
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    display.graph(Math.sin(game.runtime() / 1000))
})
*/

let temps = [
    14.2,
    16.4,
    11.9,
    15.2,
    18.5,
    22.1,
    19.4,
    25.1,
    23.4,
    18.1,
    22.6,
    17.2
];
//
let sales = [
    215,
    325,
    185,
    332,
    406,
    522,
    412,
    614,
    544,
    421,
    445,
    408
];

for (let i = 0; i < temps.length; i++) {
    display.graphPoint(temps[i], sales[i])
}

display.printValues();
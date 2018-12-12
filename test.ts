namespace graphs {
    let g: Graph = new Graph();
    g.addXBasedFunction(function (x: number) {
        return 5 * Math.sin(x);
    }, 8);

    g.addPolarFunction(function (theta: number) {
        return 0.5 * (theta);
    }, 7, [0, Math.PI * 5]);

    g.gridVisability = false;

    let data: number[] = [1, 0, 3, -2];
    g.plotDataSeq(data, 2)
}
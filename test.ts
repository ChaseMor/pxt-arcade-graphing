namespace graphs {
    let g: Graph = new Graph();
    g.addXBasedFunction(function (x: number) {
        return 5 * Math.sin(x);
    }, 8);
}
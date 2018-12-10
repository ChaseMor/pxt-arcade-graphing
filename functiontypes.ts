namespace graphs {
    export interface GraphableFunction {
        functionType: FunctionType;
        compute(param: number): number[];
        int: number;
        bounds: number[];
        color: number;
    }

    export class XBasedFunction implements GraphableFunction {
        functionType: FunctionType;
        int: number;
        bounds: number[];
        color: number;

        computatableFunction: (x: number) => number;

        constructor(computatableFunction: (x: number) => number, color: number) {
            this.functionType = FunctionType.XBased;
            this.computatableFunction = computatableFunction;
            this.color = color;
        }

        compute(x: number): number[] {
            return [x, this.computatableFunction(x)];
        }
    }

    export class YBasedFunction implements GraphableFunction {
        functionType: FunctionType;
        int: number;
        bounds: number[];
        color: number;

        computatableFunction: (y: number) => number;

        constructor(computatableFunction: (y: number) => number, color: number) {
            this.functionType = FunctionType.YBased;
            this.computatableFunction = computatableFunction;
            this.color = color;
        }

        compute(y: number): number[] {
            return [this.computatableFunction(y), y];
        }
    }

    export class ParametricFunction implements GraphableFunction {
        functionType: FunctionType;
        int: number;
        bounds: number[];
        color: number;

        computatableFunction: (t: number) => number[];

        constructor(computatableFunction: (t: number) => number[], color: number, bounds?: number[]) {
            this.functionType = FunctionType.Parametric;
            this.computatableFunction = computatableFunction;
            this.bounds = bounds ? bounds : [0, 10];
            this.int = (this.bounds[1] - this.bounds[0]) / 100;
            this.color = color;
        }

        compute(t: number): number[] {
            return this.computatableFunction(t);
        }
    }

    export class PolarFunction implements GraphableFunction {
        functionType: FunctionType;
        int: number;
        bounds: number[];
        color: number;

        computatableFunction: (theta: number) => number;

        constructor(computatableFunction: (theta: number) => number, color: number, bounds?: number[]) {
            this.functionType = FunctionType.Polar;
            this.computatableFunction = computatableFunction;
            this.bounds = bounds ? bounds : [0, Math.PI * 2];
            this.int = Math.PI / 36;
            this.color = color;
        }

        compute(theta: number): number[] {
            let r: number = this.computatableFunction(theta);
            return [Math.cos(theta) * r, Math.sin(theta) * r];
        }
    }
}

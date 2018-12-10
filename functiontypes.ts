namespace graphs {
    export interface GraphableFunction {
        functionType: FunctionType;
        compute(param: number): number[];
        int: number;
    }

    export class XBasedFunction implements GraphableFunction {
        functionType: FunctionType;
        int: number;

        computatableFunction: (x: number) => number;

        constructor(computatableFunction: (x: number) => number) {
            this.functionType = FunctionType.XBased;
            this.computatableFunction = computatableFunction;
        }

        compute(x: number): number[] {
            return [x, this.computatableFunction(x)];
        }
    }

    export class YBasedFunction implements GraphableFunction {
        functionType: FunctionType;
        int: number;

        computatableFunction: (y: number) => number;

        constructor(computatableFunction: (y: number) => number) {
            this.functionType = FunctionType.YBased;
            this.computatableFunction = computatableFunction;
        }

        compute(y: number): number[] {
            return [this.computatableFunction(y), y];
        }
    }

    export class ParametricFunction implements GraphableFunction {
        functionType: FunctionType;
        int: number;

        computatableFunction: (t: number) => number[];

        constructor(computatableFunction: (t: number) => number[]) {
            this.functionType = FunctionType.Parametric;
            this.computatableFunction = computatableFunction;
        }

        compute(t: number): number[] {
            return this.computatableFunction(t);
        }
    }

    export class PolarFunction implements GraphableFunction {
        functionType: FunctionType;
        int: number;

        computatableFunction: (theta: number) => number;

        constructor(computatableFunction: (theta: number) => number) {
            this.functionType = FunctionType.XBased;
            this.computatableFunction = computatableFunction;
        }

        compute(theta: number): number[] {
            let r: number = this.computatableFunction(theta);
            return [Math.cos(theta) * r, Math.sin(theta) * r];
        }
    }
}

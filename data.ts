 namespace graphs {

     export enum GraphType {
         Bar,
         Line
     }

     export class DataSequence {
         data: number[];
         color: number;
         kind: GraphType;

         constructor(data: number[], kind?:GraphType, color?: number) {
             this.data = data;
             this.kind = kind ? kind : GraphType.Bar;
             this.color = color ? color : 1;
         }
     }

     export class DataSet {

         data: number[][];
         color: number;
         
         constructor(data: number[][], x: number, y:number, color?:number) {
             this.data = [];
             this.data.push(data[x]);
             this.data.push(data[y]);
             this.color = color ? color : 1;
         }
     }     
 }
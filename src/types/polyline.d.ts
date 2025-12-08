declare module "@mapbox/polyline" {
    export function encode(points: number[][]): string;
    export function decode(str: string): number[][];
}
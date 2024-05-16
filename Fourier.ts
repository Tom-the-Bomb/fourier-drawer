import Complex from "./Complex.ts";
type Points = Array<Complex>;

class Fourier {
    points: Points;
    N: number;

    time: number;

    constructor(points: Array<Complex>) {
        this.points = points;
        this.N = this.points.length;
        this.time = 0;
    }

    computeIntegral(idx: number): Complex {
        let sum = new Complex(0, 0);

        for (let k = 0; k < this.N; k++) {
            sum = sum.add(
                Complex.fromArg(
                    (-2 * Math.PI * k * idx) / this.N
                )
                .mul(this.points[k])
            )
        }
        return sum.scale(1 / this.N); // where dt = (b - a) / N = 1 / N
    }

    getSeries(): Points {
        let series: Points = [];

        for (let idx = 0; idx < this.points.length; idx++) {
            series[idx] = this.computeIntegral(idx);
        }
        return series;
    }

    drawEpiCycles(originX: number, originY: number, offset: number) {
        const series = this.getSeries();
        let prevX: number;
        let prevY: number;
        let x = originX;
        let y = originY;

        for (const [idx, term] of series.entries()) {
            prevX = x;
            prevY = y;
            const r = term.abs();
            const arg = term.arg();

            x += r * Math.cos(idx * this.time + arg + offset);
            y += r * Math.sin(idx * this.time + arg + offset);
        }
    }
}
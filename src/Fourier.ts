import Complex from './Complex';

export type Points = Array<Complex>;

export class Fourier {
    points: Points;
    time: number;

    constructor(points: Points) {
        this.points = points;
        this.time = 0;
    }

    set setPoints(points: Points) {
        this.points = points;
    }

    computeIntegral(idx: number): Complex {
        let sum = new Complex(0, 0);

        for (let k = 0; k < this.points.length; k++) {
            sum = sum.add(
                Complex.fromPolar(
                    this.points[k],
                    (-2 * Math.PI * k * idx) / this.points.length,
                )
            )
        }
        sum = sum.scale(1 / this.points.length);
        sum.frequency = idx;
        return sum;
    }

    getSeries(): Points {
        let series: Points = [];

        for (let idx = 0; idx < this.points.length; idx++) {
            series[idx] = this.computeIntegral(idx);
        }
        series.sort((a, b) => b.abs - a.abs);
        return series;
    }
}
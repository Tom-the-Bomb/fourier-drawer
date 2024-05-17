import Complex from './Complex';

export type Points = Array<Complex>;

export class Fourier {
    points: Points;
    time: number;
    skip: number;

    constructor(points: Points, skip: number = 1) {
        this.points = points;
        this.time = 0;
        this.skip = skip;
    }

    set setPoints(points: Points) {
        this.points = points;
    }

    /**
     * computes the integral that determines the `magnitude` and angle of a `vector`
     * by taking the average of all the points over the interval [0, 1] (1 cycle)
     * we multiply by a factor that `freezes` the current vector (cancels the rotation `e^it(2pi)` via `e^-it(2pi)`)
     */
    computeIntegral(idx: number): Complex {
        let sum = new Complex(0, 0);

        for (let k = 0; k < this.points.length; k++) {
            sum = sum.add(
                // cancellation factor
                Complex.fromPolar(
                    // magnitude
                    this.points[k],
                    // angle
                    (-2 * Math.PI * k * idx) / this.points.length,
                )
            )
        }
        // the `dt` in the integral: `(b - a) / n` => `(1 - 0) / N` => `1 / N`
        sum = sum.scale(1 / this.points.length);
        // the frequency that the vector rotates is (`idx` rotations/sec)
        // `idx` = the `k` from `e^kit(2pi)` factor that rotates the vector
        sum.frequency = idx;
        return sum;
    }

    getSeries(): Points {
        let series: Points = [];

        for (let idx = 0; idx < this.points.length; idx++) {
            series.push(this.computeIntegral(idx));
        }
        series.sort((a, b) => b.abs - a.abs); // draw larger magnitude vectors first
        return series;
    }
}
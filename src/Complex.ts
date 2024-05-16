import * as p5 from 'p5';

export default class Complex {
    re: number;
    im: number;
    frequency?: number;

    constructor(re: number = 0, im: number = 0, frequency?: number) {
        this.re = re;
        this.im = im;
        this.frequency = frequency;
    }

    static fromPolar(r: Complex, theta: number, frequency?: number): Complex {
        return new Complex(
            Math.cos(theta),
            Math.sin(theta),
            frequency,
        ).mul(r);
    }

    get abs(): number {
        return Math.sqrt(this.re ** 2 + this.im ** 2);
    }

    get arg(): number {
        return Math.atan2(this.im, this.re);
    }

    add(other: Complex): Complex {
        return new Complex(
            this.re + other.re,
            this.im + other.im,
            this.frequency,
        );
    }

    /**
     *   (a + bi)(c + di)
     * = ac + (bc)i + (ad)i +(bd)i^2
     * = (ac - bd) + (bc + ac)i
     */
    mul(other: Complex): Complex {
        return new Complex(
            this.re * other.re - this.im * other.im,
            this.re * other.im + this.im * other.re,
            this.frequency,
        );
    }

    scale(scalar: number) {
        return new Complex(
            this.re * scalar,
            this.im * scalar,
            this.frequency,
        );
    }
}
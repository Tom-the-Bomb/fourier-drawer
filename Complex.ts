
export default class Complex {
    re: number;
    im: number;

    constructor(re: number = 0, im: number = 0) {
        this.re = re;
        this.im = im;
    }

    static fromArg(arg: number): Complex {
        return new Complex(
            Math.cos(arg),
            Math.sin(arg),
        );
    }

    abs(): number {
        return Math.sqrt(this.re ** 2 + this.im ** 2);
    }

    arg(): number {
        return Math.atan2(this.im, this.re);
    }

    add(other: Complex): Complex {
        return new Complex(
            this.re + other.re,
            this.im + other.im,
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
        );
    }

    scale(scalar: number) {
        return new Complex(
            this.re * scalar,
            this.re * scalar,
        );
    }
}
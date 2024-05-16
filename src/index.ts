import * as p5 from 'p5';

import Complex from './Complex';
import { Points, Fourier } from './Fourier';

class CustomP5 extends p5 {
    fourier: Fourier;
    series: Points = [];
    time: number = 0;
    path: Array<p5.Vector> = [];

    drawing: Points = [];
    isOutputting: boolean = false;

    constructor() {
        super(() => {}, document.body);
        this.fourier = new Fourier(this.drawing);
    }

    reset(): void {
        this.isOutputting = false;
        this.drawing.length = 0;
        this.series = [];
        this.path = [];
        this.time = 0;
    }

    touchStarted(): void {
        this.reset();
    }

    touchEnded(): void {
        this.isOutputting = true;
        this.series = this.fourier.getSeries();
    }

    mousePressed(): void {
        this.reset();
    }

    mouseReleased() {
        this.isOutputting = true;
        this.series = this.fourier.getSeries();
    }

    drawEpiCycles(originX: number, originY: number, offset: number): p5.Vector {
        let tailX: number;
        let tailY: number;
        let tipX = originX;
        let tipY = originY;

        this.series.forEach((term, idx) => {
            tailX = tipX;
            tailY = tipY;
            const freq = term.frequency!;
            const r = term.abs;
            const arg = term.arg;

            tipX += r * Math.cos(freq * this.time + arg + offset);
            tipY += r * Math.sin(freq * this.time + arg + offset);

            this.stroke(255, 100);
            this.noFill();
            this.ellipse(tailX, tailY, r * 2);
            this.stroke(255);
            this.line(tailX, tailY, tipX, tipY);
        });
        return this.createVector(tipX, tipY);
    }

    setup(): void {
        this.createCanvas(this.windowWidth, this.windowHeight);
    }

    draw(): void {
        if (this.isOutputting) {
            this.background(0);

            let epiCycles = this.drawEpiCycles(
                this.width / 2,
                this.height / 2,
                0,
            );
            this.path.unshift(epiCycles);

            this.beginShape();
            this.noFill();
            this.strokeWeight(2);
            this.stroke(255, 0, 255);

            for (const vector of this.path) {
                this.vertex(vector.x, vector.y);
            }
            this.endShape();
            this.time += this.TWO_PI / this.series.length;

            if (this.time > this.TWO_PI) {
                this.time = 0;
                this.path = [];
            }
        } else {
            this.background(0);

            this.drawing.push(new Complex(
                this.mouseX - this.width / 2,
                this.mouseY - this.height / 2,
            ));

            this.stroke(255);
            this.noFill();
            this.beginShape();

            for (const point of this.drawing) {
                this.vertex(
                    point.re + this.width / 2,
                    point.im + this.height / 2
                );
            }
            this.endShape();
        }
    }
}

export const myP5 = new CustomP5();
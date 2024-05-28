import * as p5 from 'p5';

import Complex from './Complex';
import parseSVG from './SvgParser';
import { Points, Fourier } from './Fourier';


class CustomP5 extends p5 {
    fourier: Fourier;
    series: Points = [];
    time: number = 0;
    path: Array<p5.Vector> = [];

    drawing: Points = [];
    isOutputting?: boolean = undefined;

    strokeColor: string;
    skip: number = 1;

    constructor() {
        super(() => {});

        this.fourier = new Fourier(this.drawing);
        this.strokeColor = '#FF00FF';

        const colorInput = <HTMLInputElement> document.getElementById('colorInput');
        colorInput?.addEventListener('input', () => {
            this.strokeColor = colorInput.value;
        });

        const fileInput = <HTMLInputElement> document.getElementById('fileInput');
        fileInput?.addEventListener('input', async () => {
            const file = fileInput.files![0];

            let reader = new FileReader();
            reader.readAsText(file);
            reader.addEventListener('load', () => {
                this.reset();
                this.drawing.push(
                    ...parseSVG(reader.result as string, this.width / 2, this.height / 2)
                );
                this.series = this.fourier.getSeries();
                this.isOutputting = true;
            });
        });

        const stepInput = <HTMLInputElement> document.getElementById('stepInput');
        stepInput?.addEventListener('input', async () => {
            this.skip = parseInt(stepInput.value);
        });
    }

    touchStarted(): void {
        this.reset();
    }

    touchEnded(): void {
        this.compute();
    }

    mousePressed(): void {
        this.reset();
    }

    mouseReleased() {
        this.compute();
    }

    reset(): void {
        this.isOutputting = false;
        this.drawing.length = 0;
        this.series = [];
        this.path = [];
        this.time = 0;
    }

    compute(): void {
        const drawingCopy = this.drawing.slice();
        this.drawing.length = 0;

        for (let i = 0; i < drawingCopy.length; i += this.skip) {
            this.drawing.push(drawingCopy[i]);
        }
        this.series = this.fourier.getSeries();
        this.isOutputting = true;
    }

    drawEpiCycles(originX: number, originY: number, offset: number = 0): p5.Vector {
        let tailX: number;
        let tailY: number;
        let tipX = originX;
        let tipY = originY;

        for (const term of this.series) {
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
        }
        return this.createVector(tipX, tipY);
    }

    setup(): void {
        this.createCanvas(
            this.displayWidth, this.displayHeight,
        );
        this.background(0);

        this.fill(255);
        this.textAlign(this.CENTER);
        this.textSize(64);
        this.text("Draw or Upload an SVG", this.width / 2, this.height / 2);
    }

    draw(): void {
        this.background(0);

        if (this.isOutputting === true) {
            this.path.unshift(
                this.drawEpiCycles(
                    this.width / 2,
                    this.height / 2,
                )
            )

            this.beginShape();
            this.noFill();
            this.strokeWeight(2);
            this.stroke(this.strokeColor);

            for (const vector of this.path) {
                this.vertex(vector.x, vector.y);
            }
            this.endShape();
            this.time += this.TWO_PI / this.series.length;

            if (this.time > this.TWO_PI) {
                this.time = 0;
                this.path = [];
            }
        } else if (this.isOutputting === false) {
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
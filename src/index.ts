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
    isOutputting: boolean = false;
    strokeColor: string;

    constructor() {
        super(() => {}, document.getElementById('main')!);
        this.fourier = new Fourier(this.drawing);
        this.strokeColor = '#FF00FF';

        const colorInput = <HTMLInputElement>document.getElementById('colorInput');
        colorInput?.addEventListener('input', () => {
            this.strokeColor = colorInput.value;
        });

        const fileInput = <HTMLInputElement>document.getElementById('fileInput');
        fileInput?.addEventListener('input', async (event) => {
            const file = fileInput.files![0];

            let reader = new FileReader();
            reader.readAsText(file);
            reader.addEventListener('load', () => {
                const points = parseSVG(reader.result as string);
                console.log(points);
                this.reset();
                this.isOutputting = true;
                this.drawing = points;
                this.series = this.fourier.getSeries();
            });
        });
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
        this.createCanvas(this.windowWidth, this.windowHeight);
    }

    draw(): void {
        this.background(0);

        if (this.isOutputting) {
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
        } else {
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
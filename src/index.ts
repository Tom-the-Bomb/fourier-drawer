import * as p5 from 'p5';

import Complex from './Complex';
import parseSVG from './SvgParser';
import { Points, Fourier } from './Fourier';


class CustomP5 extends p5 {
    fourier: Fourier;
    series: Points = [];
    time: number = 0;
    path: Array<p5.Vector> = [];

    rawDrawing: Points = [];
    drawing: Points = [];
    isOutputting?: boolean = undefined;

    strokeColor: string;
    strokeWidth: number = 2;
    skip?: number;
    scaleFactor: number = 1;

    font = this.loadFont('./assets/jetbrains-mono.ttf');

    constructor() {
        super(() => {});

        this.fourier = new Fourier(this.drawing);
        this.strokeColor = '#FF00FF';

        const colorInput = <HTMLInputElement> document.getElementById('colorInput');
        colorInput?.addEventListener('input', () => {
            this.strokeColor = colorInput.value;
            this._redraw();
        });

        const fileInput = <HTMLInputElement> document.getElementById('fileInput');
        fileInput?.addEventListener('input', async () => {
            const file = fileInput.files![0];

            let reader = new FileReader();
            reader.readAsText(file);
            reader.addEventListener('load', () => {
                this.reset();
                this.rawDrawing = parseSVG(reader.result as string, this.skip);

                for (let i = 0; i < this.rawDrawing.length; i++) {
                    this.drawing.push(
                        this.rawDrawing[i].scale(this.scaleFactor)
                    );
                }
                this.series = this.fourier.getSeries();
                this.isOutputting = true;
            });
        });

        const strokeWInput = <HTMLInputElement> document.getElementById('strokeWInput');
        strokeWInput?.addEventListener('input', () => {
            this.strokeWidth = parseInt(strokeWInput.value);
            this._redraw();
        });

        const stepInput = <HTMLInputElement> document.getElementById('stepInput');
        stepInput?.addEventListener('input', () => {
            this.skip = parseInt(stepInput.value);
            this._redraw();
        });

        const scaleInput = <HTMLInputElement> document.getElementById('scaleInput');
        scaleInput?.addEventListener('input', () => {
            this.scaleFactor = parseInt(scaleInput.value);
            this._redraw();
        });

        const pauseButton = document.getElementById('pauseBtn');
        pauseButton?.addEventListener('click', () => {
            let [_, src] = this.isLooping()
                ? [this.noLoop(), './assets/play.svg']
                : [this.loop(), './assets/pause.svg'];

            document.getElementById("pauseIcon")?.setAttribute('src', src);
        });
    }

    _redraw(): void {
        const copy = this.rawDrawing.slice();
        this.reset();
        this.rawDrawing = copy;
        this.compute();
    }

    canvasTouchStarted(): void {
        this.reset();
    }

    canvasTouchEnded(): void {
        this.compute();
    }

    canvasMousePressed(): void {
        this.reset();
    }

    canvasMouseReleased() {
        this.compute();
    }

    reset(): void {
        this.isOutputting = false;
        this.rawDrawing.length = 0;
        this.drawing.length = 0;
        this.series = [];
        this.path = [];
        this.time = 0;
    }

    compute(defaultSkip: number = 1): void {
        let skip = this.skip === undefined ? defaultSkip : this.skip;
        for (let i = 0; i < this.rawDrawing.length; i += skip) {
            this.drawing.push(
                this.rawDrawing[i].scale(this.scaleFactor)
            );
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
            this.strokeWeight(2);
            this.noFill();
            this.ellipse(tailX, tailY, r * 2);
            this.stroke(255);
            this.line(tailX, tailY, tipX, tipY);
        }
        return this.createVector(tipX, tipY);
    }

    windowResized(): void {
        this.resizeCanvas(
            this.windowWidth,
            this.windowHeight,
        );
    }

    setup(): void {
        const canvas = this.createCanvas(
            this.windowWidth,
            this.windowHeight,
        );
        canvas.touchStarted(() => this.canvasTouchStarted());
        canvas.touchEnded(() => this.canvasTouchEnded());
        canvas.mousePressed(() => this.canvasMousePressed());
        canvas.mouseReleased(() => this.canvasMouseReleased());

        this.background(0);
        this.drawStart();
    }

    drawStart(): void {
        this.fill(255);
        this.textFont(this.font);
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
            this.strokeWeight(this.strokeWidth);
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
            this.rawDrawing.push(new Complex(
                this.mouseX - this.width / 2,
                this.mouseY - this.height / 2,
            ));

            this.stroke(255);
            this.noFill();
            this.beginShape();

            for (const point of this.rawDrawing) {
                this.vertex(
                    point.re + this.width / 2,
                    point.im + this.height / 2,
                );
            }
            this.endShape();
        } else {
            this.drawStart();
        }
    }
}

export const myP5 = new CustomP5();
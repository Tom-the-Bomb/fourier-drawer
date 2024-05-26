import { Points } from './Fourier';
import Complex from './Complex';

export default function parseSvg(raw: string, centerX: number = 0, centerY: number = 0): Points {
    let points = [];
    let parser = new DOMParser();

    const doc = parser.parseFromString(raw, 'application/xml');
    const paths = doc.getElementsByTagName('path');

    for (const path of paths) {
        for (let i = 0; i < path.getTotalLength(); i++) {
            const point = path.getPointAtLength(i);

            points.push(
                new Complex(point.x / 2 - centerX, point.y / 2 - centerY)
            );
        }
    }
    return points;
}
import { Points } from './Fourier';
import Complex from './Complex';

export default function parseSvg(raw: string): Points {
    let points = [];
    let parser = new DOMParser();

    const doc = parser.parseFromString(raw, 'application/xml');
    const paths = doc.getElementsByTagName('path');

    for (const path of paths) {
        console.log(path.getTotalLength());
        for (let i = 0; i < path.getTotalLength(); i += 20) {
            const point = path.getPointAtLength(i);

            points.push(new Complex(point.x, point.y));
        }
    }
    return points;
}
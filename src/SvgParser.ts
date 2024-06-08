import { Points } from './Fourier';
import Complex from './Complex';

export default function parseSvg(
    raw: string,
    skip?: number,
): Points {
    let points = [];
    let parser = new DOMParser();

    const doc = parser.parseFromString(raw, 'application/xml');
    const paths = doc.getElementsByTagName('path');

    const box = doc.getElementsByTagName('svg')[0].viewBox.baseVal;
    const width = box.width;
    const height = box.height;

    for (const path of paths) {
        const total = path.getTotalLength();
        const localSkip = skip === undefined ? total / 100 : skip;

        for (let i = 0; i < total; i += localSkip) {
            const point = path.getPointAtLength(i);
            points.push(new Complex(point.x - width / 2, point.y - height / 2));
        }
    }
    return points;
}
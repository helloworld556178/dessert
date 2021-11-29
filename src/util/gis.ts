/**
 * 提供了基本的地理信息坐标系下的数据计算方式
 */
export namespace gis {
    // 地球的半径（Z是极半径）
    const ELLIPSOID = Object.freeze({ X: 6378137.0, Y: 6378137.0, Z: 6356752.3142451793 });
    // 经纬度+高度 算距离
    const DEGREE = 180.0;
    type Location = { longitude: number; latitude: number; height?: number };
    type Point = { x: number; y: number; z: number };

    export function eulerdistance(from: Location, to: Location): number {
        if (Math.abs(from.latitude) > 90
            || Math.abs(from.longitude) > 180
            || Math.abs(to.latitude) > 90
            || Math.abs(to.longitude) > 180) {
            throw new Error("不合法的数据");
        }

        const p1 = Object.assign({ height: 0 }, from);
        const p2 = Object.assign({ height: 0 }, to);
        p1.longitude = radian(p1.longitude);
        p1.latitude = radian(p1.latitude);
        p1.height += radius(p1.latitude);
        p2.longitude = radian(p2.longitude);
        p2.latitude = radian(p2.latitude);
        p2.height += radius(p2.latitude);

        const x1 = p1.height * Math.sin(p1.longitude) * Math.cos(p1.latitude);
        const y1 = p1.height * Math.sin(p1.latitude);
        const z1 = p1.height * Math.cos(p1.longitude) * Math.cos(p1.latitude);

        const x2 = p2.height * Math.sin(p2.longitude) * Math.cos(p2.latitude);
        const y2 = p2.height * Math.sin(p2.latitude);
        const z2 = p2.height * Math.cos(p2.longitude) * Math.cos(p2.latitude);

        return Math.sqrt(
            Math.pow(x2 - x1, 2) +
            Math.pow(y2 - y1, 2) +
            Math.pow(z2 - z1, 2)
        );
    }

    export function cartesian(location: Location): Point {
        const p = Object.assign({ height: 0 }, location);
        p.longitude = radian(p.longitude);
        p.latitude = radian(p.latitude);
        const normal = [
            Math.cos(p.latitude) * Math.cos(p.longitude),
            Math.cos(p.latitude) * Math.sin(p.longitude),
            Math.sin(p.latitude)
        ];
        return {
            x: (ELLIPSOID.X + p.height) * normal[0],
            y: (ELLIPSOID.Y + p.height) * normal[1],
            z: (ELLIPSOID.Z + p.height) * normal[2]
        };
    }
    export function wgs84(point: Point): Location {
        const p = Object.assign({}, point);
        const d = Math.sqrt(Math.pow(p.x, 2) + Math.pow(p.y, 2) + Math.pow(p.z, 2));
        p.x = p.x / d;
        p.y = p.y / d;
        p.z = p.z / d;
        const longitude = Math.atan2(p.y, p.x);
        const latitude = Math.asin(p.z);
        const height = d - radius(latitude);
        return { longitude: angle(longitude), latitude: angle(latitude), height };
    }

    function radian(d: number): number {
        return d * Math.PI / DEGREE;
    }
    function angle(r: number): number {
        return r * DEGREE / Math.PI;
    }

    function radius(latitude: number): number {
        return Math.sqrt(
            (
                Math.pow(Math.pow(ELLIPSOID.X, 2) * Math.cos(latitude), 2)
                +
                Math.pow(Math.pow(ELLIPSOID.Z, 2) * Math.sin(latitude), 2)
            )
            /
            (
                Math.pow(ELLIPSOID.X * Math.cos(latitude), 2)
                +
                Math.pow(ELLIPSOID.Z * Math.sin(latitude), 2)
            )
        );
    }
}
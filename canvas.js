import { Vec3 } from './common.js';

export class Texture {
  /**
   * @param {ImageData} imageData
   * @param {number} u0
   * @param {number} v0
   * @param {number} u1
   * @param {number} v1
   * @param {number} u2
   * @param {number} v2
   */
  constructor(imageData, u0, v0, u1, v1, u2, v2, alpha = 255) {
    this.imageData = imageData;
    this.u0 = u0;
    this.v0 = v0;
    this.u1 = u1;
    this.v1 = v1;
    this.u2 = u2;
    this.v2 = v2;
    this.alpha = alpha;
  }
}

export class Canvas {
  /**
   * @param {HTMLCanvasElement} el
   */
  constructor(el) {
    this.el = el;
    this.ctx = el.getContext('2d');
    this.buffer = this.ctx.createImageData(el.width, el.height);
    this.zBuffer = new Array(el.width * el.height).fill(
      Number.MIN_SAFE_INTEGER
    );
  }

  clear() {
    this.ctx.clearRect(0, 0, this.el.width, this.el.height);
    this.buffer = this.ctx.getImageData(0, 0, this.el.width, this.el.height);
    this.zBuffer.fill(Number.MIN_SAFE_INTEGER);
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {[number, number, number, number]} color
   */
  putPixel(x, y, color) {
    x = Math.floor(x);
    y = Math.floor(y);
    y = this.el.height - y;
    const offset = 4 * (x + y * this.el.width);
    if (offset < 0 || offset + 3 >= this.buffer.data.length) {
      return;
    }
    this.buffer.data[offset + 0] = color[0];
    this.buffer.data[offset + 1] = color[1];
    this.buffer.data[offset + 2] = color[2];
    this.buffer.data[offset + 3] = color[3];
  }

  /**
   * @param {number} x0
   * @param {number} y0
   * @param {number} x1
   * @param {number} y1
   * @param {[number, number, number, number]} color
   */
  drawLine(x0, y0, x1, y1, color) {
    let steep = false;
    if (Math.abs(x1 - x0) < Math.abs(y1 - y0)) {
      [x0, y0] = [y0, x0];
      [x1, y1] = [y1, x1];
      steep = true;
    }
    if (x0 > x1) {
      [x0, x1] = [x1, x0];
      [y0, y1] = [y1, y0];
    }
    const dx = x1 - x0;
    const dy = y1 - y0;
    let derror2 = Math.abs(dy) * 2;
    let error2 = 0;
    let y = y0;
    for (let x = x0; x <= x1; x++) {
      if (steep) {
        this.putPixel(y, x, color);
      } else {
        this.putPixel(x, y, color);
      }
      error2 += derror2;
      if (error2 > dx) {
        y += y1 > y0 ? 1 : -1;
        error2 -= dx * 2;
      }
    }
  }

  /**
   * @param {[Vec3, Vec3, Vec3]} points
   * @param {[number, number, number, number] | Texture} color
   */
  triangle(points, color) {
    points = points.map((p) => p.floor());
    const bboxmin = [this.el.width - 1, this.el.height - 1];
    const bboxmax = [0, 0];
    const clamp = [this.el.width - 1, this.el.height - 1];
    for (const p of points) {
      bboxmin[0] = Math.max(0, Math.min(bboxmin[0], p.x));
      bboxmin[1] = Math.max(0, Math.min(bboxmin[1], p.y));

      bboxmax[0] = Math.min(clamp[0], Math.max(bboxmax[0], p.x));
      bboxmax[1] = Math.min(clamp[1], Math.max(bboxmax[1], p.y));
    }
    const P = new Vec3(0, 0, 0);
    for (P.x = bboxmin[0]; P.x <= bboxmax[0]; P.x++) {
      for (P.y = bboxmin[1]; P.y <= bboxmax[1]; P.y++) {
        const bcScreen = barycentric(points, P);
        if ([bcScreen.x, bcScreen.y, bcScreen.z].some((v) => v < 0 || v > 1)) {
          continue;
        }
        P.z = 0;
        P.z += bcScreen.x * points[0].z;
        P.z += bcScreen.y * points[1].z;
        P.z += bcScreen.z * points[2].z;
        const pixelIdx = P.x + P.y * this.el.width;
        if (this.zBuffer[pixelIdx] < P.z) {
          this.zBuffer[pixelIdx] = P.z;
          if (color instanceof Texture) {
            let u =
              color.u0 * bcScreen.x +
              color.u1 * bcScreen.y +
              color.u2 * bcScreen.z;
            let v =
              color.v0 * bcScreen.x +
              color.v1 * bcScreen.y +
              color.v2 * bcScreen.z;
            u = Math.trunc(u * color.imageData.width);
            v = Math.trunc(v * color.imageData.height);
            v = color.imageData.height - v;
            const offset = 4 * (u + v * color.imageData.width);
            if (offset >= 0 && offset + 3 < color.imageData.data.length) {
              this.putPixel(P.x, P.y, [
                color.imageData.data[offset + 0],
                color.imageData.data[offset + 1],
                color.imageData.data[offset + 2],
                color.alpha,
              ]);
            }
          } else {
            this.putPixel(P.x, P.y, color);
          }
        }
      }
    }
  }

  update() {
    this.ctx.putImageData(this.buffer, 0, 0);
  }
}

/**
 * @param {Vec3[]} points
 * @param {Vec3} p
 */
function barycentric(points, p) {
  const u = new Vec3(
    points[2].x - points[0].x,
    points[1].x - points[0].x,
    points[0].x - p.x
  );
  const v = new Vec3(
    points[2].y - points[0].y,
    points[1].y - points[0].y,
    points[0].y - p.y
  );
  const t = u.cross(v);
  if (Math.abs(t.z) < 1) {
    return new Vec3(-1, 1, 1);
  }
  return new Vec3(1 - (t.x + t.y) / t.z, t.y / t.z, t.x / t.z);
}

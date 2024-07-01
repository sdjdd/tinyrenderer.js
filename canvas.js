export class Canvas {
  /**
   * @param {HTMLCanvasElement} el
   */
  constructor(el) {
    this.el = el;
    this.ctx = el.getContext('2d');
    this.buffer = this.ctx.createImageData(el.width, el.height);
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {[number, number, number, number]} color
   */
  putPixel(x, y, color) {
    y = this.el.height - y;
    const offset = 4 * (x + y * this.el.width);
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

  update() {
    this.ctx.putImageData(this.buffer, 0, 0);
  }
}

export class Matrix {
  /**
   * @param {number} rows
   * @param {number} cols
   */
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.elements = new Array(rows * cols).fill(0);
  }

  static identity(n) {
    const mat = new Matrix(n, n);
    mat.set(0, 0, 1);
    mat.set(1, 1, 1);
    mat.set(2, 2, 1);
    mat.set(3, 3, 1);
    return mat;
  }

  /**
   * @param {number} row
   * @param {number} col
   * @returns {number}
   */
  get(row, col) {
    return this.elements[row * this.cols + col];
  }

  set(row, col, val) {
    this.elements[row * this.cols + col] = val;
  }

  /**
   * @param {number} row
   */
  row(row) {
    return this.elements.slice(row * this.cols, row * this.cols + this.cols);
  }

  col(col) {
    const arr = new Array(this.rows);
    for (let row = 0; row < this.rows; row++) {
      arr[row] = this.get(row, col);
    }
    return arr;
  }

  /**
   * @param {Matrix} m
   */
  mul(m) {
    if (m.rows !== this.cols) {
      throw new TypeError(
        `cannot mutiply matrix(${this.rows},${this.cols}) with matrix(${m.rows},${m.cols})`
      );
    }
    const target = new Matrix(this.rows, m.cols);
    for (let row = 0; row < target.rows; row++) {
      for (let col = 0; col < target.cols; col++) {
        const rNums = this.row(row);
        const cNums = m.col(col);
        let sum = 0;
        for (let i = 0; i < rNums.length; i++) {
          sum += rNums[i] * cNums[i];
        }
        target.set(row, col, sum);
      }
    }
    return target;
  }
}

export class Vec3 extends Matrix {
  /**
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  constructor(x, y, z) {
    super(3, 1);
    this.elements[0] = x;
    this.elements[1] = y;
    this.elements[2] = z;
  }

  get x() {
    return this.get(0);
  }

  set x(v) {
    this.elements[0] = v;
  }

  get y() {
    return this.get(1);
  }

  set y(v) {
    this.elements[1] = v;
  }

  get z() {
    return this.get(2);
  }

  set z(v) {
    this.elements[2] = v;
  }

  /**
   * @param {number} i
   */
  get(i) {
    return super.get(i, 0);
  }

  /**
   * @param {Vec3} v
   */
  add(v) {
    return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  /**
   * @param {Vec3} v
   */
  sub(v) {
    return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  /**
   * @param {number} n
   */
  mul(n) {
    return new Vec3(this.x * n, this.y * n, this.z * n);
  }

  /**
   * @param {Vec3} v
   */
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  /**
   * @param {Vec3} v
   */
  cross(v) {
    return new Vec3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  normalize() {
    return this.mul(1 / this.length);
  }

  floor() {
    return new Vec3(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));
  }
}

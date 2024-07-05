import { Vec3 } from './common.js';

export class Model {
  /**
   * @param {string} data
   */
  constructor(data) {
    /**
     * @type {Vec3[]}
     */
    this.verts = [];

    /**
     * @type {{ v0: number; v1: number; v2: number; vt0: number; vt1: number; vt2: number; vn0: number; vn1: number; vn2: number; }[]}
     */
    this.faces = [];

    /**
     * @type {[number, number][]}
     */
    this.texts = [];

    /**
     * @type {Vec3[]}
     */
    this.norms = [];

    const lines = data.split('\n');
    for (const line of lines) {
      const items = line.split(/\s+/);
      switch (items[0]) {
        case 'v':
          this.verts.push(
            new Vec3(Number(items[1]), Number(items[2]), Number(items[3]))
          );
          break;
        case 'f':
          const [v0, vt0, vn0] = items[1].split('/');
          const [v1, vt1, vn1] = items[2].split('/');
          const [v2, vt2, vn2] = items[3].split('/');
          this.faces.push({
            v0: Number(v0) - 1,
            v1: Number(v1) - 1,
            v2: Number(v2) - 1,
            vt0: Number(vt0) - 1,
            vt1: Number(vt1) - 1,
            vt2: Number(vt2) - 1,
            vn0: Number(vn0) - 1,
            vn1: Number(vn1) - 1,
            vn2: Number(vn2) - 1,
          });
          break;
        case 'vt':
          this.texts.push([Number(items[1]), Number(items[2])]);
          break;
        case 'vn':
          this.norms.push(
            new Vec3(Number(items[1]), Number(items[2]), Number(items[3]))
          );
          break;
      }
    }
  }
}

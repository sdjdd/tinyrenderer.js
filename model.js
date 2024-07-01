export class Model {
  /**
   * @param {string} data
   */
  constructor(data) {
    /**
     * @type {[number, number, number][]}
     */
    this.verts = [];

    /**
     * @type {[number, number, number][]}
     */
    this.faces = [];

    const lines = data.split('\n');
    for (const line of lines) {
      const items = line.split(' ');
      switch (items[0]) {
        case 'v':
          this.verts.push([
            Number(items[1]),
            Number(items[2]),
            Number(items[3]),
          ]);
          break;
        case 'f':
          this.faces.push([
            Number(items[1].split('/')[0]) - 1,
            Number(items[2].split('/')[0]) - 1,
            Number(items[3].split('/')[0]) - 1,
          ]);
          break;
      }
    }
  }
}

/**
 * @param {Blob} data
 * @returns {Promise<Model>}
 */
export function loadModel(data) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(new Model(reader.result));
    };
    reader.readAsText(data);
  });
}

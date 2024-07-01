import { Canvas } from './canvas.js';
import { loadModel } from './model.js';

const canvas = new Canvas(document.getElementById('canvas'));
const width = 800;
const height = 800;
const white = [255, 255, 255, 255];

document.getElementById('input').addEventListener('change', (e) => {
  const files = e.target.files;
  if (files.length) {
    loadModel(files[0]).then((model) => {
      for (const face of model.faces) {
        for (let j = 0; j < 3; j++) {
          const v0 = model.verts[face[j]];
          const v1 = model.verts[face[(j + 1) % 3]];
          const x0 = Math.floor(((v0[0] + 1) * width) / 2);
          const y0 = Math.floor(((v0[1] + 1) * height) / 2);
          const x1 = Math.floor(((v1[0] + 1) * width) / 2);
          const y1 = Math.floor(((v1[1] + 1) * height) / 2);
          canvas.drawLine(x0, y0, x1, y1, white);
        }
      }
      canvas.update();
    });
  }
});

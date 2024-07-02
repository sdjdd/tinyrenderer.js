import { Canvas } from './canvas.js';
import { Vec3 } from './common.js';
import { loadModel } from './model.js';

const canvas = new Canvas(document.getElementById('canvas'));
const width = 800;
const height = 800;

const lightDir = new Vec3(0, 0, -1);

document.getElementById('input').addEventListener('change', (e) => {
  const files = e.target.files;
  if (files.length) {
    loadModel(files[0]).then((model) => {
      for (const face of model.faces) {
        const worldCoords = [
          new Vec3(0, 0, 0),
          new Vec3(0, 0, 0),
          new Vec3(0, 0, 0),
        ];
        const screenCoords = [
          new Vec3(0, 0, 0),
          new Vec3(0, 0, 0),
          new Vec3(0, 0, 0),
        ];
        for (let i = 0; i < 3; i++) {
          const v = model.verts[face[i]];
          screenCoords[i] = new Vec3(
            ((v.x + 1) * width) / 2,
            ((v.y + 1) * height) / 2,
            0
          );
          worldCoords[i] = v;
        }
        const N = worldCoords[2]
          .sub(worldCoords[0])
          .cross(worldCoords[1].sub(worldCoords[0]))
          .normalize();
        const intensity = N.dot(lightDir);
        if (intensity > 0) {
          const color = Math.round(intensity * 255);
          canvas.triangle(screenCoords[0], screenCoords[1], screenCoords[2], [
            color,
            color,
            color,
            255,
          ]);
        }
      }
      canvas.update();
    });
  }
});

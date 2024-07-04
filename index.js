import TgaLoader from './lib/tga.js';
import { Canvas, Texture } from './canvas.js';
import { Matrix, Vec3 } from './common.js';
import { Model } from './model.js';

const canvas = new Canvas(document.getElementById('canvas'));
const width = 800;
const height = 800;

async function lesson1() {
  const objFile = await fetch('./african_head.obj');
  const model = new Model(await objFile.text());

  for (const face of model.faces) {
    for (let i = 0; i < 3; i++) {
      const v0 = model.verts[face[`v${i}`]];
      const v1 = model.verts[face[`v${(i + 1) % 3}`]];
      const x0 = ((v0.x + 1) / 2) * width;
      const x1 = ((v1.x + 1) / 2) * width;
      const y0 = ((v0.y + 1) / 2) * height;
      const y1 = ((v1.y + 1) / 2) * height;
      canvas.drawLine(x0, y0, x1, y1, [255, 255, 255, 255]);
    }
  }
  canvas.update();
}

async function lesson2() {
  const objFile = await fetch('./african_head.obj');
  const model = new Model(await objFile.text());

  const lightDir = new Vec3(0, 0, -1);

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
      const v = model.verts[face[`v${i}`]];
      screenCoords[i] = new Vec3(
        ((v.x + 1) * width) / 2,
        ((v.y + 1) * height) / 2,
        v.z
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
      canvas.triangle(screenCoords, [color, color, color, 255]);
    }
  }
  canvas.update();
}

async function lesson2Assignment() {
  const objFile = await fetch('./african_head.obj');
  const model = new Model(await objFile.text());

  const diffuseFile = await fetch('./african_head_diffuse.tga');
  const diffuse = new TgaLoader();
  diffuse.load(new Uint8Array(await diffuseFile.arrayBuffer()));
  const diffuseImage = diffuse.getImageData();

  const lightDir = new Vec3(0, 0, -1);

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
      const v = model.verts[face[`v${i}`]];
      screenCoords[i] = new Vec3(
        ((v.x + 1) * width) / 2,
        ((v.y + 1) * height) / 2,
        v.z
      );
      worldCoords[i] = v;
    }
    const N = worldCoords[2]
      .sub(worldCoords[0])
      .cross(worldCoords[1].sub(worldCoords[0]))
      .normalize();
    const intensity = N.dot(lightDir);
    if (intensity > 0) {
      const [u0, v0] = model.texts[face.vt0];
      const [u1, v1] = model.texts[face.vt1];
      const [u2, v2] = model.texts[face.vt2];
      canvas.triangle(
        screenCoords,
        new Texture(
          diffuseImage,
          u0,
          v0,
          u1,
          v1,
          u2,
          v2,
          Math.round(intensity * 255)
        )
      );
    }
  }
  canvas.update();
}

async function lesson3() {
  const objFile = await fetch('./african_head.obj');
  const model = new Model(await objFile.text());

  const diffuseFile = await fetch('./african_head_diffuse.tga');
  const diffuse = new TgaLoader();
  diffuse.load(new Uint8Array(await diffuseFile.arrayBuffer()));
  const diffuseImage = diffuse.getImageData();

  const lightDir = new Vec3(0, 0, -1);
  const camera = new Vec3(0, 0, 3);

  const depth = 255;

  const m2v = (m) => {
    const w = m.get(3, 0);
    return new Vec3(m.get(0, 0) / w, m.get(1, 0) / w, m.get(2, 0) / w);
  };

  const v2m = (v) => {
    const m = new Matrix(4, 1);
    m.set(0, 0, v.x);
    m.set(1, 0, v.y);
    m.set(2, 0, v.z);
    m.set(3, 0, 1);
    return m;
  };

  const viewport = (x, y, w, h) => {
    const m = Matrix.identity(4);
    m.set(0, 3, x + w / 2);
    m.set(1, 3, y + h / 2);
    m.set(2, 3, depth / 2);

    m.set(0, 0, w / 2);
    m.set(1, 1, h / 2);
    m.set(2, 2, depth / 2);
    return m;
  };

  const projection = Matrix.identity(4);
  projection.set(3, 2, -1 / camera.z);
  const view = viewport(
    width / 8,
    height / 8,
    (width * 3) / 4,
    (height * 3) / 4
  );

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
      const v = model.verts[face[`v${i}`]];
      screenCoords[i] = m2v(view.mul(projection).mul(v2m(v)));
      worldCoords[i] = v;
    }
    const N = worldCoords[2]
      .sub(worldCoords[0])
      .cross(worldCoords[1].sub(worldCoords[0]))
      .normalize();
    const intensity = N.dot(lightDir);
    if (intensity > 0) {
      const [u0, v0] = model.texts[face.vt0];
      const [u1, v1] = model.texts[face.vt1];
      const [u2, v2] = model.texts[face.vt2];
      canvas.triangle(
        screenCoords,
        new Texture(
          diffuseImage,
          u0,
          v0,
          u1,
          v1,
          u2,
          v2,
          Math.round(intensity * 255)
        )
      );
    }
  }
  canvas.update();
}

[lesson1, lesson2, lesson2Assignment, lesson3].forEach((fn) => {
  document.getElementById(fn.name).addEventListener('click', () => {
    canvas.clear();
    fn();
  });
});

lesson3();

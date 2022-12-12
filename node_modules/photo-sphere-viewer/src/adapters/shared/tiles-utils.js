import { CanvasTexture, LineSegments, Mesh, MeshBasicMaterial, SphereGeometry, WireframeGeometry } from 'three';
import { SYSTEM, utils } from '../..';

/**
 * @summary Generates an material for errored tiles
 * @memberOf PSV.adapters
 * @return {external:THREE.MeshBasicMaterial}
 * @private
 */
export function buildErrorMaterial(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#333';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${canvas.width / 5}px serif`;
  ctx.fillStyle = '#a22';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚠', canvas.width / 2, canvas.height / 2);

  const texture = new CanvasTexture(canvas);
  return new MeshBasicMaterial({ map: texture });
}

/**
 * @summary Create the texture for the base image
 * @memberOf PSV.adapters
 * @param {HTMLImageElement} img
 * @param {boolean} blur
 * @param {function} getHeight
 * @return {external:THREE.Texture}
 * @private
 */
export function createBaseTexture(img, blur, getHeight) {
  if (blur || img.width > SYSTEM.maxTextureWidth) {
    const ratio = Math.min(1, SYSTEM.getMaxCanvasWidth() / img.width);

    const buffer = document.createElement('canvas');
    buffer.width = img.width * ratio;
    buffer.height = getHeight(img.width);

    const ctx = buffer.getContext('2d');
    if (blur) {
      ctx.filter = 'blur(1px)';
    }
    ctx.drawImage(img, 0, 0, buffer.width, buffer.height);

    return utils.createTexture(buffer);
  }

  return utils.createTexture(img);
}

/**
 * @summary Creates a wireframe geometry, for debug
 * @memberOf PSV.adapters
 * @param {THREE.BufferGeometry} geometry
 * @return {THREE.Object3D}
 * @private
 */
export function createWireFrame(geometry) {
  const wireframe = new WireframeGeometry(geometry);
  const line = new LineSegments(wireframe);
  line.material.depthTest = false;
  line.material.opacity = 0.25;
  line.material.transparent = true;
  return line;
}

/**
 * @summary Creates a small red sphere, for debug
 * @memberOf PSV.adapters
 * @return {THREE.Object3D}
 * @private
 */
export function createDot(x, y, z) {
  const geom = new SphereGeometry(0.1);
  const material = new MeshBasicMaterial({ color: 0xff0000 });
  const mesh = new Mesh(geom, material);
  mesh.position.set(x, y, z);
  return mesh;
}

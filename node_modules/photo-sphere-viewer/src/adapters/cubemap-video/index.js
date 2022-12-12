import { BoxGeometry, Mesh, ShaderMaterial, Vector2 } from 'three';
import { CONSTANTS } from '../..';
import { AbstractVideoAdapter } from '../shared/AbstractVideoAdapter';

/**
 * @typedef {Object} PSV.adapters.CubemapVideoAdapter.Video
 * @summary Object defining a video
 * @property {string} source
 */

/**
 * @typedef {Object} PSV.adapters.CubemapVideoAdapter.Options
 * @property {boolean} [autoplay=false] - automatically start the video
 * @property {boolean} [muted=autoplay] - initially mute the video
 * @property {number} [equiangular=true] - if the video is an equiangular cubemap (EAC)
 */


/**
 * @summary Adapter for cubemap videos
 * @memberof PSV.adapters
 * @extends PSV.adapters.AbstractAdapter
 */
export class CubemapVideoAdapter extends AbstractVideoAdapter {

  static id = 'cubemap-video';

  /**
   * @param {PSV.Viewer} psv
   * @param {PSV.adapters.CubemapVideoAdapter.Options} options
   */
  constructor(psv, options) {
    super(psv, {
      equiangular: true,
      ...options,
    });
  }

  /**
   * @override
   * @param {PSV.adapters.CubemapVideoAdapter.Video} panorama
   * @returns {Promise.<PSV.TextureData>}
   */
  loadTexture(panorama) {
    return super.loadTexture(panorama);
  }

  /**
   * @override
   */
  createMesh(scale = 1) {
    const cubeSize = CONSTANTS.SPHERE_RADIUS * 2 * scale;
    const geometry = new BoxGeometry(cubeSize, cubeSize, cubeSize)
      .scale(1, 1, -1)
      .toNonIndexed();

    geometry.clearGroups();

    const uvs = geometry.getAttribute('uv');

    /*
      Structure of a frame

      1 +---------+---------+---------+
        |         |         |         |
        |  Left   |  Front  |  Right  |
        |         |         |         |
    1/2 +---------+---------+---------+
        |         |         |         |
        | Bottom  |  Back   |   Top   |
        |         |         |         |
      0 +---------+---------+---------+
        0        1/3       2/3        1

       Bottom, Back and Top are rotated 90° clockwise
     */

    // columns
    const a = 0;
    const b = 1 / 3;
    const c = 2 / 3;
    const d = 1;

    // lines
    const A = 1;
    const B = 1 / 2;
    const C = 0;

    // left
    uvs.setXY(0, a, A);
    uvs.setXY(1, a, B);
    uvs.setXY(2, b, A);
    uvs.setXY(3, a, B);
    uvs.setXY(4, b, B);
    uvs.setXY(5, b, A);

    // right
    uvs.setXY(6, c, A);
    uvs.setXY(7, c, B);
    uvs.setXY(8, d, A);
    uvs.setXY(9, c, B);
    uvs.setXY(10, d, B);
    uvs.setXY(11, d, A);

    // top
    uvs.setXY(12, d, B);
    uvs.setXY(13, c, B);
    uvs.setXY(14, d, C);
    uvs.setXY(15, c, B);
    uvs.setXY(16, c, C);
    uvs.setXY(17, d, C);

    // bottom
    uvs.setXY(18, b, B);
    uvs.setXY(19, a, B);
    uvs.setXY(20, b, C);
    uvs.setXY(21, a, B);
    uvs.setXY(22, a, C);
    uvs.setXY(23, b, C);

    // back
    uvs.setXY(24, c, B);
    uvs.setXY(25, b, B);
    uvs.setXY(26, c, C);
    uvs.setXY(27, b, B);
    uvs.setXY(28, b, C);
    uvs.setXY(29, c, C);

    // front
    uvs.setXY(30, b, A);
    uvs.setXY(31, b, B);
    uvs.setXY(32, c, A);
    uvs.setXY(33, b, B);
    uvs.setXY(34, c, B);
    uvs.setXY(35, c, A);

    // shamelessly copied from https://github.com/videojs/videojs-vr
    const material = new ShaderMaterial({
      uniforms      : {
        mapped     : { value: null },
        contCorrect: { value: 1 },
        faceWH     : { value: new Vector2(1 / 3, 1 / 2) },
        vidWH      : { value: new Vector2(1, 1) },
      },
      vertexShader  : `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}`,
      fragmentShader: `
varying vec2 vUv;
uniform sampler2D mapped;
uniform vec2 faceWH;
uniform vec2 vidWH;
uniform float contCorrect;

const float PI = 3.1415926535897932384626433832795;

void main() {
  vec2 corner = vUv - mod(vUv, faceWH) + vec2(0, contCorrect / vidWH.y);
  vec2 faceWHadj = faceWH - vec2(0, contCorrect * 2. / vidWH.y);
  vec2 p = (vUv - corner) / faceWHadj - .5;
  vec2 q = ${this.config.equiangular ? '2. / PI * atan(2. * p) + .5' : 'p + .5'};
  vec2 eUv = corner + q * faceWHadj;
  gl_FragColor = texture2D(mapped, eUv);
}`,
    });

    return new Mesh(geometry, material);
  }

  /**
   * @override
   */
  setTexture(mesh, textureData) {
    const { texture } = textureData;

    mesh.material.uniforms.mapped.value?.dispose();
    mesh.material.uniforms.mapped.value = texture;
    mesh.material.uniforms.vidWH.value.set(texture.image.videoWidth, texture.image.videoHeight);

    this.__switchVideo(textureData.texture);
  }

}

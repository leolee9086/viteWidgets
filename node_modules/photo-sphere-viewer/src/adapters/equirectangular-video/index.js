import { MathUtils, Mesh, MeshBasicMaterial, SphereGeometry } from 'three';
import { CONSTANTS, PSVError } from '../..';
import { AbstractVideoAdapter } from '../shared/AbstractVideoAdapter';

/**
 * @typedef {Object} PSV.adapters.EquirectangularVideoAdapter.Video
 * @summary Object defining a video
 * @property {string} source
 */

/**
 * @typedef {Object} PSV.adapters.EquirectangularVideoAdapter.Options
 * @property {boolean} [autoplay=false] - automatically start the video
 * @property {boolean} [muted=autoplay] - initially mute the video
 * @property {number} [resolution=64] - number of faces of the sphere geometry, higher values may decrease performances
 */


/**
 * @summary Adapter for equirectangular videos
 * @memberof PSV.adapters
 * @extends PSV.adapters.AbstractAdapter
 */
export class EquirectangularVideoAdapter extends AbstractVideoAdapter {

  static id = 'equirectangular-video';

  /**
   * @param {PSV.Viewer} psv
   * @param {PSV.adapters.EquirectangularVideoAdapter.Options} options
   */
  constructor(psv, options) {
    super(psv, {
      resolution: 64,
      ...options,
    });

    if (!MathUtils.isPowerOfTwo(this.config.resolution)) {
      throw new PSVError('EquirectangularVideoAdapter resolution must be power of two');
    }

    this.SPHERE_SEGMENTS = this.config.resolution;
    this.SPHERE_HORIZONTAL_SEGMENTS = this.SPHERE_SEGMENTS / 2;
  }

  /**
   * @override
   * @param {PSV.adapters.EquirectangularVideoAdapter.Video} panorama
   * @returns {Promise.<PSV.TextureData>}
   */
  loadTexture(panorama) {
    return super.loadTexture(panorama)
      .then(({ texture }) => {
        const video = texture.image;
        const panoData = {
          fullWidth    : video.videoWidth,
          fullHeight   : video.videoHeight,
          croppedWidth : video.videoWidth,
          croppedHeight: video.videoHeight,
          croppedX     : 0,
          croppedY     : 0,
          poseHeading  : 0,
          posePitch    : 0,
          poseRoll     : 0,
        };

        return { panorama, texture, panoData };
      });
  }

  /**
   * @override
   */
  createMesh(scale = 1) {
    const geometry = new SphereGeometry(
      CONSTANTS.SPHERE_RADIUS * scale,
      this.SPHERE_SEGMENTS,
      this.SPHERE_HORIZONTAL_SEGMENTS,
      -Math.PI / 2
    )
      .scale(-1, 1, 1);

    const material = new MeshBasicMaterial();

    return new Mesh(geometry, material);
  }

  /**
   * @override
   */
  setTexture(mesh, textureData) {
    mesh.material.map?.dispose();
    mesh.material.map = textureData.texture;

    this.__switchVideo(textureData.texture);
  }

}

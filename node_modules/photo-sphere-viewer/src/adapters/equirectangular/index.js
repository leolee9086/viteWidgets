import { MathUtils, Mesh, SphereGeometry, Texture } from 'three';
import { SPHERE_RADIUS } from '../../data/constants';
import { SYSTEM } from '../../data/system';
import { PSVError } from '../../PSVError';
import { createTexture, firstNonNull, getXMPValue, logWarn } from '../../utils';
import { AbstractAdapter } from '../AbstractAdapter';


/**
 * @typedef {Object} PSV.adapters.EquirectangularAdapter.Options
 * @property {number} [resolution=64] - number of faces of the sphere geometry, higher values may decrease performances
 */


/**
 * @summary Adapter for equirectangular panoramas
 * @memberof PSV.adapters
 * @extends PSV.adapters.AbstractAdapter
 */
export class EquirectangularAdapter extends AbstractAdapter {

  static id = 'equirectangular';
  static supportsDownload = true;
  static supportsOverlay = true;

  /**
   * @param {PSV.Viewer} psv
   * @param {PSV.adapters.EquirectangularAdapter.Options} options
   */
  constructor(psv, options) {
    super(psv);

    /**
     * @member {PSV.adapters.EquirectangularAdapter.Options}
     * @private
     */
    this.config = {
      resolution: 64,
      ...options,
    };

    if (!MathUtils.isPowerOfTwo(this.config.resolution)) {
      throw new PSVError('EquirectangularAdapter resolution must be power of two');
    }

    this.SPHERE_SEGMENTS = this.config.resolution;
    this.SPHERE_HORIZONTAL_SEGMENTS = this.SPHERE_SEGMENTS / 2;
  }

  /**
   * @override
   */
  supportsTransition() {
    return true;
  }

  /**
   * @override
   */
  supportsPreload() {
    return true;
  }

  /**
   * @override
   * @param {string} panorama
   * @param {PSV.PanoData | PSV.PanoDataProvider} [newPanoData]
   * @param {boolean} [useXmpPanoData]
   * @returns {Promise.<PSV.TextureData>}
   */
  loadTexture(panorama, newPanoData, useXmpPanoData = this.psv.config.useXmpData) {
    if (typeof panorama !== 'string') {
      if (Array.isArray(panorama) || typeof panorama === 'object' && !!panorama.left) {
        logWarn('Cubemap support now requires an additional adapter, see https://photo-sphere-viewer.js.org/guide/adapters');
      }
      return Promise.reject(new PSVError('Invalid panorama url, are you using the right adapter?'));
    }

    return (
      useXmpPanoData
        ? this.__loadXMP(panorama, p => this.psv.loader.setProgress(p))
          .then(xmpPanoData => this.psv.textureLoader.loadImage(panorama).then(img => ({ img, xmpPanoData })))
        : this.psv.textureLoader.loadImage(panorama, p => this.psv.loader.setProgress(p))
          .then(img => ({ img: img, xmpPanoData: null }))
    )
      .then(({ img, xmpPanoData }) => {
        if (typeof newPanoData === 'function') {
          newPanoData = newPanoData(img);
        }

        const panoData = {
          fullWidth    : firstNonNull(newPanoData?.fullWidth, xmpPanoData?.fullWidth, img.width),
          fullHeight   : firstNonNull(newPanoData?.fullHeight, xmpPanoData?.fullHeight, img.height),
          croppedWidth : firstNonNull(newPanoData?.croppedWidth, xmpPanoData?.croppedWidth, img.width),
          croppedHeight: firstNonNull(newPanoData?.croppedHeight, xmpPanoData?.croppedHeight, img.height),
          croppedX     : firstNonNull(newPanoData?.croppedX, xmpPanoData?.croppedX, 0),
          croppedY     : firstNonNull(newPanoData?.croppedY, xmpPanoData?.croppedY, 0),
          poseHeading  : firstNonNull(newPanoData?.poseHeading, xmpPanoData?.poseHeading, 0),
          posePitch    : firstNonNull(newPanoData?.posePitch, xmpPanoData?.posePitch, 0),
          poseRoll     : firstNonNull(newPanoData?.poseRoll, xmpPanoData?.poseRoll, 0),
        };

        if (panoData.croppedWidth !== img.width || panoData.croppedHeight !== img.height) {
          logWarn(`Invalid panoData, croppedWidth and/or croppedHeight is not coherent with loaded image.
    panoData: ${panoData.croppedWidth}x${panoData.croppedHeight}, image: ${img.width}x${img.height}`);
        }
        if ((newPanoData || xmpPanoData) && panoData.fullWidth !== panoData.fullHeight * 2) {
          logWarn('Invalid panoData, fullWidth should be twice fullHeight');
        }

        const texture = this.__createEquirectangularTexture(img, panoData);

        return { panorama, texture, panoData };
      });
  }

  /**
   * @summary Loads the XMP data of an image
   * @param {string} panorama
   * @param {function(number)} [onProgress]
   * @returns {Promise<PSV.PanoData>}
   * @throws {PSV.PSVError} when the image cannot be loaded
   * @private
   */
  __loadXMP(panorama, onProgress) {
    return this.psv.textureLoader.loadFile(panorama, onProgress)
      .then(blob => this.__loadBlobAsString(blob))
      .then((binary) => {
        const a = binary.indexOf('<x:xmpmeta');
        const b = binary.indexOf('</x:xmpmeta>');
        const data = binary.substring(a, b);

        if (a !== -1 && b !== -1 && data.includes('GPano:')) {
          return {
            fullWidth    : getXMPValue(data, 'FullPanoWidthPixels'),
            fullHeight   : getXMPValue(data, 'FullPanoHeightPixels'),
            croppedWidth : getXMPValue(data, 'CroppedAreaImageWidthPixels'),
            croppedHeight: getXMPValue(data, 'CroppedAreaImageHeightPixels'),
            croppedX     : getXMPValue(data, 'CroppedAreaLeftPixels'),
            croppedY     : getXMPValue(data, 'CroppedAreaTopPixels'),
            poseHeading  : getXMPValue(data, 'PoseHeadingDegrees'),
            posePitch    : getXMPValue(data, 'PosePitchDegrees'),
            poseRoll     : getXMPValue(data, 'PoseRollDegrees'),
          };
        }

        return null;
      });
  }

  /**
   * @summmary read a Blob as string
   * @param {Blob} blob
   * @returns {Promise<string>}
   * @private
   */
  __loadBlobAsString(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(blob);
    });
  }

  /**
   * @summary Creates the final texture from image and panorama data
   * @param {Image} img
   * @param {PSV.PanoData} panoData
   * @returns {external:THREE.Texture}
   * @private
   */
  __createEquirectangularTexture(img, panoData) {
    // resize image / fill cropped parts with black
    if (panoData.fullWidth > SYSTEM.maxTextureWidth
      || panoData.croppedWidth !== panoData.fullWidth
      || panoData.croppedHeight !== panoData.fullHeight
    ) {
      const ratio = SYSTEM.getMaxCanvasWidth() / panoData.fullWidth;

      const resizedPanoData = { ...panoData };
      if (ratio < 1) {
        resizedPanoData.fullWidth *= ratio;
        resizedPanoData.fullHeight *= ratio;
        resizedPanoData.croppedWidth *= ratio;
        resizedPanoData.croppedHeight *= ratio;
        resizedPanoData.croppedX *= ratio;
        resizedPanoData.croppedY *= ratio;
      }

      const buffer = document.createElement('canvas');
      buffer.width = resizedPanoData.fullWidth;
      buffer.height = resizedPanoData.fullHeight;

      const ctx = buffer.getContext('2d');
      ctx.drawImage(img,
        resizedPanoData.croppedX, resizedPanoData.croppedY,
        resizedPanoData.croppedWidth, resizedPanoData.croppedHeight);

      return createTexture(buffer);
    }

    return createTexture(img);
  }

  /**
   * @override
   */
  createMesh(scale = 1) {
    // The middle of the panorama is placed at longitude=0
    const geometry = new SphereGeometry(
      SPHERE_RADIUS * scale,
      this.SPHERE_SEGMENTS,
      this.SPHERE_HORIZONTAL_SEGMENTS,
      -Math.PI / 2
    )
      .scale(-1, 1, 1);

    const material = AbstractAdapter.createOverlayMaterial();

    return new Mesh(geometry, material);
  }

  /**
   * @override
   */
  setTexture(mesh, textureData) {
    this.__setUniform(mesh, AbstractAdapter.OVERLAY_UNIFORMS.panorama, textureData.texture);
    this.setOverlay(mesh, null);
  }

  /**
   * @override
   */
  setOverlay(mesh, textureData, opacity) {
    this.__setUniform(mesh, AbstractAdapter.OVERLAY_UNIFORMS.overlayOpacity, opacity);
    if (!textureData) {
      this.__setUniform(mesh, AbstractAdapter.OVERLAY_UNIFORMS.overlay, new Texture());
    }
    else {
      this.__setUniform(mesh, AbstractAdapter.OVERLAY_UNIFORMS.overlay, textureData.texture);
    }
  }

  /**
   * @override
   */
  setTextureOpacity(mesh, opacity) {
    this.__setUniform(mesh, AbstractAdapter.OVERLAY_UNIFORMS.globalOpacity, opacity);
    mesh.material.transparent = opacity < 1;
  }

  /**
   * @override
   */
  disposeTexture(textureData) {
    textureData.texture?.dispose();
  }

  /**
   * @param {external:THREE.Mesh} mesh
   * @param {string} uniform
   * @param {*} value
   * @private
   */
  __setUniform(mesh, uniform, value) {
    if (mesh.material.uniforms[uniform].value instanceof Texture) {
      mesh.material.uniforms[uniform].value.dispose();
    }
    mesh.material.uniforms[uniform].value = value;
  }

}

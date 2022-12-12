let debugMarkers = [];

/**
 * @private
 */
export function debugCurve(markers, curve, stepSize) {
  debugMarkers.forEach((marker) => {
    try {
      markers.removeMarker(marker.id);
    }
    catch (e) {
      // noop
    }
  });

  debugMarkers = [
    markers.addMarker({
      id         : 'autorotate-path',
      polylineRad: curve,
      svgStyle   : {
        stroke     : 'white',
        strokeWidth: '2px',
      },
    }),
  ];

  curve.forEach((pos, i) => {
    debugMarkers.push(markers.addMarker({
      id       : 'autorotate-path-' + i,
      circle   : 5,
      longitude: pos[0],
      latitude : pos[1],
      svgStyle : {
        fill: i % stepSize === 0 ? 'red' : 'black',
      },
    }));
  });
}

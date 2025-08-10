import videojs from 'video.js';

export const defaults = {
  fullscreen: {
    enterOnRotate: true,
    exitOnRotate: true,
    alwaysInLandscapeMode: true,
    iOS: true,
  },
};

const screenApi = window.screen || (window as any).screen;

export function lockOrientationUniversal(orientation: string) {
  const s = screenApi as any;
  if (s && s.orientation && typeof s.orientation.lock === 'function') {
    s.orientation.lock(orientation).catch((e: any) => console.log(e));
  } else if (typeof s.mozLockOrientation === 'function') {
    s.mozLockOrientation(orientation);
  } else if (typeof s.msLockOrientation === 'function') {
    s.msLockOrientation(orientation);
  }
}

/**
 * Setup orientation change handler on window/screen and return cleanup function
 */
export function setupOrientationHandler(
  player: any,
  onOrientationChange: () => void,
  isIOS: boolean,
  isAndroid: boolean
): () => void {
  if (isIOS) {
    window.addEventListener('orientationchange', onOrientationChange);
  } else if (screenApi && screenApi.orientation) {
    screenApi.orientation.addEventListener('change', onOrientationChange);
  }

  player.on('fullscreenchange', () => {
    if (
      (isAndroid || isIOS) &&
      defaults.fullscreen.alwaysInLandscapeMode &&
      player.isFullscreen()
    ) {
      lockOrientationUniversal('landscape');
    }
  });

  // Cleanup function
  return () => {
    if (isIOS) {
      window.removeEventListener('orientationchange', onOrientationChange);
    } else if (screenApi && screenApi.orientation) {
      screenApi.orientation.removeEventListener('change', onOrientationChange);
    }
  };
}

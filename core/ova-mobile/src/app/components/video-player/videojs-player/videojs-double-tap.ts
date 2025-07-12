import videojs from 'video.js';

export function registerDoubleTapPlugin() {
  function doubleTapFF(this: any) {
    const videoElement = this;
    const videoElementId = videoElement.id();
    const element = document.getElementById(videoElementId);
    if (!element) return;

    let tappedTwice = false;

    element.addEventListener('touchstart', function tapHandler(e: TouchEvent) {
      if (videoElement.paused()) return;

      if (!tappedTwice) {
        tappedTwice = true;
        setTimeout(() => (tappedTwice = false), 300);
        return;
      }

      e.preventDefault();
      const br = element.getBoundingClientRect();
      const x = e.touches[0].clientX - br.left;

      if (x <= br.width / 2) {
        videoElement.currentTime(videoElement.currentTime() - 10);
        console.log('⏪ Rewind 10s');
      } else {
        videoElement.currentTime(videoElement.currentTime() + 10);
        console.log('⏩ Forward 10s');
      }
    });
  }

  videojs.registerPlugin('doubleTapFF', doubleTapFF);
}

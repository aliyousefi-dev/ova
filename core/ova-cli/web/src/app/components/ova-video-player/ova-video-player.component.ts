import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
  SimpleChanges,
} from '@angular/core';
import { VideoData } from '../../data-types/video-data';
import { VideoApiService } from '../../services/video-api.service'; // Adjust path as needed

@Component({
  selector: 'ova-video-player',
  templateUrl: './ova-video-player.component.html',
})
export class OvaVideoPlayerComponent implements OnChanges, OnDestroy {
  @Input() video: VideoData | null = null;

  @ViewChild('videoElement', { static: true })
  videoElementRef!: ElementRef<HTMLVideoElement>;

  private mediaSource: MediaSource | null = null;
  private sourceBuffer: SourceBuffer | null = null;
  private videoUrl: string | null = null;

  isPlaying = false;

  constructor(private videoApiService: VideoApiService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['video']) {
      this.loadVideo();
    }
  }

  ngOnDestroy() {
    this.cleanupMediaSource();
  }

  private cleanupMediaSource() {
    if (this.mediaSource) {
      try {
        if (this.sourceBuffer && this.mediaSource.readyState === 'open') {
          this.mediaSource.removeSourceBuffer(this.sourceBuffer);
        }
      } catch (e) {
        console.warn('Error removing source buffer:', e);
      }
      this.mediaSource = null;
      this.sourceBuffer = null;
    }
    if (this.videoUrl) {
      URL.revokeObjectURL(this.videoUrl);
      this.videoUrl = null;
    }
  }

  private async loadVideo() {
    this.cleanupMediaSource();

    const videoEl = this.videoElementRef.nativeElement;
    if (!this.video || !this.video.videoId) {
      console.warn('No video or videoId to load.');
      videoEl.removeAttribute('src');
      videoEl.load();
      return;
    }

    const streamUrl = this.videoApiService.getStreamUrl(this.video.videoId);

    const mimeType = this.getMimeType(streamUrl);
    if (!mimeType || !this.isMimeTypeSupported(mimeType)) {
      console.error(`Unsupported or missing MIME type: ${mimeType}`);
      this.setVideoSrcDirect(videoEl, streamUrl);
      return;
    }

    if ('MediaSource' in window) {
      try {
        this.mediaSource = new MediaSource();

        // Attach error events on mediaSource
        this.mediaSource.addEventListener('error', (e) => {
          console.error('MediaSource error event:', e);
          this.setVideoSrcDirect(videoEl, streamUrl);
        });
        this.mediaSource.addEventListener('sourceended', () => {
          console.log('MediaSource ended');
        });
        this.mediaSource.addEventListener('sourceclose', () => {
          console.log('MediaSource closed');
        });

        videoEl.src = URL.createObjectURL(this.mediaSource);

        this.mediaSource.addEventListener('sourceopen', () =>
          this.onSourceOpen(mimeType, streamUrl)
        );
      } catch (e) {
        console.error('MediaSource initialization error:', e);
        this.setVideoSrcDirect(videoEl, streamUrl);
      }
    } else {
      this.setVideoSrcDirect(videoEl, streamUrl);
    }
  }

  private setVideoSrcDirect(videoEl: HTMLVideoElement, url: string) {
    console.log('Using direct video src fallback:', url);
    videoEl.src = url;
    videoEl.load();
  }

  private onSourceOpen(mimeType: string, url: string) {
    if (!this.mediaSource || this.mediaSource.readyState !== 'open') {
      console.error('MediaSource not open when sourceopen event fired.');
      return;
    }
    if (!this.mediaSource.sourceBuffers.length) {
      try {
        this.sourceBuffer = this.mediaSource.addSourceBuffer(mimeType);

        this.sourceBuffer.addEventListener('error', (e) => {
          console.error('SourceBuffer error event:', e);
        });

        this.sourceBuffer.addEventListener('abort', (e) => {
          console.warn('SourceBuffer abort event:', e);
        });

        this.sourceBuffer.addEventListener('updateend', () => {
          // Optionally log updateend
          // console.log('SourceBuffer updateend');
        });

        this.fetchAndAppendVideoData(url);
      } catch (e) {
        console.error('Error adding source buffer:', e);
        this.setVideoSrcDirect(this.videoElementRef.nativeElement, url);
      }
    }
  }

  private async fetchAndAppendVideoData(url: string) {
    if (!this.sourceBuffer || !this.mediaSource) {
      console.error('SourceBuffer or MediaSource is null.');
      return;
    }
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error fetching video: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('ReadableStream not supported.');

      const readChunk = async (): Promise<void> => {
        const { done, value } = await reader.read();

        if (done) {
          if (this.mediaSource && this.mediaSource.readyState === 'open') {
            try {
              this.mediaSource.endOfStream();
            } catch (e) {
              console.warn('Failed to end media source stream:', e);
            }
          }
          return;
        }

        if (value) {
          try {
            await this.appendBuffer(value);
          } catch (e) {
            console.error('Error appending buffer:', e);
            if (this.mediaSource && this.mediaSource.readyState === 'open') {
              try {
                this.mediaSource.endOfStream('decode');
              } catch (err) {
                console.warn(
                  'Failed to end media source on append error:',
                  err
                );
              }
            }
            throw e;
          }
        }
        return readChunk();
      };

      await readChunk();
    } catch (error) {
      console.error('Error fetching/appending video data:', error);
      if (this.mediaSource && this.mediaSource.readyState === 'open') {
        try {
          this.mediaSource.endOfStream('network');
        } catch (e) {
          console.warn('Failed to end media source on error:', e);
        }
      }
    }
  }

  private appendBuffer(chunk: Uint8Array): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.sourceBuffer) {
        return reject('SourceBuffer is null');
      }
      const sb = this.sourceBuffer;

      const onUpdateEnd = () => {
        sb.removeEventListener('updateend', onUpdateEnd);
        sb.removeEventListener('error', onError);
        resolve();
      };

      const onError = (e: any) => {
        sb.removeEventListener('updateend', onUpdateEnd);
        sb.removeEventListener('error', onError);
        reject(e);
      };

      sb.addEventListener('updateend', onUpdateEnd);
      sb.addEventListener('error', onError);

      if (sb.updating) {
        const waitForUpdate = () => {
          if (!sb.updating) {
            try {
              sb.appendBuffer(chunk);
            } catch (e) {
              reject(e);
            }
          } else {
            setTimeout(waitForUpdate, 50);
          }
        };
        waitForUpdate();
      } else {
        try {
          sb.appendBuffer(chunk);
        } catch (e) {
          reject(e);
        }
      }
    });
  }

  togglePlay() {
    const videoEl = this.videoElementRef.nativeElement;
    if (videoEl.paused) {
      videoEl.play().catch((e) => {
        console.error('Play failed:', e);
      });
      this.isPlaying = true;
    } else {
      videoEl.pause();
      this.isPlaying = false;
    }
  }

  private getMimeType(url: string): string | null {
    // Improved basic guess based on file extension
    if (!url) return null;
    const ext = url.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'mp4':
        return 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
      case 'webm':
        return 'video/webm; codecs="vp8, vorbis"';
      case 'ogg':
      case 'ogv':
        return 'video/ogg; codecs="theora"';
      default:
        return null;
    }
  }

  private isMimeTypeSupported(mimeType: string): boolean {
    return MediaSource.isTypeSupported(mimeType);
  }
}

import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
  SimpleChanges,
  NgZone,
  HostListener,
  Renderer2, // Import Renderer2 for safer DOM manipulation
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VideoData } from '../../data-types/video-data';
import { VideoApiService } from '../../services/video-api.service';

@Component({
  selector: 'ova-video-player',
  templateUrl: './ova-video-player.component.html',
  styleUrls: ['./ova-video-player.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class OvaVideoPlayerComponent implements OnChanges, OnDestroy {
  @Input() video: VideoData | null = null;

  @ViewChild('videoElement', { static: true })
  videoElementRef!: ElementRef<HTMLVideoElement>;

  @ViewChild('progressBarContainer', { static: false })
  progressBarContainerRef!: ElementRef<HTMLDivElement>; // Reference to the progress bar container

  private mediaSource: MediaSource | null = null;
  private sourceBuffer: SourceBuffer | null = null;
  private objectUrl: string | null = null;
  private isSourceBufferUpdating: boolean = false; // Flag to track SourceBuffer updates
  private isFetchingData: boolean = false; // Flag to prevent multiple concurrent fetches

  isPlaying = false;
  currentTime = 0;
  totalDuration = 0;
  bufferedRanges: TimeRanges | null = null;
  volume = 1;
  isMuted = false;
  isFullScreen = false;
  showControls = false;
  private controlsTimeout: any;

  isDragging = false; // New flag for dragging state
  private wasPlayingBeforeDrag = false; // To resume playback after drag

  // Buffer management constants (can be tuned)
  private readonly PREFERRED_BUFFER_LENGTH_SEC = 60; // Target buffer ahead of playhead
  private readonly MIN_BUFFER_BEHIND_SEC = 2; // Minimum buffer to keep behind current time during prune
  private readonly PRUNE_THRESHOLD_SEC = 10; // Prune if a segment is more than this much behind current time
  private readonly MAX_RETRY_APPEND_ATTEMPTS = 3; // Max retries for appendBuffer after QuotaExceededError

  // Event listener references to allow proper removal and prevent memory leaks
  private mediaSourceListeners: Map<string, EventListener> = new Map();
  private sourceBufferListeners: Map<string, EventListener> = new Map();
  private videoElementListeners: Map<string, EventListener> = new Map();
  // Store references to global listeners for proper removal
  private globalMouseMoveListener: (() => void) | null = null;
  private globalMouseUpListener: (() => void) | null = null;
  private globalFullScreenChangeListeners: Map<string, () => void> = new Map();

  constructor(
    private videoApiService: VideoApiService,
    private ngZone: NgZone,
    private hostElement: ElementRef,
    private renderer: Renderer2 // Inject Renderer2
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['video']) {
      this.loadVideo();
    }
  }

  ngOnDestroy() {
    this.cleanupMediaSource();
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
    }
    this.removeGlobalListeners(); // Ensure global listeners are removed
  }

  /**
   * Removes global document event listeners.
   */
  private removeGlobalListeners() {
    if (this.globalMouseMoveListener) {
      this.globalMouseMoveListener(); // Call the stored unsubscribe function
      this.globalMouseMoveListener = null;
    }
    if (this.globalMouseUpListener) {
      this.globalMouseUpListener(); // Call the stored unsubscribe function
      this.globalMouseUpListener = null;
    }
    this.globalFullScreenChangeListeners.forEach((unsubscribe, eventType) => {
      unsubscribe();
    });
    this.globalFullScreenChangeListeners.clear();
  }

  /**
   * Adds a global document event listener using Renderer2 and stores its unsubscribe function.
   */
  private addGlobalListener(
    target: any,
    eventName: string,
    callback: (event: any) => void
  ) {
    // Cast callback to any for renderer.listen type compatibility
    const unsubscribe = this.renderer.listen(
      target,
      eventName,
      callback as any
    );
    if (target === document) {
      if (eventName.includes('fullscreenchange')) {
        this.globalFullScreenChangeListeners.set(eventName, unsubscribe);
      } else if (eventName === 'mousemove') {
        this.globalMouseMoveListener = unsubscribe;
      } else if (eventName === 'mouseup') {
        this.globalMouseUpListener = unsubscribe;
      }
    }
  }

  @HostListener('document:fullscreenchange')
  @HostListener('document:webkitfullscreenchange')
  @HostListener('document:mozfullscreenchange')
  @HostListener('document:MSFullscreenChange')
  onFullScreenChange = () => {
    // Use arrow function to preserve 'this' context
    this.ngZone.run(() => {
      // Ensure Angular updates are triggered
      this.isFullScreen =
        !!document.fullscreenElement ||
        !!(document as any).webkitFullscreenElement ||
        !!(document as any).mozFullScreenElement ||
        !!(document as any).msFullscreenElement;

      if (this.isFullScreen) {
        this.renderer.addClass(this.hostElement.nativeElement, 'fullscreen');
      } else {
        this.renderer.removeClass(this.hostElement.nativeElement, 'fullscreen');
      }
    });
  };

  resetControlsTimeout() {
    this.showControls = true;
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
    }
    // Only hide controls if playing after a delay and not dragging
    if (this.isPlaying && !this.isDragging) {
      this.controlsTimeout = setTimeout(() => {
        this.showControls = false;
      }, 3000);
    }
  }

  togglePlay() {
    const videoEl = this.videoElementRef.nativeElement;
    if (this.isPlaying) {
      videoEl.pause();
    } else {
      // Check if video is ended and reset to start
      if (videoEl.ended) {
        videoEl.currentTime = 0;
      }
      videoEl.play().catch((error) => {
        console.error('Error attempting to play video:', error);
        // User interaction might be required, or auto-play is blocked.
        // Consider showing a "Play" button overlay.
      });
    }
    // isPlaying state will be updated by 'play'/'pause' events
    this.resetControlsTimeout(); // Reset timeout on play/pause
  }

  toggleMute() {
    const videoEl = this.videoElementRef.nativeElement;
    videoEl.muted = !videoEl.muted;
    this.isMuted = videoEl.muted; // Update Angular state
  }

  setVolume() {
    const videoEl = this.videoElementRef.nativeElement;
    videoEl.volume = this.volume;
    localStorage.setItem('playerVolume', this.volume.toString());
    this.isMuted = videoEl.volume === 0; // Update muted state if volume is 0
  }

  toggleFullScreen() {
    const videoContainer = this.hostElement.nativeElement; // Fullscreen the host element

    if (!document.fullscreenElement) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      } else if ((videoContainer as any).mozRequestFullScreen) {
        /* Firefox */
        (videoContainer as any).mozRequestFullScreen();
      } else if ((videoContainer as any).webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        (videoContainer as any).webkitRequestFullscreen();
      } else if ((videoContainer as any).msRequestFullscreen) {
        /* IE/Edge */
        (videoContainer as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        /* Firefox */
        (document as any).mozCancelFullScreen();
      } else if ((document as any).webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        /* IE/Edge */
        (document as any).msExitFullscreen();
      }
    }
    // onFullScreenChange listener will update this.isFullScreen
  }

  // --- Playback / Seeking Logic ---

  /**
   * Calculates and sets the video currentTime based on mouse position on the progress bar.
   */
  private performSeek(event: MouseEvent) {
    if (!this.progressBarContainerRef || this.totalDuration === 0) return;

    const progressBar = this.progressBarContainerRef.nativeElement;
    const rect = progressBar.getBoundingClientRect();
    let clickX = event.clientX - rect.left;

    // Clamp clickX within the bounds of the progress bar
    clickX = Math.max(0, Math.min(clickX, rect.width));

    const seekPercentage = clickX / rect.width;
    const seekTime = this.totalDuration * seekPercentage;

    const videoEl = this.videoElementRef.nativeElement;

    if (isNaN(seekTime) || !isFinite(seekTime)) {
      console.warn('Invalid seekTime calculated during seek operation.');
      return;
    }

    // Check if the seek time is within a buffered range
    let isBuffered = false;
    if (this.bufferedRanges) {
      for (let i = 0; i < this.bufferedRanges.length; i++) {
        if (
          seekTime >= this.bufferedRanges.start(i) &&
          seekTime <= this.bufferedRanges.end(i)
        ) {
          isBuffered = true;
          break;
        }
      }
    }

    if (!isBuffered) {
      console.warn(
        `Seek time ${seekTime.toFixed(
          2
        )}s is not currently buffered. Player will attempt to seek, but may stutter or require more data.`
      );
      // In a more advanced player, you would trigger a re-fetch of data
      // starting from `seekTime` if it's not buffered.
      // For this example, we'll allow the seek, and the browser will try to handle it.
      // If using MSE, this is where you'd trigger an appendBuffer operation for the seeked time.
    }

    // Update video currentTime immediately for visual feedback
    // The `timeupdate` listener will also update `this.currentTime`
    videoEl.currentTime = seekTime;

    // Force Angular to update the UI
    this.ngZone.run(() => {
      this.currentTime = videoEl.currentTime;
      this.resetControlsTimeout();
    });
  }

  // Event handler for clicking anywhere on the progress bar
  onProgressBarMouseDown(event: MouseEvent) {
    // Only start dragging if it's the left mouse button
    if (event.button !== 0) return;

    this.isDragging = true;
    this.wasPlayingBeforeDrag = this.isPlaying;
    const videoEl = this.videoElementRef.nativeElement;

    // Pause video if it was playing to prevent conflicts during scrubbing
    if (this.wasPlayingBeforeDrag) {
      videoEl.pause();
    }

    // Perform an initial seek on mousedown (for direct click behavior)
    this.performSeek(event);

    // Attach global mousemove and mouseup listeners
    this.addGlobalListener(document, 'mousemove', this.onDocumentMouseMove);
    this.addGlobalListener(document, 'mouseup', this.onDocumentMouseUp);

    event.preventDefault(); // Prevent default browser drag behavior
  }

  // Event handler for mousedown on the scrubber handle itself
  onHandleMouseDown(event: MouseEvent) {
    // Stop event propagation to prevent `onProgressBarMouseDown` from firing
    event.stopPropagation();
    // Only start dragging if it's the left mouse button
    if (event.button !== 0) return;

    this.isDragging = true;
    this.wasPlayingBeforeDrag = this.isPlaying;
    const videoEl = this.videoElementRef.nativeElement;

    // Pause video if it was playing
    if (this.wasPlayingBeforeDrag) {
      videoEl.pause();
    }

    // Attach global mousemove and mouseup listeners
    this.addGlobalListener(document, 'mousemove', this.onDocumentMouseMove);
    this.addGlobalListener(document, 'mouseup', this.onDocumentMouseUp);

    event.preventDefault(); // Prevent default browser drag behavior
  }

  // Global mousemove listener (while dragging)
  onDocumentMouseMove = (event: MouseEvent) => {
    // Use arrow function for `this` context
    if (this.isDragging) {
      this.performSeek(event);
      this.resetControlsTimeout(); // Keep controls visible during drag
    }
  };

  // Global mouseup listener (ends dragging)
  onDocumentMouseUp = () => {
    // Use arrow function for `this` context
    if (this.isDragging) {
      this.isDragging = false;
      // Resume play if it was playing before drag started
      if (this.wasPlayingBeforeDrag) {
        this.videoElementRef.nativeElement
          .play()
          .catch((e) => console.error('Error resuming play after drag:', e));
      }
      this.resetControlsTimeout(); // Hide controls after drag if playing
    }
    // Remove global listeners
    this.removeGlobalListeners(); // Call the centralized remover
  };

  // Optional: Handle mouse leave from progress bar during a drag
  onProgressBarMouseLeave(event?: MouseEvent) {
    // If not dragging, we don't need to do anything special here.
    // The main mouseleave on video-player-container will handle controls visibility.
  }

  // --- End Playback / Seeking Logic ---

  formatTime(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds)) {
      return '00:00';
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  }

  getBufferedRangesArray(): { start: number; end: number }[] {
    const ranges: { start: number; end: number }[] = [];
    if (this.bufferedRanges) {
      for (let i = 0; i < this.bufferedRanges.length; i++) {
        ranges.push({
          start: this.bufferedRanges.start(i),
          end: this.bufferedRanges.end(i),
        });
      }
    }
    return ranges;
  }

  /**
   * Cleans up all MediaSource related objects and event listeners.
   * This is critical for preventing memory leaks and ensuring proper state resets.
   */
  private cleanupMediaSource() {
    const videoEl = this.videoElementRef.nativeElement;

    // Remove all video element listeners
    this.videoElementListeners.forEach((listener, eventType) => {
      videoEl.removeEventListener(eventType, listener);
    });
    this.videoElementListeners.clear();

    // Remove all source buffer listeners
    if (this.sourceBuffer) {
      this.sourceBufferListeners.forEach((listener, eventType) => {
        this.sourceBuffer?.removeEventListener(eventType, listener);
      });
      this.sourceBufferListeners.clear();
      // Attempt to abort any pending operations if mediaSource is open
      if (this.sourceBuffer.updating) {
        try {
          this.sourceBuffer.abort();
          console.log('SourceBuffer aborted during cleanup.');
        } catch (e) {
          console.warn('Error aborting SourceBuffer during cleanup:', e);
        }
      }
    }

    // Remove all media source listeners
    if (this.mediaSource) {
      this.mediaSourceListeners.forEach((listener, eventType) => {
        this.mediaSource?.removeEventListener(eventType, listener);
      });
      this.mediaSourceListeners.clear();

      try {
        if (this.sourceBuffer && this.mediaSource.readyState === 'open') {
          // It's generally safer to remove source buffers if mediaSource is open
          // and the buffer is not updating. If it is updating, abort first.
          if (!this.sourceBuffer.updating) {
            this.mediaSource.removeSourceBuffer(this.sourceBuffer);
            console.log('SourceBuffer removed during cleanup.');
          } else {
            console.warn(
              'SourceBuffer still updating during cleanup, removal might fail.'
            );
            // This case should ideally be handled by the abort() call above.
          }
        }
        if (this.mediaSource.readyState === 'open') {
          this.mediaSource.endOfStream();
          console.log('MediaSource ended during cleanup.');
        }
      } catch (e) {
        console.warn('Error during MediaSource cleanup:', e);
      } finally {
        this.mediaSource = null;
        this.sourceBuffer = null;
      }
    }

    // Revoke the object URL
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }

    // Reset video element src and state
    if (videoEl.src) {
      videoEl.removeAttribute('src');
      videoEl.load(); // Call load() to reset the media element
    }

    this.isPlaying = false;
    this.currentTime = 0;
    this.totalDuration = 0;
    this.bufferedRanges = null;
    this.isSourceBufferUpdating = false;
    this.isFetchingData = false;
  }

  private addVideoEventListener(eventType: string, listener: EventListener) {
    const videoEl = this.videoElementRef.nativeElement;
    // Remove existing listener for this type before adding, to prevent duplicates
    const existingListener = this.videoElementListeners.get(eventType);
    if (existingListener) {
      videoEl.removeEventListener(eventType, existingListener);
    }
    videoEl.addEventListener(eventType, listener);
    this.videoElementListeners.set(eventType, listener);
  }

  private addMediaSourceListener(eventType: string, listener: EventListener) {
    if (this.mediaSource) {
      // Remove existing listener for this type before adding
      const existingListener = this.mediaSourceListeners.get(eventType);
      if (existingListener) {
        this.mediaSource.removeEventListener(eventType, existingListener);
      }
      this.mediaSource.addEventListener(eventType, listener);
      this.mediaSourceListeners.set(eventType, listener);
    }
  }

  private addSourceBufferListener(eventType: string, listener: EventListener) {
    if (this.sourceBuffer) {
      // Remove existing listener for this type before adding
      const existingListener = this.sourceBufferListeners.get(eventType);
      if (existingListener) {
        this.sourceBuffer.removeEventListener(eventType, existingListener);
      }
      this.sourceBuffer.addEventListener(eventType, listener);
      this.sourceBufferListeners.set(eventType, listener);
    }
  }

  /**
   * Initializes or re-initializes the video player based on the current `video` input.
   */
  private async loadVideo() {
    this.cleanupMediaSource(); // Clean up any previous video first

    const videoEl = this.videoElementRef.nativeElement;

    // Restore volume from local storage
    const storedVolume = localStorage.getItem('playerVolume');
    if (storedVolume !== null) {
      this.volume = parseFloat(storedVolume);
      videoEl.volume = this.volume;
    } else {
      videoEl.volume = this.volume;
    }
    this.isMuted = videoEl.muted;

    this.showControls = !this.isPlaying; // Initially show controls if not playing
    this.resetControlsTimeout();

    if (
      !this.video ||
      !this.video.videoId ||
      this.video.durationSeconds === undefined ||
      this.video.durationSeconds === null
    ) {
      console.warn(
        'No video, videoId, or durationSeconds provided. Player will be empty.'
      );
      videoEl.removeAttribute('src');
      videoEl.load();
      return;
    }

    // Set totalDuration from input video data initially
    this.totalDuration = this.video.durationSeconds;

    const streamUrl = this.videoApiService.getStreamUrl(this.video.videoId);
    const mimeType = this.video?.mimeType || this.getMimeType(streamUrl);

    // Set up common video event listeners (outside Angular's zone for performance)
    this.ngZone.runOutsideAngular(() => {
      this.addVideoEventListener('timeupdate', () => {
        this.ngZone.run(() => {
          this.currentTime = videoEl.currentTime;
        });
        // Check buffer and fetch more data if needed
        this.checkBufferAndFetchMore();
        this.resetControlsTimeout();
      });
      this.addVideoEventListener('progress', () => {
        this.ngZone.run(() => {
          this.bufferedRanges = videoEl.buffered;
        });
      });
      this.addVideoEventListener('durationchange', () => {
        this.ngZone.run(() => {
          this.totalDuration =
            videoEl.duration || this.video?.durationSeconds || 0;
          console.log(
            `Video duration changed to: ${this.totalDuration.toFixed(2)}s`
          );
        });
      });
      this.addVideoEventListener('volumechange', () => {
        this.ngZone.run(() => {
          this.volume = videoEl.volume;
          this.isMuted = videoEl.muted;
        });
      });
      this.addVideoEventListener('playing', () => {
        this.ngZone.run(() => {
          this.isPlaying = true;
          this.resetControlsTimeout();
          // Ensure we start fetching if needed when playback begins
          this.checkBufferAndFetchMore();
        });
      });
      this.addVideoEventListener('pause', () => {
        this.ngZone.run(() => {
          this.isPlaying = false;
          this.resetControlsTimeout(); // Ensure controls are shown on pause
        });
      });
      this.addVideoEventListener('ended', () => {
        this.ngZone.run(() => {
          this.isPlaying = false;
          this.currentTime = 0; // Reset to start
          this.showControls = true; // Show controls at end
        });
      });
      this.addVideoEventListener('seeking', () => {
        this.ngZone.run(() => {
          console.log('Video is seeking...');
          // Optional: Show a "seeking" spinner/indicator
        });
      });
      this.addVideoEventListener('seeked', () => {
        this.ngZone.run(() => {
          console.log('Video has seeked to:', videoEl.currentTime.toFixed(2));
          this.currentTime = videoEl.currentTime; // Ensure scrubber is precisely updated after seek
          // After seeking, always check buffer to ensure continuity
          this.checkBufferAndFetchMore();
          // Optional: Hide seeking indicator
        });
      });
    });

    // Add fullscreen listeners to document (only once per component instance)
    // Using Renderer2 for safe global listener management
    this.addGlobalListener(
      document,
      'fullscreenchange',
      this.onFullScreenChange
    );
    this.addGlobalListener(
      document,
      'webkitfullscreenchange',
      this.onFullScreenChange
    );
    this.addGlobalListener(
      document,
      'mozfullscreenchange',
      this.onFullScreenChange
    );
    this.addGlobalListener(
      document,
      'MSFullscreenChange',
      this.onFullScreenChange
    );

    // Attempt MediaSource setup
    try {
      if (!mimeType || !MediaSource.isTypeSupported(mimeType)) {
        console.error(
          `Unsupported or missing MIME type: '${mimeType}'. Falling back to direct URL.`
        );
        this.setVideoSrcDirect(videoEl, streamUrl);
        return;
      }

      this.mediaSource = new MediaSource();
      this.addMediaSourceListener('error', (e) => {
        console.error('MediaSource error event:', e);
        this.setVideoSrcDirect(videoEl, streamUrl); // Fallback on MSE error
      });
      this.addMediaSourceListener('sourceopen', () =>
        this.onSourceOpen(mimeType, streamUrl)
      );
      this.addMediaSourceListener('sourceended', () =>
        console.log('MediaSource ended')
      );
      this.addMediaSourceListener('sourceclose', () =>
        console.log('MediaSource closed')
      );

      this.objectUrl = URL.createObjectURL(this.mediaSource);
      videoEl.src = this.objectUrl;
      videoEl.load(); // Start loading the MSE video
    } catch (error) {
      console.error('Failed to initialize MediaSource. Falling back.', error);
      this.setVideoSrcDirect(videoEl, streamUrl);
    }
  }

  /**
   * Falls back to setting the video src directly if MSE is not supported or fails.
   */
  private setVideoSrcDirect(videoEl: HTMLVideoElement, url: string) {
    console.log('Using direct video src fallback:', url);
    this.cleanupMediaSource(); // Ensure MSE specific resources are cleaned up
    videoEl.src = url;
    videoEl.load();
    this.isPlaying = false;
    // For direct src, let the video element determine the duration
    this.addVideoEventListener('loadedmetadata', () => {
      this.ngZone.run(() => {
        this.totalDuration = videoEl.duration || 0;
        console.log(
          `Direct video duration loaded: ${this.totalDuration.toFixed(2)}s`
        );
      });
    });
    this.currentTime = 0;
    this.bufferedRanges = null;
  }

  /**
   * Attempts to guess the MIME type based on the URL.
   * In a real application, this should come from a server or be more robust.
   */
  private getMimeType(url: string): string | undefined {
    if (url.includes('.mp4'))
      return 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
    if (url.includes('.webm')) return 'video/webm; codecs="vp8, vorbis"';
    if (url.includes('.m3u8')) return 'application/x-mpegURL'; // For HLS
    if (url.includes('.mpd')) return 'application/dash+xml'; // For DASH
    // Fallback if no specific extension
    console.warn('Could not reliably guess MIME type from URL:', url);
    return 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'; // A common default
  }

  /**
   * Handler for the `sourceopen` event of MediaSource.
   */
  private onSourceOpen(mimeType: string, url: string) {
    if (!this.mediaSource || this.mediaSource.readyState !== 'open') {
      console.error(
        'MediaSource not open when sourceopen event fired, or already closed.'
      );
      this.setVideoSrcDirect(this.videoElementRef.nativeElement, url); // Fallback
      return;
    }

    // Set MediaSource duration if available from video data
    if (
      this.video &&
      this.video.durationSeconds !== undefined &&
      this.video.durationSeconds > 0
    ) {
      try {
        this.mediaSource.duration = this.video.durationSeconds;
        console.log(
          `MediaSource duration set to: ${this.video.durationSeconds.toFixed(
            2
          )}s`
        );
      } catch (e) {
        console.warn('Could not set MediaSource duration:', e);
      }
    } else {
      console.warn(
        'Video durationSeconds not available or zero. MediaSource duration not explicitly set.'
      );
    }

    try {
      this.sourceBuffer = this.mediaSource.addSourceBuffer(mimeType);

      // Add SourceBuffer listeners
      this.addSourceBufferListener('updateend', () => {
        this.ngZone.run(() => {
          this.isSourceBufferUpdating = false; // Clear updating flag
          this.bufferedRanges = this.sourceBuffer!.buffered; // Update buffered ranges
        });
        // After an update, check if more data is needed
        this.checkBufferAndFetchMore();
      });
      this.addSourceBufferListener('error', (e) => {
        console.error('SourceBuffer error event:', e);
        if (this.mediaSource && this.mediaSource.readyState === 'open') {
          try {
            this.mediaSource.endOfStream('decode'); // Indicate a decode error
          } catch (err) {
            console.warn(
              'Failed to end media source on SourceBuffer error:',
              err
            );
          }
        }
        this.setVideoSrcDirect(this.videoElementRef.nativeElement, url); // Fallback
      });
      this.addSourceBufferListener('abort', (e) => {
        console.warn('SourceBuffer abort event:', e);
        this.ngZone.run(() => {
          this.isSourceBufferUpdating = false;
        });
        // After an abort, re-evaluate buffer state
        this.checkBufferAndFetchMore();
      });

      // Start fetching initial data if playback is not already active
      // or if it's the first load
      this.checkBufferAndFetchMore();
    } catch (e) {
      console.error('Error adding source buffer:', e);
      this.setVideoSrcDirect(this.videoElementRef.nativeElement, url); // Fallback
    }
  }

  /**
   * Determines if more data needs to be fetched and triggers `fetchAndAppendVideoData`.
   * This is the core buffer management logic.
   */
  private checkBufferAndFetchMore() {
    if (
      !this.sourceBuffer ||
      !this.mediaSource ||
      this.mediaSource.readyState !== 'open' ||
      this.isSourceBufferUpdating || // Don't fetch if previous append/remove is still in progress
      this.isFetchingData // Don't fetch if a fetch is already in progress
    ) {
      return;
    }

    const videoEl = this.videoElementRef.nativeElement;
    const currentTime = videoEl.currentTime;
    const totalDuration = this.totalDuration;

    if (totalDuration === 0) {
      console.warn('Cannot check buffer: Total duration is 0.');
      return;
    }

    let maxBufferedEnd = 0;
    if (this.bufferedRanges) {
      for (let i = 0; i < this.bufferedRanges.length; i++) {
        maxBufferedEnd = Math.max(maxBufferedEnd, this.bufferedRanges.end(i));
      }
    }

    const bufferAhead = maxBufferedEnd - currentTime;

    // Condition to fetch more data:
    // 1. If buffer is critically low OR
    // 2. If playing and buffer is below preferred length AND
    // 3. We haven't buffered up to the total duration yet
    const shouldFetch =
      (bufferAhead < 5 || // Critically low buffer (e.g., less than 5 seconds)
        (this.isPlaying && bufferAhead < this.PREFERRED_BUFFER_LENGTH_SEC)) &&
      maxBufferedEnd < totalDuration;

    if (shouldFetch) {
      console.log(
        `Buffer ahead: ${bufferAhead.toFixed(2)}s. Fetching more data...`
      );
      this.isFetchingData = true; // Set flag to prevent concurrent fetches
      this.fetchAndAppendVideoData(
        this.videoApiService.getStreamUrl(this.video!.videoId),
        maxBufferedEnd // Start fetching from the end of the current buffer
      ).finally(() => {
        this.isFetchingData = false; // Clear flag when fetch completes/fails
      });
    } else if (
      maxBufferedEnd >= totalDuration &&
      this.mediaSource.readyState === 'open'
    ) {
      // FIX: Use this.mediaSource instead of msLocal
      // If we've buffered up to the declared total duration and mediaSource is open,
      // it's safe to signal endOfStream.
      try {
        this.mediaSource.endOfStream();
        console.log('MediaSource ended: All data buffered.');
      } catch (e) {
        console.warn('Error ending MediaSource stream:', e);
      }
    }
  }

  /**
   * Fetches video data in chunks and appends it to the SourceBuffer.
   * Implements basic streaming logic.
   * @param url The URL to fetch video data from.
   * @param startByte The byte range to start fetching from (for partial content requests).
   */
  private async fetchAndAppendVideoData(
    url: string,
    startFromTime: number = 0
  ) {
    if (
      !this.sourceBuffer ||
      !this.mediaSource ||
      this.mediaSource.readyState !== 'open'
    ) {
      console.warn(
        'Cannot fetch and append: SourceBuffer/MediaSource not ready.'
      );
      return;
    }

    const sbLocal = this.sourceBuffer;
    const msLocal = this.mediaSource; // Keep msLocal for local scope if needed, though this.mediaSource is available.

    try {
      // Determine the range to request. This is a simplification.
      // In a real streaming scenario (e.g., DASH/HLS), you'd fetch segments.
      // Here, we'll request a chunk based on time, hoping the server supports byte range requests
      // mapping to temporal ranges.
      const startOffset = Math.floor(startFromTime); // Start fetching from this time point

      const response = await fetch(url, {
        headers: {
          Range: `bytes=${startOffset}-`, // Request from startOffset to end of stream
          // You might need a more sophisticated range strategy for actual segments
        },
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error fetching video: ${response.status} ${response.statusText}`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error(
          'ReadableStream not supported or response body is null.'
        );
      }

      let offset = startOffset; // Keep track of the current byte offset for console logging
      const readChunk = async (): Promise<void> => {
        const { done, value } = await reader.read();

        if (done) {
          console.log('Finished fetching all chunks.');
          if (msLocal.readyState === 'open') {
            try {
              msLocal.endOfStream(); // Signal that no more data will be appended
            } catch (e) {
              console.warn(
                'Failed to end media source stream on fetch completion:',
                e
              );
            }
          }
          return;
        }

        if (value) {
          try {
            await this.appendBufferInternal(value);
            offset += value.byteLength;
            // No explicit pruning in this loop; `checkBufferAndFetchMore` and `appendBufferInternal` handle it.
            // The `updateend` listener of SourceBuffer will trigger `checkBufferAndFetchMore` again.
          } catch (e) {
            console.error('Error appending buffer during fetch process:', e);
            if (msLocal.readyState === 'open') {
              try {
                msLocal.endOfStream('decode'); // Indicate a decode error
              } catch (err) {
                console.warn(
                  'Failed to end media source on append error (during fetch):',
                  err
                );
              }
            }
            throw e; // Re-throw to stop further chunk reading
          }
        }
        return readChunk(); // Read next chunk recursively
      };

      await readChunk();
    } catch (error) {
      console.error('Error fetching or processing video data stream:', error);
      if (msLocal.readyState === 'open') {
        try {
          msLocal.endOfStream('network'); // Indicate network error
        } catch (e) {
          console.warn('Failed to end media source on network error:', e);
        }
      }
      this.setVideoSrcDirect(this.videoElementRef.nativeElement, url); // Fallback on severe fetch error
    }
  }

  /**
   * Internal method to handle `appendBuffer` operations, including waiting for `updateend`
   * and handling `QuotaExceededError` with retries and pruning.
   */
  private async appendBufferInternal(
    chunk: Uint8Array,
    retryCount = 0
  ): Promise<void> {
    if (!this.sourceBuffer || this.mediaSource?.readyState !== 'open') {
      console.warn(
        'Cannot append: SourceBuffer/MediaSource not ready. State:',
        this.mediaSource?.readyState,
        'SourceBuffer:',
        this.sourceBuffer
      );
      return Promise.reject('SourceBuffer/MediaSource not ready to append.');
    }

    if (this.sourceBuffer.updating) {
      console.warn('SourceBuffer is already updating, waiting before append.');
      await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay
      return this.appendBufferInternal(chunk, retryCount); // Retry after delay
    }

    this.isSourceBufferUpdating = true; // Set updating flag
    return new Promise((resolve, reject) => {
      const sb = this.sourceBuffer!;
      const onUpdateEnd = () => {
        sb.removeEventListener('updateend', onUpdateEnd);
        sb.removeEventListener('error', onError);
        sb.removeEventListener('abort', onAbort); // Ensure abort listener is also removed
        this.ngZone.run(() => {
          this.isSourceBufferUpdating = false;
        }); // Clear flag
        resolve();
      };
      const onError = (e: any) => {
        sb.removeEventListener('updateend', onUpdateEnd);
        sb.removeEventListener('error', onError);
        sb.removeEventListener('abort', onAbort);
        this.ngZone.run(() => {
          this.isSourceBufferUpdating = false;
        }); // Clear flag
        reject(e);
      };
      const onAbort = (e: any) => {
        sb.removeEventListener('updateend', onUpdateEnd);
        sb.removeEventListener('error', onError);
        sb.removeEventListener('abort', onAbort);
        this.ngZone.run(() => {
          this.isSourceBufferUpdating = false;
        }); // Clear flag
        reject(new Error('SourceBuffer aborted during append.'));
      };

      sb.addEventListener('updateend', onUpdateEnd);
      sb.addEventListener('error', onError);
      sb.addEventListener('abort', onAbort);

      try {
        sb.appendBuffer(chunk);
      } catch (e: any) {
        // Remove listeners immediately on sync error to avoid memory leaks
        sb.removeEventListener('updateend', onUpdateEnd);
        sb.removeEventListener('error', onError);
        sb.removeEventListener('abort', onAbort);
        this.ngZone.run(() => {
          this.isSourceBufferUpdating = false;
        }); // Clear flag immediately on sync error

        if (e.name === 'QuotaExceededError') {
          console.warn(
            `QuotaExceededError during append (attempt ${
              retryCount + 1
            }). Attempting prune.`
          );
          if (retryCount < this.MAX_RETRY_APPEND_ATTEMPTS) {
            this.pruneBuffer()
              .then((pruned) => {
                if (pruned) {
                  console.log('Buffer pruned. Retrying append.');
                  // Retry append after pruning. Important to await this.
                  this.appendBufferInternal(chunk, retryCount + 1)
                    .then(resolve)
                    .catch(reject);
                } else {
                  console.warn('Pruning did not free up space. Cannot append.');
                  reject(e); // Re-throw original error if prune fails
                }
              })
              .catch((pruneErr) => {
                console.error(
                  'Error during prune after QuotaExceededError:',
                  pruneErr
                );
                reject(e); // Propagate original error if prune also fails
              });
          } else {
            console.error(
              `QuotaExceededError after ${this.MAX_RETRY_APPEND_ATTEMPTS} retries. Giving up.`
            );
            reject(e);
          }
        } else {
          console.error('Unexpected error during appendBuffer:', e);
          reject(e);
        }
      }
    });
  }

  /**
   * Prunes old, played-back segments from the SourceBuffer to free up memory.
   * @returns Promise<boolean> True if any segment was removed, false otherwise.
   */
  private async pruneBuffer(): Promise<boolean> {
    if (
      !this.sourceBuffer ||
      this.sourceBuffer.updating ||
      this.mediaSource?.readyState !== 'open'
    ) {
      console.warn(
        'Cannot prune buffer: SourceBuffer not ready, updating, or MediaSource not open.'
      );
      return false;
    }

    const sb = this.sourceBuffer;
    const videoEl = this.videoElementRef.nativeElement;
    const currentTime = videoEl.currentTime;
    let didRemove = false;

    // Iterate through buffered ranges and remove those sufficiently behind the playhead
    for (let i = 0; i < sb.buffered.length; i++) {
      const start = sb.buffered.start(i);
      const end = sb.buffered.end(i);

      // Only consider removing segments that are entirely behind the current time
      // plus a small buffer to prevent jank.
      if (end < currentTime - this.MIN_BUFFER_BEHIND_SEC) {
        try {
          console.log(
            `Pruning buffered range: [${start.toFixed(2)}, ${end.toFixed(2)}]`
          );
          this.isSourceBufferUpdating = true; // Set flag before removal
          sb.remove(start, end);
          await new Promise<void>((resolve, reject) => {
            const onUpdateEnd = () => {
              sb.removeEventListener('updateend', onUpdateEnd);
              sb.removeEventListener('error', onError);
              sb.removeEventListener('abort', onAbort);
              resolve();
            };
            const onError = (e: any) => {
              sb.removeEventListener('updateend', onUpdateEnd);
              sb.removeEventListener('error', onError);
              sb.removeEventListener('abort', onAbort);
              reject(e);
            };
            const onAbort = (e: any) => {
              sb.removeEventListener('updateend', onUpdateEnd);
              sb.removeEventListener('error', onError);
              sb.removeEventListener('abort', onAbort);
              reject(new Error('SourceBuffer aborted during prune removal.'));
            };
            sb.addEventListener('updateend', onUpdateEnd);
            sb.addEventListener('error', onError);
            sb.addEventListener('abort', onAbort);
          });
          didRemove = true;
          this.ngZone.run(() => {
            this.isSourceBufferUpdating = false;
          }); // Clear flag after successful remove
        } catch (e) {
          console.warn(
            `Error removing buffer range [${start.toFixed(2)}, ${end.toFixed(
              2
            )}] during pruning:`,
            e
          );
          this.ngZone.run(() => {
            this.isSourceBufferUpdating = false;
          });
          // If removal fails, we might be stuck, consider more drastic fallback
          break; // Stop trying to prune if one fails
        }
      }
    }
    return didRemove;
  }
}

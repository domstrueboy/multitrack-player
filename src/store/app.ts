import { defineStore } from 'pinia';
import { reactive } from 'vue';
import type Track from '../Track';
import type { TPlayingState } from '../types';
import { useSettingsStore } from './settings';
import {
  clickEventLoop,
  setClickEventLoopCount,
  getClickBeats,
  getClickInterval
} from '@/click';

import {
  tracksAudioContext,
  newTrack,
  setTrackGain,
  playTracks
} from '@/tracks';

type TApp = {
  playState: TPlayingState,
  playPosition: number,
  tracks: Track[],
  clickActive: boolean,
  clickBpm: number,
  soloTrack: unknown,
  dialog: unknown,
  loading: boolean,
  clickTimeSignature: {
    beats: number,
    unit: number,
  },
  controlEditMode: unknown,
  controlEditSelected: unknown,
}

let eventLoopStart = tracksAudioContext.currentTime;
let trackEventLoopCount = 0;

export const useAppStore = defineStore('app', {
  state: () => <TApp>({
    playState: 'stopped',
    playPosition: 0,
    tracks: [],
    clickActive: false,
    clickBpm: 102,
    soloTrack: null,
    dialog: null,
    loading: true,
    clickTimeSignature: reactive({
      beats: 4,
      unit: 4
    }),
    controlEditMode: null,
    controlEditSelected: null,
  }),
    
  getters: {
    getTrack(state: TApp) {
      return (track: Track) => state.tracks.find(_ => _ === track);
    },

    playBeatsPosition(state: TApp) {
      return getClickBeats(state);
    }
  },

  actions: {
    setLoading(value: boolean): void {
      this.loading = value;
    },
  
    playPause(): void {
      const newState: TPlayingState = 'playing';
      this.playState = newState;
      if (tracksAudioContext.state === 'suspended') {
        tracksAudioContext.resume();
      }
      if (newState === 'playing') {
        eventLoopStart = tracksAudioContext.currentTime;
        trackEventLoopCount = 0;
        playTracks(this.tracks, this.playPosition);
      } else {
        this.tracks.forEach(track => track.pause());
      }
    },
  
    playAt(playPosition: number): void {
      this.playPosition = playPosition;
      setClickEventLoopCount(
        Math.floor(playPosition / getClickInterval(this))
      );
      playTracks(this.tracks, this.playPosition);
    },
  
    stop(): void {
      if (this.playState === 'playing') {
        this.tracks.forEach(track => track.stop());
      }
      this.playState = 'stopped';
      this.playPosition = 0;
      setClickEventLoopCount(0);
      this.tracks.forEach(track => track.eventLoop(this.playPosition));
    },
  
    addTrack({ name, arrayBuffer }: { name: string, arrayBuffer: ArrayBuffer }): void {
      this.tracks.push(newTrack({ name, arrayBuffer }));
    },
  
    removeTrack(track: Track): void {
      this.tracks.splice(this.tracks.indexOf(track), 1);
    },
  
    toggleClickActive(): void {
      this.clickActive = !this.clickActive;
    },
  
    setTrackGainValue({ track, value }: { track: Track, value: number }): void {
      track.gainValue = value;
      const settings = useSettingsStore();
      setTrackGain(track, settings, this);
    },
  
    setTrackActive({ track, value }: { track: Track, value: boolean }): void {
      track.active = value;
      const settings = useSettingsStore();
      setTrackGain(track, settings, this);
    },
  
    setSoloTrack(track: Track): void {
      this.soloTrack = track;
      const settings = useSettingsStore();
      this.tracks.forEach(track => setTrackGain(track, settings, this));
    },
  
    toggleSettingsDialog(): void {
      this.dialog = this.dialog === 'settings' ? null : 'settings';
    },
  
    toggleAboutDialog(): void {
      this.dialog = this.dialog === 'about' ? null : 'about';
    },
  
    setClickBpm(value: number): void {
      this.clickBpm = value;
    },
  
    setClickTimeSignature(value: { beats: number, unit: number }): void {
      this.clickTimeSignature = value;
    },
  
    toggleControlEditMode(): void {
      this.controlEditMode = !this.controlEditMode;
      this.dialog = null;
    },
  
    setControlEditSelected(value: unknown): void {
      this.controlEditSelected = value;
    },
  
    setPlayPosition(value: number): void {
      this.playPosition = value;
    },
  }
})


const trackEventLoopInterval = 0.01;

setTimeout(() => {
  const store = useAppStore();

  setInterval(() => {
    if (store.playState === 'playing') {
      const trackDelta = tracksAudioContext.currentTime - eventLoopStart;
      if (trackDelta / trackEventLoopCount > trackEventLoopInterval) {
        trackEventLoop();
        trackEventLoopCount++;
      }

      clickEventLoop(store);
    }
  }, 1);

  function trackEventLoop() {
    store.setPlayPosition(store.playPosition + trackEventLoopInterval);
    store.tracks.forEach(track =>
      track.eventLoop(store.playPosition)
    );
  }
}, 1000);

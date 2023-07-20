import { defineStore } from 'pinia';
import type Track from '../Track';
import type { TPlayingState } from '../types';

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
    clickTimeSignature: {
      beats: 4,
      unit: 4
    },
    controlEditMode: null,
    controlEditSelected: null,
  }),
  getters: {
    getTrack(state) {
      return (track: any) => state.tracks.find(_ => _ === track);
    },
    playBeatsPosition(state) {
      return getClickBeats(state);
    }
  },
  actions: {
    setPlayState(value: TPlayingState): void {
      this.playState = value;
    },

    addTrackMutation(track: Track): void {
      this.tracks.push(track);
    },

    removeTrackMutation(track: Track): void {
      this.tracks.splice(this.tracks.indexOf(track), 1);
    },

    setClickActive(value: boolean) {
      this.clickActive = value;
    },

    setPlayPositionMutation(value: number): void {
      this.playPosition = value;
    },

    setTrackActiveMutation({ track, value }: { track: Track, value: boolean }): void {
      track.active = value;
    },

    setSoloTrackMutation(track: Track): void {
      this.soloTrack = track;
    },

    setDialog(dialog: unknown): void {
      this.dialog = dialog;
    },

    setClickBpmMutation(value: number): void {
      this.clickBpm = value;
    },

    setLoading(value: boolean): void {
      this.loading = value;
    },

    setClickTimeSignatureMutation(value: { beats: number, unit: number }): void {
      this.clickTimeSignature = value;
    },
    
    setControlEditMode(value: unknown): void {
      this.controlEditMode = value;
    },

    setControlEditSelectedMutation(value: unknown): void {
      this.controlEditSelected = value;
    },

    playPause(): void {
      const newState: TPlayingState = 'playing';
      this.setPlayState(newState);
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
      this.setPlayPositionMutation(playPosition);
      setClickEventLoopCount(
        Math.floor(playPosition / getClickInterval(this))
      );
      playTracks(this.tracks, this.playPosition);
    },

    stop(): void {
      if (this.playState === 'playing') {
        this.tracks.forEach(track => track.stop());
      }
      this.setPlayState('stopped');
      this.setPlayPositionMutation(0);
      setClickEventLoopCount(0);
      this.tracks.forEach(track => track.eventLoop(this.playPosition));
    },

    addTrack({ name, arrayBuffer }: { name: string, arrayBuffer: ArrayBuffer }): void {
      this.addTrackMutation(newTrack({ name, arrayBuffer }));
    },

    removeTrack(track: Track): void {
      this.removeTrackMutation(track);
    },

    toggleClickActive(): void {
      this.setClickActive(!this.clickActive);
    },

    setTrackGainValue({ track, value }: { track: Track, value: number }): void {
      track.gainValue = value;
      setTrackGain(track, this.settings, this);
    },

    setTrackActive({ track, value }: { track: Track, value: boolean }): void {
      this.setTrackActiveMutation({ track, value });
      setTrackGain(track, this.settings, this);
    },

    setSoloTrack(track: Track): void {
      this.setSoloTrackMutation(track);
      this.tracks.forEach(track => setTrackGain(track, this.settings, this));
    },

    toggleSettingsDialog(): void {
      this.setDialog(this.dialog === 'settings' ? null : 'settings');
    },

    toggleAboutDialog(): void {
      this.setDialog(this.dialog === 'about' ? null : 'about');
    },

    setClickBpm(value: number): void {
      this.setClickBpmMutation(value);
    },

    setClickTimeSignature(value: { beats: number, unit: number }): void {
      this.setClickTimeSignatureMutation(value);
    },

    toggleControlEditMode(): void {
      this.setControlEditMode(!this.controlEditMode);
      this.setDialog(null);
    },

    setControlEditSelected(value: unknown): void {
      this.setControlEditSelectedMutation(value);
    },

    setPlayPosition(value: number): void {
      this.setPlayPositionMutation(value);
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

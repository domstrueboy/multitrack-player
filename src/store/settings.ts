import { defineStore } from 'pinia';
import { setClickPan, setClickGain } from '@/click';
import { initMidiEvents } from '@/midi';
import { setTrackGain, tracksStereoPannerNode } from '@/tracks';
import { set, get } from '@/database';
import { useAppStore } from './app';

type TTypeValue = { type: string, value: unknown }

type TSettings = {
  trackPanning: number,
  clickPanning: number,
  midiDeviceName: string | null,
  clickGainValue: number,
  trackGainValue: number,
  /**
   * { [actionName]: { type: 'note' | 'controlChange' | 'key', value: any } }
   */
  controlEditMap: Record<string, TTypeValue>,
}

export const useSettingsStore = defineStore('settings', {
  state: () => <TSettings>({
    trackPanning: 0,
    clickPanning: 0,
    midiDeviceName: null,
    clickGainValue: 1,
    trackGainValue: 1,
    /**
     * { [actionName]: { type: 'note' | 'controlChange' | 'key', value: any } }
     */
    controlEditMap: {},
  }),

  getters: {
    getControlMapping(state) {
      return (controlName: string | number) => state.controlEditMap[controlName];
    },
  },

  actions: {
    setMasterTrackGainValue(value: number): void {
      this.trackPanning = value;
      const app = useAppStore();
      app.tracks.forEach(track => setTrackGain(track, this, app));
      saveSettings();
    },

    setTrackPanning(value: number): void {
      this.trackPanning = value;
      tracksStereoPannerNode.pan.value = value;
      saveSettings();
    },

    setClickPanning(value: number): void {
      this.clickPanning = value;
      setClickPan(value);
      saveSettings();
    },

    setMidiDeviceName(value: string): void {
      this.midiDeviceName = value;
      const app = useAppStore();
      initMidiEvents(value, app);
      saveSettings();
    },

    setControlEdit({ type, value }: { type: string, value: TTypeValue }): void {
      const app = useAppStore();
      this.controlEditMap[app.controlEditSelected] = { type, value };
      saveSettings();
    },

    setClickGainValue(value: number): void {
      this.clickGainValue = value;
      setClickGain(value);
      saveSettings();
    },

    triggerControlAction(eventValue: TTypeValue): void {
      Object.entries(this.controlEditMap).find(([action, mapValue]: [string, TTypeValue]) => {
        if (
          mapValue.type === eventValue.type &&
          mapValue.value === eventValue.value
        ) {
          this[action]();
        }
      });
    },

    async initSettings() {
      const app = useAppStore();
      const settings = await get('settings');
      Object.assign(this, settings);
      if (this.midiDeviceName) {
        initMidiEvents(this.midiDeviceName, app);
      }
    },
  }
});

function saveSettings() {
  set('settings', store.state);
}

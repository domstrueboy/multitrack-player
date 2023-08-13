<template>
  <VDialog v-model="dialog" max-width="400">
    <VCard>
      <VCardTitle>Settings</VCardTitle>
      <VCardText>
        <VForm>
          <VSelect
            :items="outputs"
            v-model="trackPanning"
            label="Track output"
          />
          <VSelect
            :items="outputs"
            v-model="clickPanning"
            label="Click output"
          />

          <VSlider
            label="Track volume"
            hide-details
            v-model="trackGain"
            min="0"
            max="2"
            step="0.01"
          />

          <VSlider
            label="Click volume"
            v-model="clickGain"
            min="0"
            max="2"
            step="0.01"
          />

          <VSelect
            :items="midiDevices"
            label="MIDI Control Device"
            v-model="midiDevice"
          />

          <VLabel>Edit MIDI and key mapping</VLabel>
          <VRow class="mt-2 ml-1">
            <VBtn
              class="mr-4"
              size="small"
              variant="outlined"
              @click="app.toggleControlEditMode()"
              >MIDI</VBtn
            >
            <VBtn
              size="small"
              variant="outlined"
              @click="app.toggleControlEditMode()"
              >Key</VBtn
            >
          </VRow>
        </VForm>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="dialog = false" color="primary">OK</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script>
import { inputs } from '../midi';
import { useAppStore } from '@/store/app';
import { useSettingsStore } from '@/store/settings';

export default {
  setup() {
    const app = useAppStore();
    const settings = useSettingsStore();
    return { app, settings };
  },
  data() {
    return {
      outputs: [
        { text: '1/2 (Stereo)', value: 0 },
        { text: '1 (Mono)', value: -1 },
        { text: '2 (Mono)', value: 1 }
      ],
      midiDevices: inputs().map(input => input.name)
    };
  },
  computed: {
    dialog: {
      get() {
        return this.app.dialog === 'settings';
      },
      set() {
        return this.app.toggleSettingsDialog();
      }
    },
    trackPanning: {
      get() {
        return this.settings.trackPanning;
      },
      set(value) {
        return this.app.setTrackPanning(value);
      }
    },
    clickPanning: {
      get() {
        return this.settings.clickPanning;
      },
      set(value) {
        return this.app.setClickPanning(value);
      }
    },
    clickGain: {
      get() {
        return this.settings.clickGainValue;
      },
      set(value) {
        this.app.setClickGainValue(value);
      }
    },
    trackGain: {
      get() {
        return this.settings.trackGainValue;
      },
      set(value) {
        this.app.setMasterTrackGainValue(value);
      }
    },
    midiDevice: {
      get() {
        return this.settings.midiDeviceName;
      },
      set(value) {
        this.app.setMidiDeviceName(value);
      }
    }
  }
};
</script>

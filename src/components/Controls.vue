<template v-slot:append>

    <VFileInput
      @update:modelValue="addTracks"
      :model-value="files"
      multiple
      label="Add audio files"
      accept="audio/*"
    />
    {{ files }}

    <VBtn
      v-if="controlEditMode"
      size="small"
      @click="app.toggleControlEditMode()"
      >Done mapping</VBtn
    >

    <VBtn
      icon
      @click="mapControlOrDispatchAction('playPause')"
      :title="getControlMappingName('playPause')"
      :color="app.playState === 'playing' ? 'yellow' : 'green'"
    >
      <VIcon :icon="playPauseIcon" />
    </VBtn>

    <VBtn
      icon
      @click="mapControlOrDispatchAction('stop')"
      :title="getControlMappingName('stop')"
      color="red"
      :disabled="app.playState === 'stopped'"
    >
      <VIcon icon="mdi-stop" />
    </VBtn>

    <VBtn
      icon
      :variant="app.clickActive ? 'outlined' : null"
      @click="mapControlOrDispatchAction('clickActive', 'toggleClickActive')"
      :title="getControlMappingName('clickActive')"
      :color="getControlMappingColor('clickActive')"
    >
      <VIcon icon="mdi-metronome" />
    </VBtn>

    <TextField v-model="clickBpm" class="small-input" />
    <TextField v-model="clickTimeSignatureView" class="small-input" />

    <Clock
      :values="timeValues"
      @input="setTime"
      icon="mdi-clock-outline"
      class="mr-4"
    />

    <Clock :values="beatsValues" icon="mdi-music-note" @input="setBeats" />

    <VBtn variant="text" icon @click="app.toggleSettingsDialog()">
      <VIcon icon="mdi-wrench" />
    </VBtn>

</template>

<script>
import { storeToRefs } from 'pinia';
import Clock from './Clock';
import TextField from './TextField';
import { useAppStore } from '@/store/app';
import { getClickInterval } from '../click';

export default {
  components: {
    Clock,
    TextField
  },
  setup() {
    const app = useAppStore();
    const { clickTimeSignature } = storeToRefs(app);
    return { app, clickTimeSignature };
  },
  data() {
    return {
      files: [],
    };
  },
  computed: {
    playPauseIcon() {
      return {
        playing: 'mdi-pause',
        suspended: 'mdi-play',
        stopped: 'mdi-play'
      }[this.app.playState];
    },
  
    clickBpm: {
      get() {
        return this.app.clickBpm;
      },
      set(value) {
        this.app.toggleClickActive();
        this.app.setClickBpm(value);
        this.app.toggleClickActive();
      }
    },
    clickTimeSignatureView: {
      get() {
        const beats = this.clickTimeSignature.beats;
        const unit = this.clickTimeSignature.unit;
        return `${beats}/${unit}`;
      },
      set(value) {
        const [beats, unit] = value.split('/');
        this.app.setClickTimeSignature({
          beats: Number(beats) || '',
          unit: Number(unit) || ''
        });
      }
    },
    timeValues() {
      const playPosition = this.app.playPosition;
      return [
        Math.floor(playPosition / 60),
        Math.floor(playPosition % 60),
        Math.floor((playPosition % 1) * 10)
      ];
    },
    beatsValues() {
      return this.app.playBeatsPosition;
    },
    controlEditMode() {
      return this.app.controlEditMode;
    }
  },
  methods: {
    mapControlOrDispatchAction(controlName, actionName) {
      if (!this.controlEditMode) {
        return this.app[actionName || controlName]();
      }

      this.app.setControlEditSelected(controlName);
    },
    getControlMappingName(controlName) {
      if (!this.controlEditMode) {
        return;
      }
      const controlMapping = this.app.getControlMapping(controlName);
      if (controlMapping) {
        const name =
          {
            ' ': 'Space'
          }[controlMapping.value] || controlMapping.value;
        const type = {
          key: 'Keyboard',
          note: 'Note',
          controlChange: 'Control change'
        }[controlMapping.type];
        return `${type}: ${name}`;
      }
      return '';
    },
    getControlMappingColor(controlName) {
      if (!this.controlEditMode) {
        return;
      }
      const controlMapping = this.app.getControlMapping(controlName);
      if (controlMapping) {
        return 'yellow';
      }
    },
    setTime({ values, index }) {
      let [minutes, seconds, tenths] = values;
      if (index === 0) {
        seconds = 0;
        tenths = 0;
      } else if (index === 1) {
        tenths = 0;
      }
      const playPosition = minutes * 60 + seconds + tenths / 10;
      this.app.playAt(playPosition);
    },
    setBeats({ values, index }) {
      let [bars, beats] = values;
      if (index === 0) {
        beats = 1;
      }
      const clickInterval = getClickInterval(this.app);
      const playPosition =
        bars * clickInterval * 4 + (beats - 1) * clickInterval;
      this.app.playAt(playPosition);
    },
    addTracks(files) {
      if (!files.length) {
        return;
      }

      files.forEach(file => {
        const name = file.name.substring(0, file.name.lastIndexOf('.'));
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.addEventListener('load', () => {
          this.app.addTrack({
            name,
            arrayBuffer: fileReader.result
          });
        });
      });
      this.files = [];
    },
  }
};
</script>

<style lang="scss" scoped>
.small-input {
  // max-width: 4rem;
}
</style>

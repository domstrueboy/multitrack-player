<template>
  <div>
    <VProgressLinear v-if="app.loading" indeterminate />

    <VApp v-else>
      <VAppBar>
        <Controls />
      </VAppBar>

      <VMain>
        <RouterView />
      </VMain>
    </VApp>
  </div>
</template>

<script>
import { useAppStore } from '@/store/app';
import { useSettingsStore } from '@/store/settings';
import Controls from '@/components/Controls';

import { initClick } from './click';
import { initMidi } from './midi';
import { initKeyEvents } from './key';

export default {
  components: {
    Controls,
  },

  setup() {
    const app = useAppStore();
    const settings = useSettingsStore();

    return {
      app,
      settings,
    }
  },

  async mounted() {
    await Promise.all([initMidi(), initClick()]);
    await this.settings.initSettings();
    initKeyEvents(app);

    this.app.setLoading(false);
  },

  watch: {
    'app.controlEditMode'(value) {
      this.$vuetify.theme.dark = !!value;
    }
  }
};
</script>

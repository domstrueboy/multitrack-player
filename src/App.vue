<template>
  <div>
    <VProgressLinear v-if="app.loading" indeterminate />
    <VApp v-else>
      <VAppBar height="auto" class="app-bar">
        <Controls />
      </VAppBar>

      <v-content>
        <router-view />
      </v-content>
    </VApp>
  </div>
</template>

<script>
import { useAppStore } from '@/store/app';
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

    return {
      app,
    }
  },

  async mounted() {
    await Promise.all([initMidi(), initClick()]);
    await app.initSettings();
    initKeyEvents(app);

    app.setLoading(false);
  },

  watch: {
    'app.controlEditMode'(value) {
      this.$vuetify.theme.dark = !!value;
    }
  }
};
</script>

<style lang="scss" scoped>
.app-bar {
  flex-grow: 0;
}
</style>

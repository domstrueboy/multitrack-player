<template>
  <VContainer>
    <SettingsDialog />
    <TrackManager />
  </VContainer>
</template>

<script>
import TrackManager from '@/components/TrackManager';
import SettingsDialog from '@/components/SettingsDialog';

export default {
  components: {
    TrackManager,
    SettingsDialog,
  },
  name: 'home',
  data() {
    return {
      publicPath: process.env.BASE_URL
    };
  }
};
</script>

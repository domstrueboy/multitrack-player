<template>
  <div>
    <TrackItem
      v-for="(track, index) in app.tracks"
      :track="track"
      :number="index + 1"
      :key="track.id"
    />
  </div>
</template>

<script>
import { useAppStore } from '@/store/app';
import TrackItem from './TrackItem';

export default {
  components: {
    TrackItem,
  },
  setup() {
    const app = useAppStore();
    return { app };
  },
};
</script>

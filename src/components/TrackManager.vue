<template>
  <div>
    <Track
      v-for="(track, index) in $store.state.tracks"
      :track="track"
      :number="index + 1"
      :key="track.id"
    />
  </div>
</template>

<script>
import Track from './Track';

export default {
  components: {
    Track
  },
};
</script>

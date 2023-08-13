<template>
  <VDialog v-model="dialog" max-width="400">
    <VCard>
      <VCardTitle>About</VCardTitle>
      <VCardText class="text-center">
        <p>Created by David Hulme</p>
        <p>
          <a href="https://github.com/dhulme/multitrack-player"
            >github.com/dhulme/multitrack-player</a
          ><br />
          <a href="https://dhulme.uk">dhulme.uk</a><br />
          <a href="https://twitter.com/hulmed">@hulmed</a>
        </p>
        <p>Version {{ version }}</p>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script>
import { useAppStore } from '@/store/app';

export default {
  setup() {
    const app = useAppStore();
    return { app };
  },
  data() {
    return {
      version: process.env.PACKAGE_VERSION
    };
  },
  computed: {
    dialog: {
      get() {
        return this.app.dialog === 'about';
      },
      set() {
        return this.app.toggleAboutDialog();
      }
    }
  }
};
</script>

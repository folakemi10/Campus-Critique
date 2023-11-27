<template>
  <v-snackbar v-model="snackbar" :color="color ? color : `primary-btn`" timeout="5000">
    <div class="d-flex flex-column align-center">
      <span class="white--text">{{ text }}</span>
      <v-btn variant="text" @click="snackbar = false" class="mt-2">Close</v-btn>
    </div>
  </v-snackbar>
</template>
<script setup lang="ts">
const snackbar = ref(true);
const { text, color } = defineProps(['text', 'color']);
</script>
 
<style lang="scss" scoped></style>
  
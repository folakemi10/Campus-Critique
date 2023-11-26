<template>
       <v-snackbar v-model="snackbar" color="white" timeout="5000">
          <div class="d-flex flex-column align-center">
            <span class="white--text">{{ text }}</span>
            <v-btn dark flat @click="snackbar = false" class="mt-2">Close</v-btn>
          </div>
        </v-snackbar>
  </template>
 <script setup lang="ts">
 const snackbar = ref(true);
 const { text } = defineProps(['text']);
 </script>
 
 <style lang="scss" scoped></style>
  
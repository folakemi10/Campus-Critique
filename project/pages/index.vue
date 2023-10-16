<template>
  <GlobalNav />

  <v-container v-if="!firebaseUser">
    <h1 class="text-slate-900 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-center dark:text-white">
      Welcome to Campus Critique!</h1>

    <v-btn to="/register">
      Get Started
    </v-btn>
    <v-autocomplete label="Search" placeholder="Search for a course or professor" :items="allCourses"></v-autocomplete>
  </v-container>

  <v-container v-if="firebaseUser" class="flex-vertical justify-center">
    <Card v-for="(review, index) in allPosts" :key="index" :review="review"></Card>
  </v-container>
</template>
  
<script setup lang="ts">

import { queryEntireCollection } from "~/lib/db";

const firebaseUser = useFirebaseUser();
const allPosts = ref();
const allCourses = ref();
const allProfessors = ref();

onMounted(async () => {
  allPosts.value = await queryEntireCollection('posts');
  allCourses.value = await queryEntireCollection('classes');
  allProfessors.value = await queryEntireCollection('profs');
}
);







</script>

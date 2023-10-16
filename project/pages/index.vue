<template>
  <GlobalNav />

  <v-container v-if="!firebaseUser">
    <h1 class="text-900 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-center dark:text-white">
      Welcome to Campus Critique!</h1>

    <v-btn to="/register">
      Get Started
    </v-btn>
    <v-autocomplete label="Search" placeholder="Search for a course or professor" :items="allCourses" v-model="selected"
      variant="outlined" return-object></v-autocomplete>
  </v-container>

  <v-container v-if="firebaseUser" class="flex-vertical justify-center">
    <v-autocomplete label="Search" placeholder="Search for a course or professor" :items="allCourses" v-model="selected"
      variant="outlined" return-object></v-autocomplete>
      
    <Card v-for="(review, index) in allPosts" :key="index" :review="review"></Card>
  </v-container>
</template>
  
<script setup lang="ts">

import { useRouter } from 'vue-router';
import { queryEntireCollection } from "~/lib/db";

const router = useRouter();

const firebaseUser = useFirebaseUser();
const allPosts = ref();
const allCourses = ref();
const allProfessors = ref();

const selected = ref();

onMounted(async () => {
  allPosts.value = await queryEntireCollection('posts');
  allCourses.value = await queryEntireCollection('classes');
  allProfessors.value = await queryEntireCollection('profs');
}
);



// watch works directly on a ref
watch(selected, async () => {
  await navigateTo({
    path: '/details/',
    query: {
      id: selected.value.id,
    },
    replace: true,
  })
})


</script>

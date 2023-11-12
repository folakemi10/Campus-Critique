
<template>
  <GlobalNav />
  <v-progress-circular model-value="20" indeterminate v-if="loading"></v-progress-circular>
  <v-container v-else-if="!firebaseUser">
    <h1 class="text-900 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-center dark:text-white">
      Welcome to Campus Critique!</h1>

    <v-btn color="primary-button" to="/register">
      Join Us
    </v-btn>
  </v-container>

  <v-container v-else-if="firebaseUser" class="flex-vertical justify-center">
    <Search />
    <!-- <ClientOnly> -->
    <Card v-for="(review, index) in allPosts" :key="index" :review="review" :showChangeBtns="false"></Card>
    <!-- </ClientOnly> -->
  </v-container>
</template>


  
<script setup lang="ts">
import { queryEntireCollection } from "~/lib/db";

// data
const firebaseUser = useFirebaseUser();
// const authenticated = ref();
const loading = ref(true);

const allPosts = ref();
const allCourses = ref();
const allProfessors = ref();
const selected = ref();


onMounted(async () => {
  await loadContent();
});

watch(firebaseUser, async () => {
  await loadContent();
});

async function loadContent() {
  loading.value = true;

  if (firebaseUser.value !== null) {
    // console.log("User exists, Loading Data");

    allPosts.value = await queryEntireCollection('posts');

    allCourses.value = await queryEntireCollection('classes');

    allProfessors.value = await queryEntireCollection('profs');

    //authenticated.value = true;
  }
  else {
    console.log("No User, Clearing Data");
    //authenticated.value = false;
  }

  loading.value = false;
}

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

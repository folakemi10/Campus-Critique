<template>
  <div>
    <div class="text-center" v-if="loading">
      <v-progress-circular model-value="20" color="primary" indeterminate></v-progress-circular>
    </div>

    <v-container v-if="!authenticated && !loading" class="flex flex-row">
      <div class="flex items-center justify-between flex-wrap text-center">
        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-700 dark:text-white w-full">
          Welcome to Campus Critique!
        </h1>

        <v-btn class="bg-primary-button mt-4" to="/register">
          Join Us
        </v-btn>
      </div>

      <v-img class="ml-4 w-full sm:w-1/2 mt-4" src="../assets/illustration.svg"></v-img>
    </v-container>

    <v-container v-if="authenticated && !loading" class="flex-vertical justify-center">
      <Search />
      <!-- <ClientOnly> -->
      <Card v-for="(review, index) in allPosts" :key="index" :review="review" :showChangeBtns="false"></Card>
      <!-- </ClientOnly> -->
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { queryEntireCollection, queryOrderedCollection } from "~/lib/db";
import { getFriendPosts } from "~/lib/friends";

// data
const firebaseUser: any | null = ref(null);
const authenticated = ref();
const loading = ref(true);

const allPosts = ref();
const allCourses = ref();
const allProfessors = ref();


onMounted(async () => {
  firebaseUser.value = useAttrs().user;
  authenticated.value = useAttrs().isAuthenticated;
  await loadContent();
  if (!authenticated) {
    navigateTo("/");
  }
});

watch(firebaseUser, async () => {
  await loadContent();
});

async function loadContent() {
  loading.value = true;

  if (!firebaseUser.value) {
    //console.log("No User, Clearing Data");
    authenticated.value = false;
  }
  else {
    //console.log("User exists, fetch data");
    // allPosts.value = await queryOrderedCollection('posts', 'modifiedAt', 'desc');
    allPosts.value = await getFriendPosts(firebaseUser.value.uid);
    allCourses.value = await queryEntireCollection('classes');
    allProfessors.value = await queryEntireCollection('profs');
  }

  loading.value = false;
}



</script>

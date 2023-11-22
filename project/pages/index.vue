<template>
  <div>
    <div class="text-center"  v-if="loading">
      <v-progress-circular model-value="20" color="primary" indeterminate></v-progress-circular>
    </div>

    <v-container v-if="!authenticated && !loading">
      <h1 class="text-900 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-center dark:text-white">
        Welcome to Campus Critique!</h1>

      <v-btn color="primary-button" to="/register">
        Join Us
      </v-btn>
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

// data
const firebaseUser = ref();
const authenticated = ref();
const loading = ref(true);

const allPosts = ref();
const allCourses = ref();
const allProfessors = ref();
const selected = ref();


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

  if (firebaseUser.value !== null) {
    // console.log("User exists, Loading Data");

    allPosts.value = await queryOrderedCollection('posts', 'modifiedAt', 'desc');
    //console.log(allPosts.value);

    //allCourses.value = await queryEntireCollection('classes');
    //console.log(allCourses.value);

    //allProfessors.value = await queryEntireCollection('profs');
  }
  else {
    //console.log("No User, Clearing Data");
    authenticated.value = false;
  }

  loading.value = false;
}

// watch works directly on a ref
// watch(selected, async () => {
//   await navigateTo({
//     path: '/details/',
//     query: {
//       id: selected.value.id,
//     },
//     replace: true,
//   })
// })

</script>

<template>
  <GlobalNav />
  <v-container v-if="!authenticated">
    <h1 class="text-900 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-center dark:text-white">
      Welcome to Campus Critique!</h1>

    <v-btn color="primary-button" to="/register">
      Join Us
    </v-btn>
    <!-- <v-autocomplete label="Search" placeholder="Search for a course or professor" prepend-inner-icon="mdi-magnify" rounded
      variant="solo" auto-select-first class="flex-full-width" density="comfortable" item-props menu-icon=""
      :items="allCourses" v-model="selected" return-object></v-autocomplete> -->
  </v-container>

  <v-container v-if="authenticated" class="flex-vertical justify-center">
    <Search />
    <ClientOnly>
      <Card v-for="(review, index) in allPosts" :key="index" :review="review" :showChangeBtns="false"></Card>
    </ClientOnly>
  </v-container>
</template>


  
<script setup lang="ts">
import { queryEntireCollection } from "~/lib/db";

// data
const firebaseUser = useFirebaseUser();
const authenticated = ref(false);

const allPosts = ref();
const allCourses = ref();
const allProfessors = ref();
const selected = ref();

// methods
async function loadContent() {
  //console.log(firebaseUser.value);
  if (firebaseUser.value != null) {
    console.log("User exists, Loading Data");

    allPosts.value = await queryEntireCollection('posts');

    allCourses.value = await queryEntireCollection('classes');

    allProfessors.value = await queryEntireCollection('profs');

    authenticated.value = true;
  }
  else {
    console.log("No User, Clearing Data");
    authenticated.value = false;
  }
}

// watch
watch(firebaseUser, async () => {
  await loadContent();
});

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

// mounted
onMounted(async () => {
  console.log("Mounted");
  await loadContent();
});


</script>

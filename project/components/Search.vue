<template>
  <v-autocomplete label="Search" placeholder="Search for a course or professor" :items="allObjects" v-model="selected"
    variant="outlined" return-object></v-autocomplete>
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

const allObjects = ref();


// methods
async function loadContent() {
  if (firebaseUser.value != null) {

    allPosts.value = await queryEntireCollection('posts');

    allCourses.value = await queryEntireCollection('classes');

    allProfessors.value = await queryEntireCollection('profs');

    allObjects.value = allProfessors.value.concat(allCourses.value);

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
  
<template>
  <GlobalNav />
  <!-- If user is logged in, display all the posts for the class -->
  <v-container>
    <v-container>
      <h1>Details for {{ currentObjectName ? currentObjectName : 'Loading...' }}</h1>
    </v-container>

    <Card v-for="(review, index) in displayedPosts" :key="index" :review="review"></Card>

    <v-container v-if="!firebaseUser">
      Sign in to view what others have to say about {{ currentObjectName }}
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
import { doc, getDoc } from "firebase/firestore";
import { ref, onMounted, computed, watch } from 'vue';
import { db } from '~/lib/firebase';
import { queryCollectionByField } from '~/lib/db';

const reviewedObjectId = String(useRoute().query.id);
const firebaseUser = useFirebaseUser();

const currentObjectName = ref<null | string>(null);
const specificPosts = ref<{ id: string }[]>([]);

// Fetch specific posts and current object name
onMounted(async () => {
  specificPosts.value = await queryCollectionByField('posts', 'reviewedObject', reviewedObjectId);

  const docRef = doc(db, "classes", reviewedObjectId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    currentObjectName.value = docSnap.data().title;
  } else {
    // Handle the case when the document doesn't exist
    currentObjectName.value = "Error. Please refresh";
  }
});

// Determines if only one post or all should be displayed
const displayedPosts = computed(() => {
  return firebaseUser.value ? specificPosts.value : (specificPosts.value.length > 0 ? [specificPosts.value[0]] : []);
});

// Use watch to watch the user variable
watch(firebaseUser, (newValue) => {
  if (newValue) {
    firebaseUser.value = newValue;
  }
});
</script>

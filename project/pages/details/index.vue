<template>
  <GlobalNav />
  <!-- If user is logged in, display all the posts for the class -->
  <v-container>
    <MakeReviewBtn :firebaseUser="firebaseUser" :reviewedObjectId="reviewedObjectId" />
    <v-card>
      <h1>{{ currentObjectName ? currentObjectName : 'Loading...' }}</h1>
      <h1>{{ ratingDisplay(calculateAverage()) }}</h1>
    </v-card>

    <Card v-for="(review, index) in specificPosts" :key="index" :review="review"></Card>

    <v-container v-if="!firebaseUser">
      Sign in to view what others have to say about {{ currentObjectName }}
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
import { average, doc, getDoc } from "firebase/firestore";
import { ref, onMounted, computed, watch } from 'vue';
import { db } from '~/lib/firebase';
import { queryCollectionByField } from '~/lib/db';

const reviewedObjectId = String(useRoute().query.id);
const firebaseUser = useFirebaseUser();

const currentObjectName = ref<null | string>(null);
const specificPosts = ref<any[]>([]);

// Use watch to watch the user variable
watch(firebaseUser, (newValue) => {
  if (newValue) {
    firebaseUser.value = newValue;
  }
});

// Fetch specific posts and current object name
onMounted(async () => {
  const courseDocRef = doc(db, 'classes', reviewedObjectId);
  const profDocRef = doc(db, 'profs', reviewedObjectId);

  const courseDoc = await getDoc(courseDocRef);
  const profDoc = await getDoc(profDocRef);

  if (courseDoc.exists()) {
    specificPosts.value = await queryCollectionByField('posts', 'class', reviewedObjectId);
  }
  if (profDoc.exists()) {
    specificPosts.value = await queryCollectionByField('posts', 'professor', reviewedObjectId);
  }

  
  currentObjectName.value = await getObject(reviewedObjectId);

});


async function getObject(id: string) {
  const courseDocRef = doc(db, 'classes', id);
  const profDocRef = doc(db, 'profs', id);

  const courseDoc = await getDoc(courseDocRef);
  const profDoc = await getDoc(profDocRef);

  if (courseDoc.exists()) {
    return courseDoc.data().title;
  }
  if (profDoc.exists()) {
    return profDoc.data().title;
  }
  else return id;
}

const calculateAverage = (): number => {
  if (specificPosts.value.length === 0) {
    return -1; // Return 0 if the array is empty to avoid division by zero.
  }

  let sum = 0;

  for (const post of specificPosts.value) {
    if (post.hasOwnProperty("rating")) {
      sum += post.rating;
    }
  }

  const average = sum / specificPosts.value.length;
  return average;
};

const ratingDisplay = (rating: number): String => {
  if (rating === -1) {
    return "Overall Rating: No reviews yet"; // Return 0 if the array is empty to avoid division by zero.
  }
  return "Overall Rating: "+ rating.toFixed(1) + " / 5";
};


// // Determines if only one post or all should be displayed
// const displayedPosts = computed(() => {
//   return firebaseUser.value ? specificPosts.value : (specificPosts.value.length > 0 ? [specificPosts.value[0]] : []);
// });
</script>





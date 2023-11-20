<template>
  <div>
    <!-- If user is logged in, display all the posts for the class -->
    <div class="text-center"  v-if="loading">
      <v-progress-circular model-value="20" color="primary" indeterminate></v-progress-circular>
    </div>

    <v-container v-if="!loading">
      <v-card>
        <v-card-title>{{ currentObjectName ? currentObjectName : 'Loading...' }}</v-card-title>
        <v-card-title>{{ ratingDisplay(calculateAverage()) }}</v-card-title>
        <v-card-actions>
          <MakeReviewBtn :firebaseUser="firebaseUser" :reviewedObjectId="reviewedObjectId" />
        </v-card-actions>
      </v-card>

      <Card v-for="(review, index) in specificPosts" :key="index" :review="review"></Card>

      <v-container v-if="!firebaseUser">
        Sign in to view what others have to say about {{ currentObjectName }}
      </v-container>
    </v-container>
  </div>
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

const authenticated = ref(false);
const loading = ref(true);

onMounted(async () => {
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

    authenticated.value = true;
  } else {
    authenticated.value = false;
  }

  loading.value = false;
}

// Use watch to watch the user variable
watch(firebaseUser, (newValue) => {
  if (newValue) {
    firebaseUser.value = newValue;
  }
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
  return "Overall Rating: " + rating.toFixed(1) + " / 5";
};

</script>





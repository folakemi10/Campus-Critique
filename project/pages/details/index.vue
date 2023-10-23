<template>
  <GlobalNav />
  <!-- If user is logged in, display all the posts for the class -->
  <v-container v-if="firebaseUser">
    <h1>Details for {{ currentDetail ? currentDetail : 'Loading...' }}</h1>
    <Card v-for="(review, index) in specificPosts" :key="index" :review="review"></Card>
  </v-container>
  <v-container v-else>
    Sign in to view what others have to say about {{ currentDetail }}
  </v-container>
</template>

<script setup lang="ts">
import { doc, getDoc } from "firebase/firestore";
import { db } from '~/lib/firebase';
import { queryCollectionByField } from '~/lib/db';

const reviewedObjectId = String(useRoute().query.id);

const firebaseUser = useFirebaseUser();

const specificPosts = ref();
const currentDetail = ref();


onMounted(async () => {
  specificPosts.value = await queryCollectionByField('posts', 'reviewedObject', reviewedObjectId);

  const docRef = doc(db, "classes", reviewedObjectId);
  const docSnap = await getDoc(docRef);


  if (docSnap.exists()) {
    // console.log("Document data:", docSnap.data());
    currentDetail.value = docSnap.data().title;
  } else {
    // docSnap.data() will be undefined in this case
    console.log("No such document!");
  }

}
);

function getAllPosts() {

}

function getOnePost() {

}






</script>

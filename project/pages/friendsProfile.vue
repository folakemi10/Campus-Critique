<template>
    <v-container fluid>
      <v-card class="mx-10 my-10">
        <v-card-text>
          <h1 class="text-3xl font-semibold mb-4">{{ friend.friendName }}</h1>
          <div class="text-lg mb-4">
            Number of Reviews: {{ friendReviews ? friendReviews.length : 'Loading...' }}
          </div>
        </v-card-text>
      </v-card>
 
      <!-- Display friend's reviews -->
      <Card v-for="(review, index) in friendReviews" :key="index" :review="review" />
    </v-container>
  </template>
 
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { doc, getDoc, getDocs, query, where, collection } from 'firebase/firestore';
  import { db } from '~/lib/firebase';
  import { queryCollectionByField } from '~/lib/db';
 
  const { friend } = defineProps(['friend']);
 
  console.log("here")
  const friendReviews = ref<any[]>([]);
 
  onMounted(async () => {
    // Fetch the friend's reviews from Firestore based on their ID
    if (friend && friend.friendId) {
      console.log(friend.friendId);
      const docFriend = doc(db, "users", friend.friendId);
      const docSnap = await getDoc(docFriend);
      
      const frienduid = docSnap.data().uid;

      friendReviews.value = await queryCollectionByField('posts', 'uid', frienduid);
      //const reviewsQuerySnapshot = await getDocs(reviewsQuery);
      //friendReviews.value = reviewsQuerySnapshot.docs.map((doc) => doc.data());
    }
  });
  </script>
 
  <style lang="scss" scoped>
  </style>
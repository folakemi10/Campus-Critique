<template>
    <GlobalNav />
    <v-card>
        <v-container fluid>
        <h2>Your Friends</h2>


        <!-- Conditionally render friend card list or selected friend's profile -->
        <div v-if="!selectedFriend">
            <v-card
            v-for="friend in friends"
            :key="friend.friendId"
            @click="showFriendProfile(friend)"
            class="friend-card"
            >
            <v-card-title>{{ friend.friendName }}</v-card-title>
            </v-card>
        </div>


        <v-card v-if="selectedFriend" class="friend-profile">
            <friendsProfile v-if="selectedFriend" :friend="selectedFriend" />
        </v-card>
        </v-container>
    </v-card>
  </template>
 
 
 
 
  <script setup lang="ts">
  import { collection, getDocs, query, where } from "firebase/firestore";
  import { db } from '~/lib/firebase';
  import friendsProfile from './friendsProfile.vue';
 
  const firebaseUser = useFirebaseUser();
  const userId = firebaseUser.value?.uid;
 
  const friends = ref<any[]>([]);
 
   
 
  onMounted(async () => {
    if (userId) {
      // Retrieve the user's friends from the "friends" collection
      const friendsQuery = query(collection(db, "friends"), where("userId", "==", userId));
      const friendsQuerySnapshot = await getDocs(friendsQuery);
      friends.value = friendsQuerySnapshot.docs.map((doc) => doc.data());
    } else {
      console.log('userId does not exist');
    }
  });
 
  const selectedFriend = ref<any | null>(null);


  const showFriendProfile = (friend: any) => {
  selectedFriend.value = friend;
  };


 
  </script>
 
  <style lang="scss" scoped>
 
  </style>
 
 

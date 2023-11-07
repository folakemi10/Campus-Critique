<template>
  <GlobalNav />
  <v-card>
    <v-tabs v-if="firebaseUser" v-model="tab" align-tabs="start" color="primary">
      <v-tab v-for="(item, index) in tabItems" :key="index" :value="'tab-' + index">
        {{ item }}
      </v-tab>
    </v-tabs>

    <v-window v-model="tab" class="bg-black">
      <v-window-item value="tab-0">
        <v-container class="flex flex-col items-center justify-center">
          <v-card class="min-w-full max-w-xl ">
            <v-card-text>
              <h1 class="text-3xl font-semibold mb-4"> {{ userName.firstname }} {{ userName.lastname }}</h1>
              <div class="text-lg mb-4">
                Number of Reviews: {{ allPosts ? allPosts.length : 'Loading...' }}
              </div>
              <LogoutBtn />
            </v-card-text>
            <v-text-field v-model="newFriendEmail" label="Friend's Email" outlined></v-text-field>
            <v-btn @click="inviteFriend">Invite Friend</v-btn>
          </v-card>

          <Card v-for="(review, index) in allPosts" :key="review.id" :review="review" :showChangeBtns="true"
            @open-edit-modal="openEditModalForReview" :deletePost="deletePost"></Card>

        </v-container>

        <EditModal v-model="isActive" :reviewToEdit="reviewToEdit" @close-edit-modal="closeEditModal" />
      </v-window-item>


      <v-window-item value="tab-1">
        <v-container fluid>

        </v-container>
      </v-window-item>

    </v-window>
  </v-card>
</template>

<script setup lang="ts">
import { queryCollectionByField, del } from '~/lib/db';
import { doc, setDoc, collection, getDocs, getDoc, query, where } from "firebase/firestore";
import { db } from '~/lib/firebase';
import { ref } from 'vue';

const firebaseUser = useFirebaseUser();
const userId = firebaseUser.value?.uid;

const allPosts = ref();
const userName = ref();


onMounted(async () => {
  if (userId) {
    allPosts.value = await queryCollectionByField("posts", "uid", userId);
  } else {
    console.log('userId does not exist');
  }
});


const usersRef = collection(db, "users");
const q = query(usersRef, where("uid", "==", userId));
const querySnapshot = await getDocs(q);
querySnapshot.forEach((doc) => {
  // doc.data() is never undefined for query doc snapshots
  userName.value = doc.data();
});


definePageMeta({
  middleware: function (to, from) {
    const user = useFirebaseUser();


    if (!user.value) {
      return navigateTo('/');
    }
  },
});

//Control the sections of the profile page
const tab = ref('tab-0');

const tabItems = [
  'Posts', 'Saved Courses'
];


async function deletePost(id: string) {
  //console.log("delete post");
  try {
    await del("posts", id);

    const postIndex = allPosts.value.findIndex((p: { id: any; }) => p.id === id);
    if (postIndex !== -1) {
      allPosts.value.splice(postIndex, 1); // Remove the card from the array
    }
  } catch (e) {
    console.log(e);
  }
}

const isActive = ref(false);
const reviewToEdit = ref(null);

const openEditModalForReview = (review: any) => {
  reviewToEdit.value = review;
  isActive.value = true;
};

const closeEditModal = (editedReview: any) => {
  // Find and update the corresponding review in the allPosts array
  console.log(editedReview);
  const index = allPosts.value.findIndex((review: any) => review.id === editedReview.id);
  console.log(index);
  if (index !== -1) {
    allPosts.value[index] = editedReview;
  }
  isActive.value = false;
  //refetch data to update the 
};


</script>


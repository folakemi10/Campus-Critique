<template>
  <GlobalNav :isAuthenticated='authenticated' />



  <v-card v-if="authenticated">
    <v-card class="min-w-full max-w-xl ">
      <v-card-text>
        <div class="flex items-center">
          <Avatar class="mr-4" size="64" :user='userDoc' />
          <h1 class="text-3xl font-semibold"> {{ userDoc.firstname }} {{ userDoc.lastname }}</h1>
        </div>

        <div class="text-lg mb-4">
          {{ userDoc.username }}
        </div>
      </v-card-text>

      <v-card-actions>
        <v-dialog width="500">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" text="Edit Profile" variant="outlined"> </v-btn>
          </template>

          <template v-slot:default="{ isActive }">
            <v-card title="Dialog">
              <v-card-text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore
                magna aliqua.
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn text="Close Dialog" @click="isActive.value = false"></v-btn>
              </v-card-actions>
            </v-card>
          </template>
        </v-dialog>
      </v-card-actions>

      <!-- <v-text-field v-model="newFriendEmail" label="Friend's Email" outlined></v-text-field>
    <v-btn @click="addFriend">Add Friend</v-btn> -->
    </v-card>

    <v-tabs v-model="tab" align-tabs="start" color="primary">
      <v-tab v-for="(item, index) in tabItems" :key="index" :value="'tab-' + index">
        {{ item }}
      </v-tab>
    </v-tabs>

    <v-window v-model="tab" class="bg-black">
      <v-window-item value="tab-0">
        <v-container class="flex flex-col items-center justify-center">

          <Card v-for="(review, index) in allPosts" :key="review.id" :review="review" :showChangeBtns="true"
            @open-edit-modal="openEditModalForReview" :deletePost="deletePost"></Card>

        </v-container>

        <EditPostModal v-model="isActive" :reviewToEdit="reviewToEdit" @close-edit-modal="closeEditModal" />
      </v-window-item>


      <v-window-item value="tab-1">
        <v-container fluid>

        </v-container>
      </v-window-item>
    </v-window>
  </v-card>

  <v-dialog>
    <v-card>
      <v-card-title>Edit Profile</v-card-title>
      <v-card-text>

        <v-text-field v-model="userDoc.username" label="Username" outlined></v-text-field>
        <v-text-field v-model="userDoc.firstname" label="First Name" outlined></v-text-field>
        <v-text-field v-model="userDoc.lastname" label="Last Name" outlined></v-text-field>

      </v-card-text>
      <v-card-actions>
        <v-btn @click="saveChanges">Save</v-btn>
        <v-btn @click="cancelModal">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { queryCollectionByField, del } from '~/lib/db';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from '~/lib/firebase';
import { addDoc } from "firebase/firestore";


const firebaseUser = useFirebaseUser();
let userId = "";

const allPosts = ref();

const authenticated = ref(false);

const userDoc = ref();

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
  if (firebaseUser.value != null) {
    userId = firebaseUser.value?.uid;
    userDoc.value = await getUser(userId);

    if (userId) {
      allPosts.value = await queryCollectionByField("posts", "uid", userId);
      tabItems.push('Posts (' + allPosts.value.length + ")");
      tabItems.push('Saved Courses');
    } else {
      console.log('userId does not exist');
    }

    authenticated.value = true;
  } else {
    authenticated.value = false;
    //navigateTo('/');
  }
}

//Control the sections of the profile page
const tab = ref('tab-0');

const tabItems: any[] = [];

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
  //console.log(editedReview);
  const index = allPosts.value.findIndex((review: any) => review.id === editedReview.id);
  //console.log(index);
  if (index !== -1) {
    allPosts.value[index] = editedReview;
  }
  isActive.value = false;
};



async function getUser(uid: string) {
  try {
    const doc = await queryCollectionByField("users", "uid", uid);

    if (doc[0]?.hasOwnProperty('username')) {
      return doc[0];
    } else {
      return;
    }
  }
  catch (e) {
    console.log(e);
  }

}


const cancelModal = () => {
  console.log("canceling");
  // userDoc.value = { ...props.reviewToEdit };
  // emit('close-edit-modal', props.reviewToEdit);
};

const saveChanges = () => {
  // updateDocument();
  // emit('close-edit-modal', editedReview.value);
  console.log("saving changes");
};

import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

async function updateDocument() {
  // try {
  //     const docRef = doc(db, "posts", props.reviewToEdit.id);
  //     await updateDoc(docRef, {
  //         rating: editedReview.value.rating,
  //         textReview: editedReview.value.textReview,
  //         modifiedAt: serverTimestamp()
  //     });
  // }
  // catch (e) {
  //     console.log(e);
  // }

  console.log("updating");
}

// definePageMeta({
//   middleware: function (to, from) {
//     const user = useFirebaseUser();
//     if (!user) {
//     return navigateTo('/')
//   }
//   },
// });


// //code for friends
// const newFriendEmail = ref('');

// const addFriend = async () => {
//   // Assuming you have a "friends" collection in Firebase Firestore
//   try {
//     const friendsRef = collection(db, "friends");

//     // Check if the friend's email exists in the "users" collection
//     const usersRef = collection(db, "users");
//     const userQuery = query(usersRef, where("email", "==", newFriendEmail.value));
//     const userQuerySnapshot = await getDocs(userQuery);
//     if (!userQuerySnapshot.empty) {
//       const friendDoc = userQuerySnapshot.docs[0];
//       const friendData = friendDoc.data();

//       // Add the friend's information to the "friends" collection
//       await addDoc(friendsRef, {
//         userId: userId,
//         friendId: friendData.uid,
//         friendName: `${friendData.firstname} ${friendData.lastname}`,
//       });

//       // Clear the input field
//       newFriendEmail.value = '';
//     } else {
//       console.log("Friend not found with that email.");
//     }
//   } catch (error) {
//     console.error("Error adding friend:", error);
//   }
// };

</script>

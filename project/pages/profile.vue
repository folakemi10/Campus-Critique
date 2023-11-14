<template>
  <GlobalNav :isAuthenticated='authenticated' />

  <v-card v-if="authenticated">
    <v-card class="min-w-full max-w-xl ">
      <v-card-text>
        <div class="flex items-center">
          <Avatar class="mr-4" size="64" :user='userDoc' :isEditable="false"/>
          <h1 class="text-3xl font-semibold"> {{ userDoc.firstname }} {{ userDoc.lastname }}</h1>
        </div>

        <div class="text-lg mb-4">
          {{ '@' + userDoc.username }}
        </div>
      </v-card-text>

      <v-card-actions>

        <v-btn text="Edit Profile" variant="outlined" @click="dialog = true"> </v-btn>


        <v-dialog width="500" v-model="dialog">
          <v-card title="Edit Profile">

            <v-card-text>
              <div class="flex items-center">
                <Avatar class="mr-4" size="64" :user='userDoc' :isEditable="true"/>
                <!-- <ProfilePicBtn :uid_prop='userId' /> -->
              </div>
              <v-text-field :rules="[rules.required]" v-model="editedUserDoc.username" label="Username"
                outlined></v-text-field>
              <v-text-field :rules="[rules.required]" v-model="editedUserDoc.firstname" label="First Name"
                outlined></v-text-field>
              <v-text-field :rules="[rules.required]" v-model="editedUserDoc.lastname" label="Last Name"
                outlined></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-btn @click="saveProfileChanges">Save</v-btn>
              <v-btn @click="dialog = false">Cancel</v-btn>
            </v-card-actions>
          </v-card>
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
</template>

<script setup lang="ts">
import { queryCollectionByField, del } from '~/lib/db';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from '~/lib/firebase';
import { addDoc } from "firebase/firestore";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";


const firebaseUser = useFirebaseUser();
let userId = "";

const allPosts = ref();

const authenticated = ref(false);

const userDoc = ref();
const editedUserDoc = ref();
const dialog = ref(false);

const rules = ref({
  required: (value:any) => !!value || "Cannot be empty",
});

onUpdated(() => editedUserDoc.value = { ...userDoc.value });

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

const saveProfileChanges = async () => {
  //console.log("saving changes");

  if(editedUserDoc.value.username == '' || editedUserDoc.value.firstname === '' || editedUserDoc.value.lastname === ''){
    //TODO: Put snack bar here to tell user these fields cannot be empty
    return;
  }

  try {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, {
      username: editedUserDoc.value.username,
      firstname: editedUserDoc.value.firstname,
      lastname: editedUserDoc.value.lastname,
    });

    userDoc.value = await getUser(userId);

  }
  catch (e) {
    console.log(e);
  }

  dialog.value = false;
};




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

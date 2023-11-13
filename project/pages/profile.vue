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
        <v-card v-if="isFromFriendsPage"  class="min-w-full max-w-xl">
            <h1 class="text-3xl font-semibold mb-4"> {{ friendName ? friendName.firstname : 'Loading...' }} {{ friendName ? friendName.lastname : 'Loading...' }}</h1>
            
            <v-btn @click="inviteFriend">Invite Friend</v-btn>
          </v-card>

       
          <v-card v-else class="min-w-full max-w-xl ">
            <v-card-text>
              <h1 class="text-3xl font-semibold mb-4"> {{ userName.firstname }} {{ userName.lastname }}</h1>
              <div class="text-lg mb-4">
                Number of Reviews: {{ allPosts ? allPosts.length : 'Loading...' }}
              </div>
              <LogoutBtn />
            </v-card-text>
          </v-card>

        </v-container>

        <Card class="min-w-full max-w-xl" v-if="!isFromFriendsPage"  v-for="(review, index) in allPosts" :key="review.id" :review="review" :showChangeBtns="true"
            @open-edit-modal="openEditModalForReview" :deletePost="deletePost"></Card>



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
import { doc, setDoc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from '~/lib/firebase';
import { useRoute } from 'vue-router';


const firebaseUser = useFirebaseUser();
const userId = firebaseUser.value?.uid;
let friendId = "";
const allPosts = ref();
const userName = ref();
const friendName = ref();
const route = useRoute();

//need to conditionaly render page
const isFromFriendsPage = route.query.fromFriendsPage === 'fromFriendsPage';

const invitationsRef = collection(db, 'friends');


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

  //console.log("in" +  userName.firstname);
});
console.log('1Query Snapshot:', querySnapshot);


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


onMounted(async () => {
  if (route.query.friendId) {
    friendId = route.query.friendId as string;
    friendId = String(friendId);

   const friendQuery = query(usersRef, where("uid", "==", friendId));
   const fQuerySnapshot = await getDocs(friendQuery);

   fQuerySnapshot.forEach((doc) => {
   friendName.value = doc.data();
  });
  }
});




//invite friend if selected user
const inviteFriend = async () => {
  try {
    // Check if the userId is not null. this shouldn't happen but wouldn't let the code run otherwise
    if (!userId) {
      console.error('User is not authenticated. Unable to send an invitation.');
      return;
    }

  
    if (friendName.value) {
      const friendData = friendName.value;


      // Create a unique invitation document ID based on invitationDocId
      const invitationDocId =
        userId < friendData.uid
          ? `${userId}_${friendData.uid}`
          : `${friendData.uid}_${userId}`;

      // Check if an invitation with the same ID already exists
      const invitationDoc = doc(invitationsRef, invitationDocId);
      const invitationDocSnapshot = await getDoc(invitationDoc);

      if (!invitationDocSnapshot.exists()) {
        // Create the invitation document with the same ID as invitationDocId
        await setDoc(invitationDoc, {
          senderId: userId,
          receiverId: friendData.uid,
          senderName: userName.value.username,
          receiverName: friendName.value.username,
          status: 'pending'
        });

        
      } else {
        console.log('An invitation for this friend already eyxists.');
      }
    } else {
      console.log('Friend not found with that email.');
    }
  } catch (error) {
    console.error('Error inviting friend:', error);
  }
};
</script>


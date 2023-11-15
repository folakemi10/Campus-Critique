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
    </v-card>

    <v-tabs v-model="tab" align-tabs="start" color="primary">

      <v-tab v-for="(item, index) in tabItems" :key="index" :value="'tab-' + index">
        {{ item }}
      </v-tab>
    </v-tabs>

    <v-window v-model="tab" class="bg-black">
     
      <Snackbar v-if="snackbar" :text = "snackbarText"/>
   
      <v-window-item value="tab-0">

        <v-container class="flex flex-col items-center justify-center">

          <v-card v-if="isFromFriendsPage" class="min-w-full max-w-xl">
            <h1 class="text-3xl font-semibold mt-4 mb-4 pl-4 pr-4"> {{ friendName ? friendName.firstname : 'Loading...' }} {{ friendName
              ? friendName.lastname : 'Loading...' }}</h1>

            <v-btn :variant="variant"  class="mx-4 mb-4" @click="inviteFriend">Invite Friend</v-btn>
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

        <Card class="min-w-full max-w-xl" v-if="!isFromFriendsPage || !isFromAcceptedsPage"  v-for="(review, index) in allPosts" :key="review.id"
          :review="review" :showChangeBtns="true" @open-edit-modal="openEditModalForReview" :deletePost="deletePost">
        </Card>

        <Card class="min-w-full max-w-xl" v-if="isFromAcceptedsPage" v-for="(review, index) in friendPosts" :key="review.id"
          :review="review" :showChangeBtns="true">
        </Card>


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
import { doc,  updateDoc,addDoc, serverTimestamp, setDoc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from '~/lib/firebase';
import { useRoute } from 'vue-router';


const firebaseUser = useFirebaseUser();
//const userId = firebaseUser.value?.uid;
let friendId = "";
const allPosts = ref();
const friendPosts = ref();
const userName = ref();
const friendName = ref();
const route = useRoute();
const snackbar = ref(false);
const snackbarText = ref();
let userId = "";

const authenticated = ref(false);


const userDoc = ref();
const editedUserDoc = ref();
const dialog = ref(false);

const rules = ref({
  required: (value:any) => !!value || "Cannot be empty",
});

onUpdated(() => editedUserDoc.value = { ...userDoc.value });


const props = defineProps({
    variant: {
        type: String as PropType<"outlined" | "flat" | "text" | "elevated" | "tonal" | "plain">,
        default: "outlined", // Default to a valid Vuetify variant
    },
});

//need to conditionaly render page
const isFromFriendsPage = route.query.fromFriendsPage === 'fromFriendsPage';
const isFromAcceptedsPage = route.query.fromFriendsPage === 'fromAcceptedPage';
const invitationsRef = collection(db, 'friends');
const tabItems: any[] = [];

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
  }
}

onMounted(async () => {
  if (friendId) {
    friendPosts.value = await queryCollectionByField("posts", "uid", friendId);
  } else {
    console.log('friendId does not exist');
    //authenticated.value = false;
    //navigateTo('/');
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

        //make snackbar visible
        snackbarText.value = "Invite Sent"
        snackbar.value = true;

      } else {
        
        //make snackbar visible
        snackbarText.value = "An invitation for this friend already eyxists"
        snackbar.value = true;
        console.log('An invitation for this friend already eyxists.');
      }
    }
  } catch (error) {
    console.error('Error inviting friend:', error);
  }
};

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


</script>


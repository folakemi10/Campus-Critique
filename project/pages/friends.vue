<template>
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
              <v-autocomplete label="Search" placeholder="Search for a username" :items="userSuggestions"
                v-model="selected" item-text="username" item-value="id" variant="outlined" return-object></v-autocomplete>
            </v-card-text>
          </v-card>
        </v-container>


        <v-container class="my-5">
          <h1 class="text-3xl font-semibold mb-4"> Your Friends </h1>
          <v-card v-for="friend in acceptedFriends" :key="friend.id"
            :to="{ path: '/friendsProfile/', query: { friendId: friend.id, friendRequestStatus: 'accepted' } }" class="mb-1">
            <v-card-text class="py-4">
              <h1>
                {{ friend.username }}
              </h1>
            </v-card-text>
            <v-divider></v-divider>
          </v-card>
        </v-container>
      </v-window-item>


      <v-window-item value="tab-1">
        <v-container fluid>
          <Snackbar v-if="snackbar" :text = "snackbarText"/>
          <h1 class="text-3xl font-semibold mb-4"> Your Invites </h1>
          <v-card v-for="invitation in invitations" :key="invitation.id" class="mb-4">
            <v-card-text>{{ invitation.senderName }} is trying to become your friend</v-card-text>
            <v-card-actions>
              <v-btn  text="Edit Profile" variant="outlined" @click="acceptInvitation(invitation)">Accept</v-btn>
              <v-btn  text="Edit Profile" variant="outlined" @click="declineInvitation(invitation)">Decline</v-btn>
            </v-card-actions>
          </v-card>


        </v-container>

      </v-window-item>

      <v-window-item value="tab-2">
        <v-container fluid>
          <Snackbar v-if="snackbar" :text = "snackbarText"/>
          <h1 class="text-3xl font-semibold mb-4"> Sent Invites </h1>
          <v-card v-for="invitation in sentInvitations" :key="invitation.id" class="mb-4">
            <v-card-text> You sent an invite to {{ invitation.receiverName }} </v-card-text>
            <v-card-actions>
              <v-btn  text="Edit Profile" variant="outlined" @click="declineInvitation(invitation)">withdraw</v-btn>
            </v-card-actions>
          </v-card>


        </v-container>

      </v-window-item>

    </v-window>


  </v-card>
</template>
  
<script setup lang="ts">
import { collection, updateDoc, deleteDoc, getDocs, query, where, doc, setDoc, getDoc, or } from "firebase/firestore";
import { db } from '~/lib/firebase';
import { ref } from 'vue';
import { queryEntireCollection, getUser } from "~/lib/db";
import { declineFriendRequest, acceptFriendRequest, getAcceptedFriends} from '~/lib/friends';




const firebaseUser = ref();
const userId = ref();

const usersRef = collection(db, "users");
let userSuggestions = ref<any[]>([]);
let allUsers = ref<any[]>([]);;
let selected = ref();
let friendObject = ref();
let acceptedFriends = ref<any[]>([]);
const user = ref();
const snackbar = ref(false);
const snackbarText = ref();

const authenticated = ref();

onMounted(async () => {
    firebaseUser.value = useAttrs().user;
    authenticated.value = useAttrs().isAuthenticated;
    await loadContent();
    if (!authenticated) {
        navigateTo("/");
    }
});

watch(firebaseUser, async () => {
  await loadContent();
});

//search bar for friends tab
async function loadContent() {
  if (firebaseUser.value != null) {
    userId.value = firebaseUser.value?.uid;
    user.value = await getUser(userId.value);
    allUsers.value = await queryEntireCollection('users');
    
    //remove the user from the list
    allUsers.value = allUsers.value.filter(user => user.uid !== userId.value);

    userSuggestions.value = allUsers.value.map(user => user.username);
    
    const invitationsQuery1 = query(
      invitationsRef,
      where('receiverId', '==', userId.value),
      where('status', '==', 'pending')
    );
    const invitationsQuerySnapshot1 = await getDocs(invitationsQuery1);
    invitations.value = invitationsQuerySnapshot1.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Retrieve pending invitations where the user is the sender
    const invitationsQuery2 = query(
      invitationsRef,
      where('senderId', '==', userId.value),
      where('status', '==', 'pending')
    );
    const invitationsQuerySnapshot2 = await getDocs(invitationsQuery2);
    sentInvitations.value = invitationsQuerySnapshot2.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
  else {
    console.log("No User");
  }
}


watch(selected, () => {
  const selectedUserObject = allUsers.value.find(user => user.username === selected.value);
  friendObject.value = selectedUserObject;
});

watch(friendObject, async () => {
  if (friendObject.value) {
    const user_uid = userId.value as string;
    const allFriendIds = await getAcceptedFriends(user_uid);
    let accepted = "pending";
    if(allFriendIds.includes(friendObject.value.uid)){
    accepted = "accepted";
    }

    await navigateTo({
      path: '/friendsProfile/',
      query: {
        friendId: friendObject.value.uid,
        friendRequestStatus: accepted,
      },
      replace: true,
    });
  }
});


onMounted(async () => {
  await loadContent();
  await getFriends();
});


//Control the sections of the profile page
const tab = ref('tab-0');


const tabItems = [
  'Friends', 'Invites', 'Sent'
];

const usernameIdMap: { [key: string]: string } = {};

const invitationsRef = collection(db, 'friends');
const invitations = ref<any[]>([]);
const sentInvitations = ref<any[]>([]);


// Populate the invitations array and display accepted friends
const getFriends = async () => {
  if (userId) {
    const user_uid = userId.value as string;
    const allFriendIds = await getAcceptedFriends(user_uid);
    console.log("all1" + allFriendIds);
    const q = query(usersRef);
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        usernameIdMap[userData.uid] = userData.username;
      });
    }
    acceptedFriends.value = allFriendIds.filter((friendId) => usernameIdMap[friendId]).map((friendId) => ({ id: friendId, username: usernameIdMap[friendId] }));

  }

};

// Accept an invitation and update the friends list
async function acceptInvitation(invitation: any) {
  try {  
    const user_uid = userId.value as string;
    await acceptFriendRequest(invitation.id)
    snackbarText.value = "Invite accepted";
    snackbar.value = true;
    await getAcceptedFriends(user_uid );
    invitations.value = invitations.value.filter((item) => item.id !== invitation.id);
  }
  catch (error) {
    snackbarText.value = "Error accepting invitation";
    snackbar.value = true;
    console.error('Error accepting invitation:', error);
  }
}

async function declineInvitation(invitation: any) {
  try {
    await declineFriendRequest(invitation.id)
    snackbarText.value = "Invite deleted";
    snackbar.value = true;
    invitations.value = invitations.value.filter((item) => item.id !== invitation.id);
    sentInvitations.value = sentInvitations.value = sentInvitations.value.filter((item) => item.id !== invitation.id);
  }
  catch (error) {
    snackbarText.value = "Error accepting invitation";
    snackbar.value = true;
    console.error('Error accepting invitation:', error);
  }
}

</script>
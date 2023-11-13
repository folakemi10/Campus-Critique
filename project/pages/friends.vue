<template>
  <GlobalNav />
  <v-card>
    <v-tabs v-if="firebaseUser" v-model="tab" align-tabs="start" color="primary">
      <v-tab v-for="(item, index) in tabItems" :key="index" :value="'tab-' + index">
        {{ item }}
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <v-window-item value="tab-0">
        <v-container class="flex flex-col items-center justify-center">

          <v-card class="min-w-full max-w-xl ">
            <v-card-text>
              <v-autocomplete label="Search" placeholder="Search for a username" :items="userSuggestions"
                v-model="selected" item-text="username" item-value="id" variant="outlined" return-object></v-autocomplete>
            </v-card-text>
          </v-card>
        </v-container>

        <v-card  class="my-10 min-w-full max-w-xl" v-for="friend in invitedFriends" :key="friend.id" :to="{ path: '/profile/', query: { friendId: friend.id, fromFriendsPage: 'fromFriendsPage' } }">
          <v-card-text>
            {{ friend.username }}
          </v-card-text>
        </v-card>
      </v-window-item>


      <v-window-item value="tab-1">
        <v-container fluid>
          <h1 class="text-3xl font-semibold mb-4"> Your Invites </h1>
          <v-card v-for="invitation in invitations" :key="invitation.id" class="mb-4">
            <v-card-title>{{ invitation.senderName }} is trying to become your friend</v-card-title>
            <v-card-actions>
              <v-btn @click="acceptInvitation(invitation)">Accept</v-btn>
              <v-btn @click="declineInvitation(invitation)">Decline</v-btn>
            </v-card-actions>
          </v-card>


        </v-container>

      </v-window-item>

      <v-window-item value="tab-2">
        <v-container fluid>
          <h1 class="text-3xl font-semibold mb-4"> Sent Invites </h1>
          <v-card v-for="invitation in sentInvitations" :key="invitation.id" class="mb-4">
            <v-card-title> You sent an invite to {{ invitation.receiverName }} </v-card-title>
            <v-card-actions>
              <v-btn @click="declineInvitation(invitation)">withdraw</v-btn>
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
import { queryEntireCollection } from "~/lib/db";



const firebaseUser = useFirebaseUser();
const userId = firebaseUser.value?.uid;
const usersRef = collection(db, "users");
let userSuggestions = ref<any[]>([]);
let allUsers = ref<any[]>([]);;
let selected = ref();
let friendObject = ref();
let invitedFriends = ref<any[]>([]);
const user = ref();



//search bar for friends tab
async function loadContent() {
  if (firebaseUser.value != null) {
    allUsers.value = await queryEntireCollection('users');
    userSuggestions.value = allUsers.value.map(user => user.username);
    //authenticated.value = true;
  }
  else {
    console.log("No User");
  }
}


watch(firebaseUser, async () => {
  await loadContent();
});

watch(selected, () => {
  const selectedUserObject =  allUsers.value.find(user => user.username === selected.value);
  friendObject.value = selectedUserObject;
  //console.log("pop" + friendObject.value);
});

watch(friendObject, async () => {
  if(friendObject.value){
  await navigateTo({
    path: '/profile/',
    query: {
      friendId: friendObject.value.uid,
      fromFriendsPage: "fromFriendsPage",
    },
    replace: true,
  });
}
});


onMounted(async () => {
  await loadContent();
});


const q = query(usersRef, where("uid", "==", userId));
const querySnapshot = await getDocs(q);
querySnapshot.forEach((doc) => {
  user.value = doc.data();
});

//Control the sections of the profile page
const tab = ref('tab-0');


const tabItems = [
  'Friends', 'Invites', 'Sent'
];

const userDataMap: { [key: string]: string } = {};

const invitationsRef = collection(db, 'friends');


// Create an invitations array to store received invitations
const invitations = ref<any[]>([]);

// Create an invitations array to store sent invitations
const sentInvitations = ref<any[]>([]);

// Populate the invitations array
onMounted(async () => {
  if (userId) {
    // Retrieve pending invitations where the user is the receiver
    const invitationsQuery = query(
      invitationsRef,
      where('receiverId', '==', userId),
      where('status', '==', 'pending')
    );
    const invitationsQuerySnapshot = await getDocs(invitationsQuery);
    invitations.value = invitationsQuerySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
});


onMounted(async () => {
  if (userId) {
    // Retrieve pending invitations where the user is the sender
    const invitationsQuery = query(
      invitationsRef,
      where('senderId', '==', userId),
      where('status', '==', 'pending')
    );
    const invitationsQuerySnapshot = await getDocs(invitationsQuery);
    sentInvitations.value = invitationsQuerySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
});



// Populate the invitations array and display accepted friends
const combineFriends = async () => {
  if (userId) {
    // Fetch both sent and received friend invitations
    const sentInvitationsQuery = query(invitationsRef, where('senderId', '==', userId));
    const receivedInvitationsQuery = query(invitationsRef, where('receiverId', '==', userId));

    const [sentInvitationsSnapshot, receivedInvitationsSnapshot] = await Promise.all([
      getDocs(sentInvitationsQuery),
      getDocs(receivedInvitationsQuery),
    ]);

    // Create arrays of sender and receiver IDs of friends for accepted invitations
    const sentFriendIds = sentInvitationsSnapshot.docs
      .filter((doc) => doc.data().status === 'accepted')
      .map((doc) => doc.data().receiverId);

    const receivedFriendIds = receivedInvitationsSnapshot.docs
      .filter((doc) => doc.data().status === 'accepted')
      .map((doc) => doc.data().senderId);

    // Combine sender and receiver IDs into one array
    const allFriendIds = [...sentFriendIds, ...receivedFriendIds];

    // Use the IDs to fetch the usernames from the users collection
    const q = query(usersRef);
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        userDataMap[userData.uid] = userData.username;
      });
    }
    invitedFriends.value = allFriendIds.filter((friendId) => userDataMap[friendId]).map((friendId) => ({ id: friendId, username: userDataMap[friendId] }));
  }

};
// Display accepted friends when the component is mounted
onMounted(async () => {
  // Populate the invitations array and display accepted friends
  await combineFriends();
});

// Accept an invitation and update the friends list
async function acceptInvitation(invitation: any) {
  try {
    // Update the status of the invitation to 'accepted'
    const invitationDoc = doc(invitationsRef, invitation.id);
    await updateDoc(invitationDoc, { status: 'accepted' });

    // Call combineFriends to update the friends list with the newly accepted friend
    await combineFriends();

    // Remove the accepted invitation from the array
    invitations.value = invitations.value.filter((item) => item.id !== invitation.id);
  
  } catch (error) {
    console.error('Error accepting invitation:', error);
  }
}

async function declineInvitation(invitation: any) {
  try {
    // Delete the invitation document from the collection
    const invitationDoc = doc(invitationsRef, invitation.id);
    await deleteDoc(invitationDoc);


   
    // Remove the declined invitation from the array
    invitations.value = invitations.value.filter((item) => item.id !== invitation.id);
    
    sentInvitations.value = sentInvitations.value =  sentInvitations.value.filter((item) => item.id !==  invitation.id);
  } catch (error) {
    console.error('Error declining invitation:', error);
  }
}

</script>
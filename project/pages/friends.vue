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

          <h1 class="text-3xl font-semibold mb-4"> Your Friends </h1>

          <v-card class="min-w-full max-w-xl ">
            <v-card-text>
              <v-text-field v-model="newFriendEmail" label="Friend's Email" outlined></v-text-field>
              <v-btn @click="inviteFriend">Invite Friend</v-btn>
            </v-card-text>
          </v-card>


        </v-container>

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

    </v-window>
  </v-card>
</template>
  
<script setup lang="ts">
import { collection, updateDoc, deleteDoc, getDocs, query, where, doc, setDoc, getDoc, or } from "firebase/firestore";
import { db } from '~/lib/firebase';
import { ref } from 'vue';



const firebaseUser = useFirebaseUser();
const userId = firebaseUser.value?.uid;


const usersRef = collection(db, "users");

const newFriendEmail = ref('');
//const newFriendUsername = ref('');


let invitedFriends = ref<any[]>([]);
const user = ref();

const q = query(usersRef, where("uid", "==", userId));
const querySnapshot = await getDocs(q);
querySnapshot.forEach((doc) => {
  // doc.data() is never undefined for query doc snapshots
  user.value = doc.data();
});

//Control the sections of the profile page
const tab = ref('tab-0');


const tabItems = [
  'Friends', 'Invites'
];

const userDataMap: { [key: string]: string } = {};


definePageMeta({
  middleware: function (to, from) {
    const user = useFirebaseUser();

    if (!user.value) {
      return navigateTo('/');
    }
  },
});


const invitationsRef = collection(db, 'friends');


const inviteFriend = async () => {
  try {
    // Check if the userId is not null. this shouldn't happen but wouldn't let the code run otherwise
    if (!userId) {
      console.error('User is not authenticated. Unable to send an invitation.');
      return;
    }

    //TODO: change for username and fix firestore rule

    // Check if the friend's email exists in the "users" collection
    //const userQuery = query(usersRef, where('username', '==', newFriendUsername));

    const userQuery = query(usersRef, where('email', '==', newFriendEmail.value));

    const userQuerySnapshot = await getDocs(userQuery);


    if (!userQuerySnapshot.empty) {
      const friendDoc = userQuerySnapshot.docs[0];
      const friendData = friendDoc.data();


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
          senderName: user.value.username,
          status: 'pending'
        });


        // Clear the input field
        newFriendEmail.value = '';
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


// Create an invitations array to store received invitations
const invitations = ref<any[]>([]);


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


async function acceptInvitation(invitation: any) {
  try {
    // Update the status of the invitation to 'accepted'
    const invitationDoc = doc(invitationsRef, invitation.id);
    await updateDoc(invitationDoc, { status: 'accepted' });

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


    console.log(invitations.value + "before");

    // Remove the declined invitation from the array
    invitations.value = invitations.value.filter((item) => item.id !== invitation.id);
    console.log(invitations.value + "after");
  } catch (error) {
    console.error('Error declining invitation:', error);
  }
}


//display accepted friends

onMounted(async () => {
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

    // // Use the IDs to fetch the usernames from the 'users' collection
    const q = query(usersRef);
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        userDataMap[userData.uid] = userData.username;
      });
    }
    invitedFriends.value = allFriendIds.filter((friendId) => userDataMap[friendId]).map((friendId) => ({ id: friendId, username: userDataMap[friendId] }));
    //console.log(invitedFriends.value);
  }

});


</script>
  
<style lang="scss" scoped></style>
<template>
    <v-card>
        <v-tabs v-if="firebaseUser" v-model="tab" align-tabs="start" color="primary">
            <v-tab v-for="(item, index) in tabItems" :key="index" :value="'tab-' + index">
                {{ item }}
            </v-tab>
        </v-tabs>
        <v-window v-model="tab" class="bg-black">

            <Snackbar v-if="snackbar" :text="snackbarText" />

            <v-window-item value="tab-0">
                <v-container class="flex flex-col items-center justify-center">
                    <v-card class="min-w-full max-w-xl">
                        <h1 class="text-3xl font-semibold mt-4 mb-4 pl-4 pr-4"> {{ friendName ? friendName.firstname :
                            'Loading...' }} {{ friendName ? friendName.lastname : 'Loading...' }}</h1>
                        <v-btn v-if="isFromFriendsPage" :variant="variant" class="mx-4 mb-4" @click="inviteFriend">Invite Friend</v-btn>
                    </v-card>
                </v-container>

                <Card class="min-w-full max-w-xl" v-if="isFromAcceptedPage" v-for="(review, index) in friendPosts"
                    :key="review.id" :review="review" :showChangeBtns="true">
                </Card>

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
const friendPosts = ref();
const userName = ref();
const friendName = ref();
const route = useRoute();
const snackbar = ref(false);
const snackbarText = ref();


const props = defineProps({
    variant: {
        type: String as PropType<"outlined" | "flat" | "text" | "elevated" | "tonal" | "plain">,
        default: "outlined", 
    },
});

//need to conditionaly render page
const isFromFriendsPage = route.query.fromFriendsPage === 'fromFriendsPage';
const isFromAcceptedPage = route.query.fromFriendsPage === 'fromAcceptedPage';
const invitationsRef = collection(db, 'friends');


const usersRef = collection(db, "users");
const q = query(usersRef, where("uid", "==", userId));
const querySnapshot = await getDocs(q);
querySnapshot.forEach((doc) => {
    userName.value = doc.data();
});



//Control the sections of the profile page
const tab = ref('tab-0');

const tabItems = [
    'Posts', 'Saved Courses'
];



onMounted(async () => {
    if (route.query.friendId) {
        friendId = route.query.friendId as string;
        friendId = String(friendId);

        const friendQuery = query(usersRef, where("uid", "==", friendId));
        const fQuerySnapshot = await getDocs(friendQuery);

        fQuerySnapshot.forEach((doc) => {
            friendName.value = doc.data();
        });

        friendPosts.value = await queryCollectionByField("posts", "uid", friendId);
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
                    
            const invitationDoc = doc(invitationsRef, invitationDocId);
            const invitationDocSnapshot = await getDoc(invitationDoc);

            if (!invitationDocSnapshot.exists()) {
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



</script>
  
  
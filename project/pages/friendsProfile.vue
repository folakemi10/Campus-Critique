<template>
    <GlobalNav />
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
                    <v-card v-if="isFromFriendsPage" class="min-w-full max-w-xl">
                        <h1 class="text-3xl font-semibold mt-4 mb-4 pl-4 pr-4"> {{ friendName ? friendName.firstname :
                            'Loading...' }} {{ friendName
        ? friendName.lastname : 'Loading...' }}</h1>
                        <v-btn :variant="variant" class="mx-4 mb-4" @click="inviteFriend">Invite Friend</v-btn>
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


                <Card class="min-w-full max-w-xl" v-if="isFromAcceptedsPage" v-for="(review, index) in friendPosts"
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
const allPosts = ref();
const friendPosts = ref();
const userName = ref();
const friendName = ref();
const route = useRoute();
const snackbar = ref(false);
const snackbarText = ref();


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

onMounted(async () => {
  if (userId) {
    allPosts.value = await queryCollectionByField("posts", "uid", userId);
  } else {
    console.log('userId does not exist');
  }
});

onMounted(async () => {
  if (friendId) {
    friendPosts.value = await queryCollectionByField("posts", "uid", friendId);
  } else {
    console.log('friendId does not exist');
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
//const showSnackbar = computed(() => isCurrentUser.value && snackbar.value);


</script>
  
  
<template>
    <div>
        <div class="text-center" v-if="loading">
            <v-progress-circular model-value="20" color="primary" indeterminate></v-progress-circular>
        </div>

        <v-card v-if="!loading">
            <v-card class="min-w-full max-w-xl">
                <div class="flex items-center">
                    <FriendAvatar class="mr-4" size="64" :user='friendName' />
                    <h1 class="text-3xl font-semibold mt-4 mb-4 pl-4 pr-4"> {{ friendName ? friendName.firstname :
                        'Loading...' }} {{ friendName ? friendName.lastname : 'Loading...' }}</h1>
                </div>
                <div class="text-lg mb-4">
                    {{ '@' + friendName ? friendName.username : 'Loading...' }}
                </div>
                <v-btn v-if="isFromFriendsPage" :variant="variant" class="mx-4 mb-4" @click="inviteFriend">Invite
                    Friend</v-btn>
            </v-card>

            <v-tabs v-if="firebaseUser" v-model="tab" align-tabs="start" color="primary">
                <v-tab v-for="(item, index) in tabItems" :key="index" :value="'tab-' + index">
                    {{ item }}
                </v-tab>
            </v-tabs>

            <v-window v-model="tab" class="bg-black">
                <Snackbar v-if="snackbar" :text="snackbarText" />
                <v-window-item value="tab-0">


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
    </div>
</template>

<script setup lang="ts">
import { queryCollectionByField, del, getUser } from '~/lib/db';
import { doc, setDoc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from '~/lib/firebase';
import { useRoute } from 'vue-router';
import { getProfilePic } from '~/lib/storage';
import { sendFriendRequest } from '~/lib/friends';



const firebaseUser = ref();
const userId = ref();
const userDoc = ref();

let friendId = "";
const friendPosts = ref();
const userName = ref();
const friendName = ref();
const route = useRoute();
const snackbar = ref(false);
const snackbarText = ref();

const loading = ref(true);
const authenticated = ref();


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

//Control the sections of the profile page
const tab = ref('tab-0');

const tabItems = [
    'Posts', 'Saved Courses'
];

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

async function loadContent() {
    loading.value = true;

    if (firebaseUser.value !== null) {
        const usersRef = collection(db, "users");

        userId.value = firebaseUser.value?.uid;
        userDoc.value = await getUser(userId.value);

        //console.log(userDoc.value);

        if (route.query.friendId) {
            friendId = route.query.friendId as string;
            friendId = String(friendId);

            const friendQuery = query(usersRef, where("uid", "==", friendId));
            const fQuerySnapshot = await getDocs(friendQuery);

            fQuerySnapshot.forEach((doc) => {
                friendName.value = doc.data();
            });

            //console.log(friendName.value);

            friendPosts.value = await queryCollectionByField("posts", "uid", friendId);
        }
        authenticated.value = true;
    }

    loading.value = false;
}

async function inviteFriend() {
    const send_uid = userId.value as string;
    const recv_uid = friendId as string;

    const result = await sendFriendRequest(send_uid, recv_uid);
    if (result == 0) {
        snackbarText.value = "Invitation sent!";
        snackbar.value = true;
    }
    if (result == 3) {
        snackbarText.value = "An invitation for this friend already exists";
        snackbar.value = true;
    }
}

async function getFriendProfilePic() {
    return await getProfilePic(friendId);
}



</script>
  
  
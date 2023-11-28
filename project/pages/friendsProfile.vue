<template>
    <div>
        <div class="text-center" v-if="loading">
            <v-progress-circular model-value="20" color="primary" indeterminate></v-progress-circular>
        </div>

        <v-card v-if="!loading">
            <v-card class="min-w-full max-w-xl">
                <v-card-text>
                    <div class="flex items-center">
                        <FriendAvatar class="mr-4" size="64" :user='friendName' />
                        <h1 class="text-3xl font-semibold mt-4 mb-4 pl-4 pr-4"> {{ friendName ? friendName.firstname :
                            'Loading...' }} {{ friendName ? friendName.lastname : 'Loading...' }}</h1>
                    </div>
                    <div class="text-lg mb-4">
                        {{ '@' + friendName ? friendName.username : 'Loading...' }}
                    </div>
                </v-card-text>
                <v-btn v-if="isFromFriendsPage" :variant="variant" class="mx-4 mb-4" @click="inviteFriend">Invite
                    Friend</v-btn>
                <v-btn v-if="isFromAcceptedPage" :variant="variant" class="mx-4 mb-4" @click="unFriendUser"> Remove
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

                    <v-container class="flex flex-col items-center justify-center">
                        <Card class="min-w-full max-w-xl" v-if="isFromAcceptedPage" v-for="(review, index) in friendPosts"
                            :key="review.id" :review="review" :showChangeBtns="false">
                        </Card>
                    </v-container>

                </v-window-item>
                <v-window-item value="tab-1">
                    <v-container fluid>
                        <v-container class="flex flex-col items-center justify-center">


                            <v-card class="my-10 min-w-full max-w-xl">
                                <v-card-item v-if="isFromAcceptedPage" v-for="bookmark in userBookmarks" :key="bookmark.id"
                                    @click="navigateToCourseProfile(bookmark.reviewedObjectId)">
                                    <v-card-title>
                                        {{ bookmark.reviewedObjectName }}
                                    </v-card-title>
                                </v-card-item>
                            </v-card>

                        </v-container>
                    </v-container>
                </v-window-item>
            </v-window>
        </v-card>
    </div>
</template>

<script setup lang="ts">
import { queryCollectionByField, getUser } from '~/lib/db';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from '~/lib/firebase';
import { useRoute } from 'vue-router';
import { getProfilePic } from '~/lib/storage';
import { sendFriendRequest, unFriend } from '~/lib/friends';



const firebaseUser = ref();
const userId = ref();
const userDoc = ref();

let friendId = "";
const friendPosts = ref();
const friendName = ref();
const route = useRoute();
const snackbar = ref(false);
const snackbarText = ref();

const loading = ref(true);
const authenticated = ref();
const userBookmarks = ref<any[]>([]);;
const props = defineProps({
    variant: {
        type: String as PropType<"outlined" | "flat" | "text" | "elevated" | "tonal" | "plain">,
        default: "outlined",
    },
});

//need to conditionaly render page
const isFromFriendsPage = route.query.friendRequestStatus === 'pending';
const isFromAcceptedPage = route.query.friendRequestStatus === 'accepted';
// const invitationsRef = collection(db, 'friends');

//Control the sections of the profile page
const tab = ref('tab-0');

const tabItems = [
    'Posts', 'Bookmarks'
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
            const bookmarks = await queryCollectionByField('bookmarks', 'userId', userId.value);
            userBookmarks.value = bookmarks.map((obj) => ({ ...obj }));
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
    else if (result == 3) {
        snackbarText.value = "An invitation for this friend already exists";
        snackbar.value = true;
    }
    else {
        snackbarText.value = "Your invitation was not sent";
        snackbar.value = true;
    }
}

async function unFriendUser() {
    const send_uid = userId.value as string;
    const recv_uid = friendId as string;
    const result = await unFriend(send_uid, recv_uid);
    if (result == 0) {
        snackbarText.value = "You are no longer friends";
        snackbar.value = true;
    }
    if (result == 3) {
        snackbarText.value = "Error unfriending user";
        snackbar.value = true;
    }
}


async function getFriendProfilePic() {
    return await getProfilePic(friendId);
}

async function navigateToCourseProfile(reviewedObjectId: any) {
    await navigateTo({
        path: '/details/',
        query: {
            id: reviewedObjectId,
        },
        replace: true,
    })
};


</script>
  
  
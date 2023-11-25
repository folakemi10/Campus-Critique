<template>
  <v-card v-if="authenticated">
    <v-card class="min-w-full max-w-xl ">
      <v-card-text>
        <div class="flex items-center">
          <Avatar class="mr-4" size="64" :user='userDoc' />
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
                <Avatar class="mr-4" size="64" :user='userDoc' />
                <ProfilePicBtn :uid_prop="userDoc.uid" @update-profile-pic='updatePicture' />
                <!--  -->
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
      <v-window-item value="tab-0">
        <v-container class="flex flex-col items-center justify-center">

          <Card v-for="(review, index) in allPosts" :key="review.id" :review="review" :showChangeBtns="true"
            @open-edit-modal="openEditModalForReview" :deletePost="deletePost"></Card>

        </v-container>

        <EditPostModal v-model="isActive" :reviewToEdit="reviewToEdit" @close-edit-modal="closeEditModal" />
      </v-window-item>


      <v-window-item value="tab-1">
        <v-container fluid>
          <v-container class="flex flex-col items-center justify-center">
            <v-list>
             <v-list-item v-for="bookmark in userBookmarks" :key="bookmark.id" @click="navigateToCourseProfile(bookmark.reviewedObjectId)">
              <v-list-item-content>
                <v-list-item-title>{{ bookmark.reviewedObjectName }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            </v-list>

          </v-container>

        </v-container>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script setup lang="ts">
import { queryCollectionByField, del, getUser } from '~/lib/db';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from '~/lib/firebase';
import { addDoc } from "firebase/firestore";
import { doc, updateDoc } from "firebase/firestore";


const firebaseUser = useFirebaseUser();
let userId = "";

const authenticated = ref(false);

const userDoc = ref();
const editedUserDoc = ref();
const dialog = ref(false);
const userBookmarks = ref([]); 

const rules = ref({
  required: (value: any) => !!value || "Cannot be empty",
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

interface Post {
  id: string;
  // Other properties of a post
}

const allPosts = ref<Post[]>([]);

async function loadContent() {
  if (firebaseUser.value != null) {
    userId = firebaseUser.value?.uid;
    userDoc.value = await getUser(userId);

    if (userId) {
      allPosts.value = await queryCollectionByField("posts", "uid", userId);
    } else {
      console.log('userId does not exist');
    }

    // fetching user bookmarks for saved courses
    userBookmarks.value = await queryCollectionByField("bookmarks", "userId", userId);
    //console.log(userBookmarks.value)
  
    authenticated.value = true;
  } else {
    authenticated.value = false;
    //navigateTo('/');
  }
}

//Control the sections of the profile page
const tab = ref('tab-0');

const tabItems = computed(() => {
  return ['Posts (' + allPosts.value.length + ")", 'Saved Courses'];
});

async function deletePost(id: string) {

  //console.log("delete post");
  try {
    await del("posts", id);

    allPosts.value = await queryCollectionByField("posts", "uid", userId);

    // const postIndex = allPosts.value.findIndex((p: { id: any; }) => p.id === id);
    // if (postIndex !== -1) {
    //   allPosts.value.splice(postIndex, 1); // Remove the card from the array
    // }
  } catch (e) {
    console.log(e);
  }
}

const isActive = ref(false);
const reviewToEdit = ref();

const openEditModalForReview = (review: any) => {
  reviewToEdit.value = review;
  isActive.value = true;
};

const closeEditModal = async (editedReview: any) => {
  allPosts.value = await queryCollectionByField("posts", "uid", userId);

  // const index = allPosts.value.findIndex((review: any) => review.id === editedReview.id);

  // if (index !== -1) {
  //   allPosts.value[index] = editedReview;
  // }
  isActive.value = false;
};


const saveProfileChanges = async () => {
  //console.log("saving changes");

  if (editedUserDoc.value.username == '' || editedUserDoc.value.firstname === '' || editedUserDoc.value.lastname === '') {
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

const { profilePicUrl, updatePicture } = inject('picture') as any;

async function navigateToCourseProfile(reviewedObjectId) {
  await navigateTo({
    path: '/details/',
    query: {
      id: reviewedObjectId,
    },
    replace: true,
  })
};


</script>
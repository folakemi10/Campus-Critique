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
        <v-container fluid class="flex-vertical justify-center">
          <v-card class="mx-10	my-10 ">
            <v-card-text>
              <h1 class="text-3xl font-semibold mb-4"> {{ userName.firstname }} {{ userName.lastname }}</h1>
              <div class="text-lg mb-4">
                Number of Reviews: {{ allPosts ? allPosts.length : 'Loading...' }}
              </div>
              <LogoutBtn />
            </v-card-text>
          </v-card>

          <Card v-for="(review, index) in allPosts" :key="index" :review="review"></Card>

        </v-container>
      </v-window-item>

      <v-window-item value="tab-1">
        <v-container fluid>
          <Calendar />
        </v-container>
      </v-window-item>
    </v-window>
  </v-card>
</template>




<script setup lang="ts">
import { queryCollectionByField } from '~/lib/db';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from '~/lib/firebase';

const firebaseUser = useFirebaseUser();
const userId = firebaseUser.value?.uid;

const allPosts = ref();
const userName = ref();


onMounted(async () => {
  //console.log('Entering onMounted hook');

  if (userId) {
    allPosts.value = await queryCollectionByField("posts", "uid", userId);
  } else {
    console.log('userId does not exist');
  }

  // console.log('Exiting onMounted hook');
});

const usersRef = collection(db, "users");
const q = query(usersRef, where("uid", "==", userId));
const querySnapshot = await getDocs(q);
querySnapshot.forEach((doc) => {
  // doc.data() is never undefined for query doc snapshots
  userName.value = doc.data();
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
  'Posts', 'Schedule'
];


</script>

<style lang="scss" scoped>

</style>


<!-- <script>
import { queryCollectionByField } from "~/lib/db"; // Replace with your Firebase package import

export default {
  data() {
    return {
      allPosts: [],
      firebaseUser: useFirebaseUser().value,
    }
  },
  async mounted() {
    this.allPosts = await queryCollectionByField("posts", "uid", this.firebaseUser.uid );

    return {
      allPosts: [],
      firebaseUser: null
    }
  },
  computed: {
    getUsername() {
      const firebaseUser = useFirebaseUser();
    //   if (!firebaseUser.value.displayName) {
    //     return "Bad Registeration. Delete user from database and register again";
    //   }
      const username = "test";
      return username;
    }
  }
}
</script>
   -->
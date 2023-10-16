<template>
  <v-container class="flex-vertical justify-center">
    <router-link to="/">
      <v-btn>
        return
      </v-btn>
    </router-link>

    <v-card class="mx-10	my-10 ">
      <v-card-text>
        <h1 class="text-3xl font-semibold mb-4"> {{ getUsername }} </h1>
        <div class="text-lg mb-4">
          Number of Reviews: {{ filteredPosts.length }}
        </div>
      </v-card-text>
    </v-card>
    
    <Card v-for="(review, index) in filteredPosts" :key="index" :review="review"></Card>
  </v-container>
</template>
  
<script>
import { queryEntireCollection } from "~/lib/db"; // Replace with your Firebase package import

export default {
  data() {
    return {
      allPosts: [],
      firebaseUser: null
    }
  },
  async mounted() {
    this.firebaseUser = useFirebaseUser();;
    this.allPosts = await queryEntireCollection("posts");
  },
  computed: {
    filteredPosts() {
      if (!this.firebaseUser || !this.allPosts || this.allPosts.length === 0) {
        return [];
      }
      const userId = this.firebaseUser.uid;
      return this.allPosts.filter((post) => post.uid === userId);
    },
    getUsername() {
      if (!this.firebaseUser || !this.allPosts || this.allPosts.length === 0) {
        return "Bad Registeration. Delete user from database and register again";
      }
      const firebaseUser = useFirebaseUser();
      const username = firebaseUser.value.displayName;
      return username;
    }
  }
}
</script>
  
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
          Number of Reviews: {{ allPosts.length }}
        </div>
      </v-card-text>
    </v-card>
    
    <Card v-for="(review, index) in allPosts" :key="index" :review="review"></Card>
  </v-container>
</template>
  
<script>
import { queryCollectionByField } from "~/lib/db"; // Replace with your Firebase package import

export default {
  data() {
    return {
      allPosts: [],
      firebaseUser: null
    }
  },
  async mounted() {
    this.firebaseUser = useFirebaseUser();;
    return {
      allPosts: [],
      firebaseUser: null
    }
  },
  async mounted() {
    this.firebaseUser = useFirebaseUser();;
    this.allPosts = await queryCollectionByField("posts", "uid", this.firebaseUser.uid );
  },
  computed: {
    getUsername() {
      const firebaseUser = useFirebaseUser();
      if (!firebaseUser.value.displayName) {
        return "Bad Registeration. Delete user from database and register again";
      }
      const username = firebaseUser.value.displayName;
      return username;
    }
  }
}
</script>
  
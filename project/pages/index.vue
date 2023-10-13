<template>
  <GlobalNav />
  
  <v-container v-if="!firebaseUser">
    <h1 class="text-slate-900 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-center dark:text-white">
      Welcome to Campus Critique!</h1>

    <v-btn to="/register">
      Get Started
    </v-btn>
    <v-text-field label="Search" placeholder="Search for a course or professor" type=""></v-text-field>
  </v-container>

  <v-container v-if="firebaseUser" class="flex-vertical justify-center">
    <Card v-for="(review, index) in allPosts" :key="index" :review="review"></Card>
  </v-container>
</template>
  
<script>
export default {
  data() {
    return {
      allPosts: [],
      firebaseUser: useFirebaseUser()
    }
  },
  async mounted() {
    this.allPosts = await queryEntireCollection("posts");
  }
}
import { queryEntireCollection } from "~/lib/db";


</script>

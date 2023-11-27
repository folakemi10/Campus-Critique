<template>
  <div>
    <div class="text-center" v-if="loading">
      <v-progress-circular model-value="20" color="primary" indeterminate></v-progress-circular>
    </div>

    <v-container v-if="!authenticated && !loading" class="flex flex-col md:flex-row">
      <v-col class="flex items-center justify-between flex-wrap text-center align-center">
        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-700 dark:text-white w-full">
          Welcome to Campus Critique!
        </h1>
        <p>
          Discover, rate, and share your academic journey with CourseRave! Whether you're navigating the vast sea of
          courses or seeking the best professors, we've got you covered. Share your insights, experiences, and materials
          with friends to create a community that thrives on knowledge.
        </p>
        <div>
          <v-card>
            <v-card-text>
              📚 Rate Courses: Dive into a world of unbiased course reviews. Your fellow students have spoken, helping you
              choose the classes that align with your academic goals.
            </v-card-text>
          </v-card>

          <v-card>
            <v-card-text>
              👨‍🏫 Evaluate Professors: Get the inside scoop on professors. From teaching styles to accessibility, make
              informed decisions that set you up for success.
            </v-card-text>
          </v-card>

          <v-card>
            <v-card-text>
              📤 Share with Friends: Build a network of academic enthusiasts! Share your favorite courses, top-rated
              professors, and valuable study materials with friends who share your passion for learning.
            </v-card-text>
          </v-card>

          <v-card>
            <v-card-text>
              📑 Access Course Materials: Say goodbye to the struggle of finding quality study resources. Explore a
              treasure
              trove of course materials shared by students who aced the class.
            </v-card-text>
          </v-card>
        </div>
        <v-btn class="bg-primary-button mt-4" to="/register">
          Join Us
        </v-btn>
      </v-col>

      <v-col>
        <v-img src="../assets/illustration.svg"></v-img>
      </v-col>

    </v-container>

    <v-container v-if="authenticated && !loading" class="flex-vertical justify-center">
      <Search />
      <!-- <ClientOnly> -->
      <Card v-for="(review, index) in allPosts" :key="index" :review="review" :showChangeBtns="false"></Card>
      <!-- </ClientOnly> -->
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { queryEntireCollection, queryOrderedCollection } from "~/lib/db";
import { getFriendPosts } from "~/lib/friends";

// data
const firebaseUser: any | null = ref(null);
const authenticated = ref();
const loading = ref(true);

const allPosts = ref();
const allCourses = ref();
const allProfessors = ref();


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

  if (!firebaseUser.value) {
    //console.log("No User, Clearing Data");
    authenticated.value = false;
  }
  else {
    //console.log("User exists, fetch data");
    // allPosts.value = await queryOrderedCollection('posts', 'modifiedAt', 'desc');
    allPosts.value = await getFriendPosts(firebaseUser.value.uid);
    allCourses.value = await queryEntireCollection('classes');
    allProfessors.value = await queryEntireCollection('profs');
  }

  loading.value = false;
}



</script>

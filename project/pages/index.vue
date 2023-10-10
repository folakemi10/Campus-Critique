<template>
  <v-btn @click="logout" v-if="firebaseUser">
    Log Out
  </v-btn>
  <GlobalNav />

  <v-container v-if="!firebaseUser">
    <h1 class="text-slate-900 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-center dark:text-white">
      Welcome to Campus Critique!</h1>


    <div class="flex justify-center">
      <v-btn to="/register">
        Get Started
      </v-btn>
      <v-text-field label="Search" placeholder="Search for a course or professor" type=""></v-text-field>

    </div>
  </v-container>

  <div v-else class="flex-vertical justify-center">

    <Card v-for="(review, index) in reviews" :key="index" :review="review"></Card>

  </div>
</template>
  
<script setup>

const firebaseUser = useFirebaseUser();


const reviews = [
  {
    "username": "SarahCoders",
    "starRating": 5,
    "reviewText": "This course was absolutely fantastic! The instructor explained complex concepts in a simple and engaging way. The hands-on projects were challenging but incredibly rewarding. I would highly recommend this course to anyone looking to learn computer science."
  },
  {
    "username": "CodeMaster123",
    "starRating": 4,
    "reviewText": "Great course overall. The content was comprehensive, and the instructor was knowledgeable. The only downside was that some of the assignments were a bit too time-consuming, but I learned a lot."
  },
  {
    "username": "TechNoob",
    "starRating": 2,
    "reviewText": "I struggled with this course. The material was presented in a confusing manner, and the assignments were too difficult for a beginner like me. I wish there was more guidance and support from the instructor."
  },
  {
    "username": "CSWhiz",
    "starRating": 5,
    "reviewText": "I've taken multiple computer science courses, and this one stands out as one of the best. The instructor's passion for the subject was evident, and the course materials were well-organized. I feel much more confident in my coding skills now!"
  },
  {
    "username": "DataNerd42",
    "starRating": 4,
    "reviewText": "This course was excellent for learning the fundamentals of computer science. The lectures were clear, and the assignments were relevant. My only suggestion would be to update some of the outdated examples used in the course."
  }

]

</script>

<style scoped></style>
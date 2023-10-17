<template>
  <GlobalNav />
  <v-form @submit.prevent="onSubmit">
    <v-card class="m-6">
      <v-card-title>I want to rate a: </v-card-title>
      <v-radio-group v-model="typeSelection" inline @input="onChange()">
        <v-radio label="Course" value="course"></v-radio>
        <v-radio label="Professor" value="professor"></v-radio>
      </v-radio-group>
    </v-card>

    <div v-if="revealForm">
      <v-card class="m-6" v-if="formType == 'course'">
        <v-card-title> Which course are you reviewing? </v-card-title>
        <v-autocomplete label="Courses" v-model="review.reviewedObject"
          :items="['CSE131: Introduction to Computer Science', 'CSE204A: Introduction to Web Development', 'Class3', 'Class4', 'Class5', 'Class6']"></v-autocomplete>
      </v-card>

      <v-card class="m-6" v-if="formType == 'professor'">
        <v-card-title>Which professor are you reviewing? </v-card-title>
        <v-autocomplete label="Professors" v-model="review.reviewedObject"
          :items="['John Doe', 'John Doe', 'John Doe', 'John Doe', 'John Doe', 'John Doe']"></v-autocomplete>
      </v-card>

      <v-card class="m-6">
        <v-rating hover v-model="review.rating"></v-rating>
      </v-card>

      <v-card class="m-6">
        <v-card-title>Write a Review: </v-card-title>
        <v-container fluid>
          <v-textarea name="input-7-1" variant="filled" label="Write your review" auto-grow model-value=""
            v-model="review.textReview"></v-textarea>
        </v-container>
      </v-card>

      <v-btn type="submit" block class="mt-2" text="Submit"></v-btn>

    </div>
  </v-form>
</template>

<script setup>
import { collection, getDocs } from "firebase/firestore";
import { db } from "~/lib/firebase";
import { add, set } from "~/lib/db";

const firebaseUser = useFirebaseUser();
const userId = firebaseUser.value.uid;

const review = ref({
  uid: userId,
  reviewedObject: '',
  rating: 0,
  textReview: '',
})

async function onSubmit() {
  console.log(review.value);
  await add("posts", review.value);

  await navigateTo('/');

}

let revealForm = ref(false);
let formType = ref('');

const typeSelection = ref(null);

function onChange() {
  if (typeSelection.value === 'course') {
    revealForm.value = true;
    formType.value = 'course';
  } else {
    revealForm.value = true;
    formType.value = 'professor';
  }

}

definePageMeta({
  middleware: function (to, from) {
    const user = useFirebaseUser();

    if (!user.value) {
      return navigateTo('/');
    }
  },
});

</script>

<style lang="scss" scoped></style>
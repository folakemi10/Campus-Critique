<template>
  <GlobalNav />
  <v-container v-if="firebaseUser">
    <v-form @submit.prevent="onSubmit" v-model="valid">
      <v-card class="m-6">
        <v-card-title>I want to rate a: </v-card-title>
        <v-radio-group v-model="typeSelection" inline @input="onChange()" :rules="rules.required">
          <v-radio label="Course" value="course"></v-radio>
          <v-radio label="Professor" value="professor"></v-radio>
        </v-radio-group>
      </v-card>

      <div v-if="revealForm">
        <v-card class="m-6" v-if="formType == 'course'">
          <v-card-title> Which course are you reviewing? </v-card-title>
          <v-autocomplete label="Courses" v-model="selectedClass" :rules="rules.required" :items="allCourses"
            return-object></v-autocomplete>
        </v-card>

        <v-card class="m-6" v-if="formType == 'course'">
          <v-card-title> Which professor taught this course? </v-card-title>
          <v-autocomplete label="Professors" v-model="selectedProf" :rules="rules.required" :items="allProfessors"
            item-text="firstname" item-value="id" return-object></v-autocomplete>
        </v-card>

        <v-card class="m-6" v-if="formType == 'professor'">
          <v-card-title>Which professor are you reviewing? </v-card-title>
          <v-autocomplete label="Professors" v-model="selectedProf" :rules="rules.required" :items="allProfessors"
            item-text="firstname" item-value="id" return-object></v-autocomplete>
        </v-card>

        <v-card class="m-6" v-if="formType == 'professor'">
          <v-card-title>Which course did you take with this professor? </v-card-title>
          <v-autocomplete label="Courses" v-model="selectedClass" :rules="rules.required" :items="allCourses"
            return-object></v-autocomplete>
        </v-card>

        <v-card class="m-6">
          <v-card-title>How would you rate this{{ formType == 'course' ? ' class' : ' professor' }}? </v-card-title>
          <v-rating hover v-model="review.rating" :rules="rules.required" clearable></v-rating>
        </v-card>

        <v-card class="m-6">
          <v-card-title>Write a Review: </v-card-title>
          <v-container fluid>
            <v-textarea name="input-7-1" variant="filled" label="Write your review" auto-grow :rules="rules.required"
              v-model="review.textReview"></v-textarea>
          </v-container>
        </v-card>

        <v-btn type="submit" block class="mt-2" text="Submit"></v-btn>

      </div>
    </v-form>
  </v-container>

</template>

<script setup lang="ts">
import { add, queryEntireCollection, set } from "~/lib/db";

//getting prof and class data from db
const allCourses = ref();
const allProfessors: Ref<string[]> = ref([]);

const selectedClass = ref();
const selectedProf = ref();

const valid = ref();

onMounted(async () => {
  allCourses.value = await queryEntireCollection('classes');
  const professorsRef = await queryEntireCollection('profs');

  professorsRef.forEach((doc: any) => {
    const title = doc.firstname + " " + doc.lastname;
    doc = { ...doc, title };

    allProfessors.value.push(doc);
  });
}
);


//functions to watch the input of the autocompletes
watch(selectedClass, async () => {
  review.value.class = selectedClass.value.id
  console.log(review.value);
})

watch(selectedProf, async () => {
  review.value.professor = selectedProf.value.id
  console.log(review.value);
})




//check user auth + userId
const firebaseUser = useFirebaseUser();
const userId = firebaseUser.value?.uid;

let revealForm = ref(false);

//sets form type to "course" or "professor" based on typeSelection, which is is a ref for the radio buttons"
let formType = ref('');
//data model for whether the Course or Professor radio button is selected
const typeSelection = ref(null);

const review = ref({
  uid: userId,
  reviewedObject: typeSelection,
  class: null,
  professor: null,
  rating: 0,
  textReview: '',
})

async function onSubmit() {
  if (valid.value) {
    await add("posts", review.value);
    await navigateTo('/');
  } else {
    alert("All fields required!");
  }
}

//rules for all questions in the review form
const rules = ref({
  required: [(value: string) => !!value || "This question is required"],
});


//function to display the rest of the form depending on selection
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

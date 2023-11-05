<template>
  <GlobalNav />
  <v-container v-if="firebaseUser">
    <v-form @submit.prevent="onSubmit" v-model="valid">
      <v-card class="m-6">
        <v-card-title>Rate: {{ reviewedObjectName ? reviewedObjectName : 'Loading...' }} </v-card-title>
        <!-- <v-radio-group v-model="typeSelection" inline @input="onChange()" :rules="rules.required">
          <v-radio label="Course" value="course"></v-radio>
          <v-radio label="Professor" value="professor"></v-radio>
        </v-radio-group> -->
      </v-card>

        <v-card class="m-6" v-if="reviewedObject == 'course'">
          <v-card-title> Which professor taught this course? </v-card-title>
          <v-autocomplete label="Professors" v-model="selectedProf" :rules="rules.required" :items="allProfessors"
            item-text="firstname" item-value="id" return-object></v-autocomplete>
        </v-card>


        <v-card class="m-6" v-if="reviewedObject == 'professor'">
          <v-card-title>Which course did you take with this professor? </v-card-title>
          <v-autocomplete label="Courses" v-model="selectedClass" :rules="rules.required" :items="allCourses"
            return-object></v-autocomplete>
        </v-card>

        <v-card class="m-6">
          <v-card-title>How would you rate this{{ reviewedObject == 'course' ? ' class' : ' professor' }}? </v-card-title>
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

    </v-form>
  </v-container>
</template>

<script setup lang="ts">
import { queryEntireCollection, set } from "~/lib/db";
import { addDoc, collection, doc, getDoc, getDocs, query, where, serverTimestamp, FieldValue } from "firebase/firestore";
import { db } from '~/lib/firebase';

//getting prof and class data from db
const allCourses = ref();
const allProfessors: Ref<string[]> = ref([]);

const selectedClass = ref();
const selectedProf = ref();

const valid = ref();

//check user auth + userId
const firebaseUser = useFirebaseUser();
const userId = firebaseUser.value?.uid;

const reviewedObject = ref('');
const reviewedObjectId = String(useRoute().query.id);
const reviewedObjectName = await getObject(reviewedObjectId);


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
  review.value.class = selectedClass.value.id;
  review.value.professor = reviewedObjectId;
  console.log(review.value);
})

watch(selectedProf, async () => {
  review.value.professor = selectedProf.value.id;
  review.value.class = reviewedObjectId;
  console.log(review.value);
})


const review = ref({
  uid: userId,
  reviewedObject: reviewedObject.value,
  class: '',
  professor: '',
  rating: 0,
  textReview: '',
  createdAt: null as FieldValue | null,
  modifiedAt: null as FieldValue | null
})



//rules for all questions in the review form
const rules = ref({
  required: [(value: string) => !!value || "This question is required"],
});

definePageMeta({
  middleware: function (to, from) {
    const user = useFirebaseUser();

    if (!user.value) {
      return navigateTo('/');
    }
  },
});





async function getObject(id: string) {
  const courseDocRef = doc(db, 'classes', id);
  const profDocRef = doc(db, 'profs', id);

  const courseDoc = await getDoc(courseDocRef);
  const profDoc = await getDoc(profDocRef);

  if (courseDoc.exists()) {
    reviewedObject.value = "course";
    return courseDoc.data().title;
  }
  if (profDoc.exists()) {
    reviewedObject.value = "professor";
    return profDoc.data().title;
  }
  else return id;
}

async function addPost() {
  // apply timestamp
  const ts = serverTimestamp();
  review.value.createdAt = ts;
  review.value.modifiedAt = ts;

  const colRef = collection(db, "posts");
  const docRef = await addDoc(colRef, review.value);
}

async function onSubmit() {
  if (valid.value) {
    await addPost();
    await navigateTo('/');
  } else {
    //alert("All fields required!");

    //TODO: ADD SNACKBAR HERE THAT ALERTS THE USER THEY NEED TO COMPLETE ALL PARTS OF THE FORM
  }
}


// //function to display the rest of the form depending on selection
// function onChange() {
//   if (typeSelection.value === 'course') {
//     revealForm.value = true;
//     formType.value = 'course';
//   } else {
//     revealForm.value = true;
//     formType.value = 'professor';
//   }

// }

</script>

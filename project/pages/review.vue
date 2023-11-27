<template>
  <div>
    <div class="text-center" v-if="loading">
      <v-progress-circular model-value="20" color="primary" indeterminate></v-progress-circular>
    </div>
    <v-container v-if="!loading">
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
            <v-textarea variant="filled" label="Write your review" auto-grow :rules="rules.required"
              v-model="review.textReview"></v-textarea>
          </v-container>
        </v-card>

        <v-card class="m-6">
          <v-card-title>Add Attachments: </v-card-title>
          <v-card-subtitle>Any files attached to this review can be viewed by all your friends.</v-card-subtitle>

          <v-card-actions>
            <v-file-input v-model="selectedFiles" color="primary" label="Upload Files" placeholder="Select your files"
              prepend-icon="mdi-paperclip" variant="outlined" multiple clearable>
            </v-file-input>

            <v-btn @click="addFiles">
              Add Files
            </v-btn>
          </v-card-actions>
          <v-card-item>
            <v-chip-group>
              <FileChip v-for="(file, index) in allFiles" :key="index" :icon="`mdi-close-circle-outline`"
                :fileName="file.name" @click="removeFile(index)" />
            </v-chip-group>
          </v-card-item>

          <v-container fluid>

          </v-container>
        </v-card>

        <v-btn type="submit" block class="mt-2" text="Submit"></v-btn>

      </v-form>
    </v-container>
  </div>
</template>

<script setup lang="ts">

function addFiles() {
  //concatenate the currently selected ones to the list of all files
  const concatenatedFiles = [...allFiles.value, ...selectedFiles.value];
  //set the concatenated list to be the allFiles value
  allFiles.value = concatenatedFiles;
  //reset the currently selected files
  selectedFiles.value = [];
  //console.log(allFiles.value);
}


function removeFile(index: any) {
  // Remove the clicked file from the allFiles array
  allFiles.value.splice(index, 1);
}

import { queryEntireCollection, set } from "~/lib/db";
import { addDoc, collection, doc, getDoc, getDocs, query, where, serverTimestamp, FieldValue, Firestore } from "firebase/firestore";
import { db } from '~/lib/firebase';
import { uploadFiles } from "~/lib/storage";

//getting prof and class data from db
const allCourses = ref();
const allProfessors: Ref<string[]> = ref([]);

const selectedClass = ref();
const selectedProf = ref();


const allFiles: Ref<File[]> = ref([]);
const selectedFiles: Ref<File[]> = ref([]);

const valid = ref();

//check user auth + userId
const firebaseUser = ref();
const userId = ref();
const authenticated = ref();
const loading = ref(true);

const reviewedObject = ref();
const reviewedObjectId = String(useRoute().query.id);
const reviewedObjectName = ref();

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

  if (firebaseUser.value !== null) {
    userId.value = firebaseUser.value?.uid;

    allCourses.value = await queryEntireCollection('classes');

    const professorsRef = await queryEntireCollection('profs');
    professorsRef.forEach((doc: any) => {
      const title = doc.firstname + " " + doc.lastname;
      doc = { ...doc, title };

      allProfessors.value.push(doc);
    });

    reviewedObjectName.value = await getObject(reviewedObjectId);
  } else {
    authenticated.value = false;
  }

  loading.value = false;
}


//functions to watch the input of the autocompletes
watch(selectedClass, async () => {
  review.value.class = selectedClass.value.id;
  review.value.professor = reviewedObjectId;
  //console.log(review.value);
})

watch(selectedProf, async () => {
  review.value.professor = selectedProf.value.id;
  review.value.class = reviewedObjectId;
  //console.log(review.value);
})


const review = ref({
  uid: userId,
  reviewedObject: '',
  class: '',
  professor: '',
  rating: 0,
  textReview: '',
  createdAt: null as FieldValue | null,
  modifiedAt: null as FieldValue | null
})


const rules = ref({
  required: [(value: string) => !!value || "This question is required"],
});


async function getObject(id: string) {
  // console.log("getting object");
  const courseDocRef = doc(db, 'classes', id);
  const profDocRef = doc(db, 'profs', id);

  const courseDoc = await getDoc(courseDocRef);
  const profDoc = await getDoc(profDocRef);

  console.log(reviewedObject.value);

  if (courseDoc.exists()) {
    reviewedObject.value = "course";
    review.value.reviewedObject = reviewedObject.value;
    return courseDoc.data().title;
  }
  if (profDoc.exists()) {
    reviewedObject.value = "professor";
    review.value.reviewedObject = reviewedObject.value;
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
  return docRef.id;
}

async function onSubmit() {
  //if valid is true (meaning all the required questions of the form were filled out)
  if (valid.value) {
    try {
      //add the post to the posts collection and return the document id
      const docId = await addPost();

      //if allFiels contains files, upload them to storage according to the post's id
      if (allFiles.value.length > 0) {
        uploadFiles(docId, allFiles.value);
      }

      //navigate back to homepage
      await navigateTo('/');

      //console.log(docId);
    } catch (e) {
      //catch any errors
      console.log(e);
      //TODO: ADD SNACKBAR HERE TO ALERT USER OF SUBMISSION ERROR
    }

  } else {
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

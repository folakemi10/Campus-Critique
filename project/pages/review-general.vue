<template>
    <v-container>
        <v-form @submit.prevent="onSubmit" v-model="valid">
            <v-card class="m-6">
                <v-card-title>I want to rate a: </v-card-title>
                <v-radio-group v-model="typeSelection" inline @input="onChange()">
                    <v-radio label="Course" value="course"></v-radio>
                    <v-radio label="Professor" value="professor"></v-radio>
                </v-radio-group>
            </v-card>

            <div v-if="revealForm">
                <!-- Course Selected -->
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

                <!-- Professor Selected -->
                <v-card class="m-6" v-if="formType == 'professor'">
                    <v-card-title>Which professor are you reviewing? </v-card-title>
                    <v-autocomplete label="Professors" v-model="selectedProf" :rules="rules.required" :items="allProfessors"
                        return-object></v-autocomplete>
                </v-card>

                <v-card class="m-6" v-if="formType == 'professor'">
                    <v-card-title>Which course did you take with this professor? </v-card-title>
                    <v-autocomplete label="Courses" v-model="selectedClass" :rules="rules.required" :items="allCourses"
                        return-object></v-autocomplete>
                </v-card>


                <v-card class="m-6">
                    <v-rating hover v-model="review.rating" :rules="rules.required"></v-rating>
                </v-card>


                <v-card class="m-6">
                    <v-card-title>Write a Review: </v-card-title>
                    <v-container fluid>
                        <v-textarea name="input-7-1" variant="filled" label="Write your review" auto-grow
                            v-model="review.textReview" :rules="rules.required"></v-textarea>
                    </v-container>
                </v-card>

                <v-card class="m-6">
                    <v-card-title>Add Attachments: </v-card-title>
                    <v-card-subtitle>Any files attached to this review can be viewed by all your friends.</v-card-subtitle>

                    <v-card-actions>
                        <v-file-input v-model="selectedFiles" color="primary" label="Upload Files"
                            placeholder="Select your files" prepend-icon="mdi-paperclip" variant="outlined"
                            @change="addFiles" multiple clearable>
                        </v-file-input>

                        <!-- <v-btn @click="addFiles">
                            Add Files
                        </v-btn> -->
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
            </div>
        </v-form>
    </v-container>
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
    } else {
        authenticated.value = false;
    }

    loading.value = false;
}

let revealForm = ref(false);
let formType = ref('');

const typeSelection = ref(null);

//function to display the rest of the form depending on selection
function onChange() {
    if (typeSelection.value === 'course') {
        revealForm.value = true;
        formType.value = 'course';
    } else {
        revealForm.value = true;
        formType.value = 'professor';
    }

    review.value.reviewedObject = formType.value;

    //console.log(review.value);
}


//functions to watch the input of the autocompletes
watch(selectedClass, async () => {
    review.value.class = selectedClass.value.id;
    //console.log(review.value);
})

watch(selectedProf, async () => {
    review.value.professor = selectedProf.value.id;
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
        //console.log(review.value);
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

</script>
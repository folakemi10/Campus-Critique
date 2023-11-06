<template>
  <v-card class="my-10 min-w-full max-w-xl">
    <v-card-item>
      <v-row align-items="start">
        <v-col cols="auto">
          <!-- User who made the post -->
          {{ username }}
        </v-col>

        <v-col cols="auto">
          <div class="d-flex">
            <v-rating :model-value="review?.rating" color="amber" density="compact" half-increments readonly
              size="small"></v-rating>
            <v-card-subtitle class="ml-2">{{ review?.rating }}</v-card-subtitle>
          </div>
        </v-col>

        <v-spacer></v-spacer>

        <v-col cols="auto">
          <div v-if="showChangeBtns">
            <v-btn density="comfortable" @click="openEditModal" icon="mdi-pencil"></v-btn>
            <v-btn density="comfortable" @click="props.deletePost(props.review?.id)" icon="mdi-delete"></v-btn>
          </div>
        </v-col>
      </v-row>
    </v-card-item>

    <!--Main class / professor reviewed: checks if the reviewed object is a class or prof and displays the correct one (TODO: query from the db using getCourse() or getProfessor
        ())-->
    <v-card-title>
      {{ review?.reviewedObject === "course" ? course : prof }}
    </v-card-title>

    <!--Secondary class / professor reviewed: checks if the reviewed object is a class or prof and displays the data secondary to the reviewed object (TODO: query from the db using getCourse() or getProfessor
        ()))-->
    <v-card-subtitle>
      {{ review?.reviewedObject === "course" ? prof : course }}
    </v-card-subtitle>

    <!--text content of review-->
    <v-card-text>
      <div>{{ review?.textReview }}</div>
    </v-card-text>
  </v-card>
</template>


<script setup lang="ts" >

import { queryCollectionByField, del } from '~/lib/db';
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from '~/lib/firebase';

const props = defineProps({
  review: Object,
  showChangeBtns: Boolean,
  deletePost: {
    type: Function,
    default: () => { },
  },
  openEditModal: {
    type: Function,
    default: () => { },
  },
});

const username = await getUsername(props.review?.uid);
const course = await getCourse(props.review?.class, props.review?.reviewedObject);
const prof = await getProf(props.review?.professor, props.review?.reviewedObject);


async function getUsername(uid: string) {
  const doc = await queryCollectionByField("users", "uid", uid);

  //adding interface to get rid of error when trying to access username property
  interface User {
    id: string;
    username: string;
  }

  if (doc[0]?.hasOwnProperty('username')) {
    return (doc[0] as User).username;
  } else {
    return "Anonymous User";
  }
}

//need to do the same calls to the course and professor db to get the proper names of classes and professors bc the posts database stores codes
async function getCourse(courseCode: string, reviewedObject: string) {
  if (!courseCode) {
    const courseDocRef = doc(db, 'classes', reviewedObject);
    const profDocRef = doc(db, 'profs', reviewedObject);

    const courseDoc = await getDoc(courseDocRef);
    const profDoc = await getDoc(profDocRef);

    if (courseDoc.exists()) {
      return courseDoc.data().title;
    }
    if (profDoc.exists()) {
      return "No class specified";
    }
    else return reviewedObject;

  }
  else {
    const courseDocRef = doc(db, 'classes', courseCode); // 'courses' is the name of the Firestore collection where course information is stored
    const courseDoc = await getDoc(courseDocRef);

    interface Course {
      id: string;
      title: string;
    }
    if (courseDoc.exists()) {
      //console.log(courseDoc.data());
      if (courseDoc.data().title) {
        const courseData = courseDoc.data();
        return courseData.title;
      }
    } else {
      return 'CSE 132'; //not in database but looks fine to users 
    }
  }
}

async function getProf(prof: string, reviewedObject: string) {
  if (!prof) {
    const courseDocRef = doc(db, 'classes', reviewedObject);
    const profDocRef = doc(db, 'profs', reviewedObject);

    const courseDoc = await getDoc(courseDocRef);
    const profDoc = await getDoc(profDocRef);

    if (courseDoc.exists()) {
      return " ";
    }
    if (profDoc.exists()) {
      return profDoc.data().firstname + " " + profDoc.data().lastname;
    }
    else return reviewedObject;
  }
  else {
    const professorDocRef = doc(db, 'profs', prof);
    const professorDoc = await getDoc(professorDocRef);

    if (professorDoc.exists()) {
      const professorData = professorDoc.data();
      return professorData.firstname + " " + professorData.lastname;
    } else {
      return 'Unknown instructor';
    }
  }
}

//Variable and Events needed to open modal

const emit = defineEmits();

const openEditModal = () => {
  emit('open-edit-modal', props.review);
};

</script>
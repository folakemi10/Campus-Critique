<template>
  <v-card class="mx-10	my-10 ">
    <v-card-item>
      <v-row align="center">
        <v-col cols="auto">
          <!-- User who made the post -->
          {{ username }}
        </v-col>

        <v-col cols="auto">
          <div class="d-flex align-center">
            <v-rating :model-value="review?.rating" color="amber" density="compact" half-increments readonly
              size="small"></v-rating>
            <v-card-subtitle class="ml-2">{{ review?.rating }}</v-card-subtitle>
          </div>
        </v-col>
      </v-row>
    </v-card-item>

    <!--Main class / professor reviewed: checks if the reviewed object is a class or prof and displays the correct one (TODO: query from the db using getCourse() or getProfessor
        ())-->
    <v-card-title>
      {{ review?.reviewedObject === "course" ? review?.class : review?.professor }}
    </v-card-title>

    <!--Secondary class / professor reviewed: checks if the reviewed object is a class or prof and displays the data secondary to the reviewed object (TODO: query from the db using getCourse() or getProfessor
        ()))-->
    <v-card-subtitle>
      {{ review?.reviewedObject === "course" ? review?.professor : review?.class }}
    </v-card-subtitle>

    <!--text content of review-->
    <v-card-text>
      <div>{{ review?.textReview }}</div>
    </v-card-text>
  </v-card>
</template>


<script setup lang="ts" >

const props = defineProps({
  review: Object,
});

const username = await getUsername(props.review?.uid);


import { queryCollectionByField } from '~/lib/db';
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from '~/lib/firebase';

console.log(props.review);

async function getUsername(uid: string) {
  const doc = await queryCollectionByField("users", "uid", uid);

  if (doc[0]?.hasOwnProperty('username')) {
    //getting an error when trying to access username. Don't know how to suppress it, but it succesfully grabs the username from the returned user object
    return doc[0].username;
  } else {
    return "Anonymous User";
  }

}

//need to do the same calls to the course and professor db to get the proper names of classes and professors bc the posts database stores codes
function getCourse() {

}

function getProfessor() {

}

</script>

<style lang="scss" scoped></style>
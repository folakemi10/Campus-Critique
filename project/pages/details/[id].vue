<template>
  <GlobalNav />
  <div>
    <h1>Details for {{ specificPosts[0].reviewedObject }}</h1>

    <Card v-for="(review, index) in specificPosts" :key="index" :review="review"></Card>

  </div>
</template>

<script setup lang="ts">
import { queryCollectionByField } from '~/lib/db';



const { id } = useRoute().params;

const firebaseUser = useFirebaseUser();

const specificPosts = ref();
const currentDetail = ref();

const selected = ref();

onMounted(async () => {
  specificPosts.value = await queryCollectionByField('posts', 'reviewedObject', "CSE131: Introduction to Computer Science");
  console.log(specificPosts.value);
}
);



</script>

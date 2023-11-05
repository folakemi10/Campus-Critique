<template>
  <v-btn v-if="firebaseUser" class="text-none text-subtitle-1" @click="onClick" color="primary-button" size="small"
    variant="flat">
    Make a Review
  </v-btn>
</template>
  
<script setup lang="ts">
const firebaseUser = useFirebaseUser();

const props = defineProps({
  reviewedObjectId: String,
  reviewedObject: String,
});

async function onClick() {
  await navigateTo({
    path: '/review/',
    query: {
      object: props.reviewedObject,
      id: props.reviewedObjectId,
    },
    replace: true,
  });
}
</script>


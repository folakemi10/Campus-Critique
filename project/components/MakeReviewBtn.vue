<template>
  <v-btn v-if="firebaseUser" @click="onClick" color="primary-button" size="small" variant="flat">
    Make a Review
  </v-btn>
</template>
  
<script setup lang="ts">
const firebaseUser = useFirebaseUser();

const props = defineProps({
  reviewedObjectId: String,
  reviewedObject: String,
  isGeneral: String,
});

async function onClick() {
  if (props.isGeneral) {
    await navigateTo({
      path: '/review-general/',
    })
  } else {
    await navigateTo({
      path: '/review/',
      query: {
        object: props.reviewedObject,
        id: props.reviewedObjectId,
      },
      replace: true,
    });
  }
}
</script>


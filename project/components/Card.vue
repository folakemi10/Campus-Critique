<template>
  <v-card class="mx-10	my-10 ">
    <v-card-text>
      <v-row class="mx-0">
        <v-rating :model-value="review.rating" color="amber" density="compact" half-increments readonly
          size="small"></v-rating>

        <div class="text-grey ms-4">
          {{ review.rating }}
        </div>
      </v-row>

      <div class="my-4 text-subtitle-1">
        {{ review.uid }} : {{ review.reviewedObject }}
      </div>

      <div>{{ review.textReview }}</div>
    </v-card-text>
  </v-card>
</template>


<script setup >

const props = defineProps({
  review: Object,
});

</script>

<style lang="scss" scoped></style>
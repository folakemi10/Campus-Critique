<template>
  <v-card class="mx-10	my-10 ">
    <v-card-text>
      <v-row class="mx-0">
        <v-rating :model-value="review.starRating" color="amber" density="compact" half-increments readonly
          size="small"></v-rating>

        <div class="text-grey ms-4">
          {{ review.starRating }}
        </div>
      </v-row>

      <div class="my-4 text-subtitle-1">
        {{ review.username }}
      </div>

      <div>{{ review.reviewText }}</div>
    </v-card-text>
  </v-card>
</template>


<script>
export default {
  props: {
    review: Object // Declare the prop
  }
};
</script>

<style lang="scss" scoped></style>
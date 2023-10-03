<template>
    <v-card>
        <ul>
      <li v-for="(review, index) in reviews" :key="index">
        <h3>{{ review.username }}</h3>
        <p>Rating: {{ review.starRating }} stars</p>
        <p>{{ review.reviewText }}</p>
      </li>
    </ul>
     
    </v-card>
</template>


<script>
export default {
  props: {
    reviews: Array // Declare the prop
  }
};
</script>

<style lang="scss" scoped>

</style>
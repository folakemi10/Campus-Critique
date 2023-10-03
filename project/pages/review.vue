<template>
  <GlobalNav logged-in="true" />
  <v-form>
    <v-container>
      <h2>I want to rate a: </h2>
      <v-radio-group v-model="inline" inline>
        <v-radio label="Course" value="course"></v-radio>
        <v-radio label="Professor" value="professor"></v-radio>
      </v-radio-group>

      <h2>Which course are you reviewing?</h2>
      <v-autocomplete label="Courses"
        :items="['CSE131: Introduction to Computer Science', 'CSE204A: Introduction to Web Development', 'Class3', 'Class4', 'Class5', 'Class6']"></v-autocomplete>

      <h2>Rate this course:</h2>
      <StarRating />

      <h2>Review this course: </h2>
      <v-container fluid>
        <v-textarea name="input-7-1" variant="filled" label="Write your review" auto-grow
          model-value=""></v-textarea>
      </v-container>
    </v-container>
  </v-form>
</template>

<script >

export default {
  data() {
    return {
      column: null,
      inline: null,

      review: {
        reviewText: 'sdfsdjfksjd'
      }
    }
  },
}

</script>

<style lang="scss" scoped></style>
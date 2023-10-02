<template>
  <v-form>
    <v-container>
      <h2>I want to rate a: </h2>
      <v-radio-group v-model="inline" inline>
        <v-radio label="Course" value="course"></v-radio>
        <v-radio label="Professor" value="professor"></v-radio>
      </v-radio-group>

      <h2>This class is </h2>
      <StarRating />
    </v-container>
  </v-form>
</template>

<script >

export default {
  data() {
    return {
      column: null,
      inline: null,
    }
  },
}

</script>

<style lang="scss" scoped></style>
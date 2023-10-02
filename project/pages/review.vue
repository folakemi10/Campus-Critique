<template>
    <h2>I want to rate a: </h2>
    <URadio v-for="method of methods" :key="method.name" v-model="selected" v-bind="method" @click="extendForm" />
</template>

<script setup>
const methods = [{
  name: 'course',
  value: 'course',
  label: 'Course'
}, {
  name: 'professor',
  value: 'professor',
  label: 'Professor'
}]
const selected = ref('sms')

function extendForm(){

    console.log("Stopping here");

}

</script>

<style lang="scss" scoped></style>
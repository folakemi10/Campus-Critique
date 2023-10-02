<script setup>
const username = ref('')
const password = ref('')
</script>
<template>
    <UInput v-model="username" />
    <UInput v-model="password" />
</template>
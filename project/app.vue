<template>
    <div>
        <RegisterForm v-if="showRegisterForm"/>

        <NuxtPage/>

    </div>
</template>

<script setup>
const showRegisterForm = false;

const firebaseUser = useFirebaseUser();


</script>

<style lang="scss" scoped>

</style>
<template>
    <v-btn color="primary" @click="logoutRedirect" v-if="firebaseUser">
        Log Out
    </v-btn>
</template>

<script setup lang="ts">
const firebaseUser = useFirebaseUser();
async function logoutRedirect() {
    await logout();
    await navigateTo("/");
}
</script>

<style lang="scss" scoped></style>
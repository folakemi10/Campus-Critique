<template>
    <v-btn :variant="variant" @click="logoutRedirect" >
        Log Out
    </v-btn>
</template>

<script setup lang="ts">
const firebaseUser = useFirebaseUser();
async function logoutRedirect() {
    await logout();
    await navigateTo("/");
}

const props = defineProps({
  variant: String
});
</script>

<style lang="scss" scoped></style>
<template>
    <v-btn :variant="variant" @click="logoutRedirect">
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
    variant: {
        type: String as PropType<"outlined" | "flat" | "text" | "elevated" | "tonal" | "plain">,
        default: "outlined", // Default to a valid Vuetify variant
    },
});
</script>

<style lang="scss" scoped></style>
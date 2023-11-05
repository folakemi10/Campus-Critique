<template>
    <v-btn to="/register" variant="flat" color="primary-button" >
        {{ buttonText }}
    </v-btn>
</template>

<script setup lang="ts">

defineProps({
    buttonText: String,
    size: String
});

</script>

<style lang="scss" scoped></style>
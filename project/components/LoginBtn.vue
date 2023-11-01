<template>
    <v-btn to="/login" variant="outlined" >
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
<template>
    <v-btn to="/admin" variant="flat" color="red" style="margin-right: 25px" >
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
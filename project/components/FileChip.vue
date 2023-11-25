<template>
    <v-chip :append-icon="props.icon" :href="props.downloadLink">
        {{ props.fileName.length < 24 ? props.fileName : props.fileName.substring(0,24) }} <!-- <a class="hidden">{{ props.downloadLink ?
            props.downloadLink : "Unamed File" }}</a> -->
    </v-chip>
</template>

<script setup lang="ts">
const props = defineProps({
    icon: String,
    fileName: {
        type: String,
        required: true,
    },
    downloadLink: String,
});


</script>

<style scoped></style>
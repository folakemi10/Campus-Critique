<template>
    <v-btn v-if="firebaseUser" to="/review" class="text-none text-subtitle-1" color="primary-button" size="small" variant="flat">
        Make a Review
    </v-btn>
</template>

<script setup lang="ts">
const props = defineProps(['firebaseUser']);
console.log(props.firebaseUser);

</script>


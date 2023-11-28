<template>
    <div>
        <v-avatar color="black" :size="props.size || 'large'">
            <img v-if="profilePicUrl" :src="profilePicUrl" alt="your profile image">
            <span v-else class="text-h5">{{ getUserInitials() }}</span>
        </v-avatar>
    </div>
</template>


<script setup lang="ts">

const { profilePicUrl, updatePicture } = inject('picture') as any;

const props = defineProps({
    user: Object,
    function: Function,
    size: String,
    isEditable: Boolean,
})

onMounted(async () => {
    await updatePicture(); 
})

function getUserInitials() {
    //console.log(props.user);
    if (props.user?.firstname == null || props.user?.firstname == null) {
        return props.user?.email.charAt(0);
    } else {
        return props.user.firstname?.charAt(0) + props.user.lastname?.charAt(0);
    }
}



</script>
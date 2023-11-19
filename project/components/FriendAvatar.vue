<template>
    <div>
        <v-avatar color="black" :size="props.size || 'large'">
            <img v-if="hasProfilePicture" :src="profilePicUrl" alt="your profile image">
            <span v-else class="text-h5">{{ getUserInitials() }}</span>
        </v-avatar>
    </div>
</template>


<script setup lang="ts">
import { getProfilePic } from '~/lib/storage';


const hasProfilePicture = ref(false);

const props = defineProps({
    user: Object,
    size: String,
})

const profilePicUrl = ref();

onMounted(async () => {
    try {
        if (props.user !== undefined) {
            const picUrl = await getProfilePic(props.user.uid);
            if (picUrl === "") {
                hasProfilePicture.value = false;
            } else {
                hasProfilePicture.value = true;
            }
        }
    }
    catch (e) {
        hasProfilePicture.value = false;
    }

   // console.log(hasProfilePicture.value);
})

function getUserInitials() {
    if (!hasProfilePicture.value) {
        if (props.user?.firstname == null || props.user?.lastname == null) {
            return props.user?.email.charAt(0);
        } else {
            return props.user.firstname?.charAt(0) + props.user.lastname?.charAt(0);
        }
    }
    return '';
}



</script>
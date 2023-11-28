<template>
    <div>
        <v-avatar color="black" :size="props.size || 'large'">
            <img v-if="profilePicUrl" :src="profilePicUrl" alt="Profile Image">
            <span v-else class="text-h5">{{ getUserInitials() }}</span>
        </v-avatar>
    </div>
</template>


<script setup lang="ts">
import { getProfilePic } from '~/lib/storage';


const hasProfilePicture = ref(false);
//const { profilePicUrl, updatePicture } = inject('picture') as any;
const profilePicUrl = ref();

const props = defineProps({
    user: Object,
    size: String,
})

//const profilePicUrl = ref();

onMounted(async () => {
    //await updatePicture();
    if (props.user !== undefined) {
        profilePicUrl.value = await getProfilePic(props.user.uid);
        if (profilePicUrl.value === "") {
            hasProfilePicture.value = false;
        } else {
            hasProfilePicture.value = true;
        }
    } else {
        hasProfilePicture.value = false;
    }
}

    // console.log(hasProfilePicture.value);
)

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
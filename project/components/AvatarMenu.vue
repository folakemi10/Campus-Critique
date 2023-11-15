<template>
    <v-menu min-width="200px" rounded>
        <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props">
                <Avatar :user='user' v-bind="props"/>
            </v-btn>
        </template>
        <v-card>
            <v-card-text>
                <div class="mx-auto text-center">
                    <Avatar :user='user'/>
                    <h3>{{ props.user?.firstname + " " + props.user?.lastname }}</h3>
                    <p class="text-caption mt-1">
                        {{ props.user?.email }}
                    </p>
                    <v-divider class="my-3"></v-divider>
                    <v-btn variant="text" @click="navigateToProfile">
                        Profile
                    </v-btn>
                    <v-divider class="my-3"></v-divider>
                    <v-btn variant="text" @click="navigateToFriends">
                        Friends
                    </v-btn>
                    <v-divider class="my-3"></v-divider>
                    <LogoutBtn variant="text" />
                </div>
            </v-card-text>
        </v-card>
    </v-menu>
</template>

<script setup lang="ts">

const user = ref();

const props = defineProps({
    user: Object,
})

// if (firebaseUser.value != null) {
//     props.user?.value = await getUser(firebaseUser.value.uid);
// }

// async function getUser(uid: string) {
//     try {
//         const doc = await queryCollectionByField("users", "uid", uid);

//         if (doc[0]?.hasOwnProperty('username')) {
//             //console.log(doc[0]);
//             return doc[0];
//         } else {
//             return;
//         }
//     }
//     catch (e) {
//         console.log(e);
//     }

// }

async function navigateToProfile() {
    await navigateTo('/profile');
}


async function navigateToFriends() {
    await navigateTo('/friends');
}




</script>


<template>
    <v-card color="grey-lighten-4" flat rounded="0">
        <v-toolbar>
            <v-btn to="/">
                <v-toolbar-title>
                    <v-icon icon="mdi-typewriter"></v-icon>
                    Campus Critique
                </v-toolbar-title>
            </v-btn>

            <v-spacer></v-spacer>

            <MakeReviewBtn :firebaseUser="firebaseUser" />


            <LoginBtn :button-text="'Login'" :size="'large'"/>
            <RegisterBtn :button-text="'Join'" :size="'large'"/>





            <v-menu min-width="200px" rounded v-if="firebaseUser">
                <template v-slot:activator="{ props }">
                    <v-btn icon v-bind="props">
                        <v-avatar color="brown" size="large">
                            <span class="text-h5">{{ user.initials }}</span>
                        </v-avatar>
                    </v-btn>
                </template>
                <v-card>
                    <v-card-text>
                        <div class="mx-auto text-center">
                            <v-avatar color="brown">
                                <span class="text-h5">{{ user.initials }}</span>
                            </v-avatar>
                            <h3>{{ user.fullName }}</h3>
                            <p class="text-caption mt-1">
                                {{ user.email }}
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
                            <LogoutBtn variant="text"/>
                        </div>
                    </v-card-text>
                </v-card>
            </v-menu>




        </v-toolbar>
    </v-card>
</template>

<script setup lang="ts">
import type { RegisterBtn } from '#ui-colors/components';
import LogoutBtn from './LogoutBtn.vue';

const firebaseUser = useFirebaseUser();


const user = ref({
    initials: 'JD',
    fullName: 'John Doe',
    email: 'john.doe@doe.com',
});

async function navigateToProfile() {
    await navigateTo('/profile');
}


async function navigateToFriends(){
   await navigateTo('/friends');
}



// const allCourses = ref();

// const selected = ref();

// onMounted(async () => {
//     allCourses.value = await queryEntireCollection('classes');
// }
// );


// // watch works directly on a ref
// watch(selected, async () => {
//     await navigateTo({
//         path: '/details/',
//         query: {
//             id: selected.value.id,
//         },
//         replace: true,
//     })
// })

</script>

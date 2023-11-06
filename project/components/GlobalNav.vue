<template>
    <v-card color="grey-lighten-4" flat rounded="0">
        <v-toolbar>
            <v-btn to="/">
                <v-toolbar-title>
                    <v-icon icon="mdi-message-draw"></v-icon>
                    Campus Critique
                </v-toolbar-title>
            </v-btn>

            <v-spacer></v-spacer>

            <AvatarMenu v-if="firebaseUser"/>


            <div v-if="!firebaseUser">
                <LoginBtn :button-text="'Login'" :size="'large'" />
                <RegisterBtn :button-text="'Join'" :size="'large'" />
            </div>


        </v-toolbar>
    </v-card>
</template>

<script setup lang="ts">

const firebaseUser = useFirebaseUser();

</script>

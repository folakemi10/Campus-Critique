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

            <v-text-field hide-details prepend-icon="mdi-magnify" single-line></v-text-field>

            <v-btn v-if="firebaseUser" to="/review">
                Make a Review
            </v-btn>

            <v-btn v-if="!firebaseUser" to="/login">
                Log In
            </v-btn>

            <template v-slot:extension>
                <v-tabs v-if="firebaseUser" v-model="tab" align-tabs="right">
                    <v-tab v-for="item in tabItems" :key="item" :value="item">
                        {{ item }}
                    </v-tab>
                </v-tabs>
            </template>
        </v-toolbar>
    </v-card>
</template>

<script setup>
const firebaseUser = useFirebaseUser();

const tabItems = [
    'Home', 'Profile'
];

</script>

<style lang="scss" scoped></style>
<template>
    <input type="file" name="profile_pic_input" id="profile_pic_input" accept=".jpg, .jpeg, .png" @change="fileInputHandler" >
    <v-btn variant="flat" color="blue" style="margin-right: 25px" @click="buttonHandler" >
        Edit Profile Picture
    </v-btn>
</template>

<script lang="ts">
import { ref, uploadBytes } from "firebase/storage";
import { storage } from '~/lib/firebase';

export default {
    props: {
        uid_prop: String
    },
    methods: {
        buttonHandler() {
            console.log("Profile Pic Button Clicked");
            if (this.uid_prop != "") {
                document.getElementById("profile_pic_input")?.click(); // trigger hidden file input box
            }
            else {
                console.warn("...but no uid found in uid_prop");
            }
        },
        async fileInputHandler() {
            console.log("File Input Changed");

            // parse file from input 
            const file_input = document.getElementById("profile_pic_input") as HTMLInputElement;
            const f = file_input.files?.item(0) as File;
            console.log(f);
            
            // create url and ref
            const pic_url = `profile_pics/${this.uid_prop}`;
            const pic_ref = ref(storage, pic_url);

            // upload file
            const upload_result = await uploadBytes(pic_ref, f);
            console.log(upload_result);
        }
    }
}

</script>

<style scoped>
    #profile_pic_input {
        display: none;
    }
</style>
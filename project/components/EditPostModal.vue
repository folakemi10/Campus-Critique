<template>
    <v-dialog >
        <v-card>
            <v-card-title>Edit Review</v-card-title>
            <v-card-text>
                <v-rating :model-value="editedReview.rating" color="amber"
                    density="compact"></v-rating>
                <v-textarea variant="filled" auto-grow v-model="editedReview.textReview" label="Review"
                    outlined></v-textarea>

                <v-card-actions>
                    <v-file-input v-model="selectedFiles" color="primary" label="Upload Files"
                        placeholder="Select your files" prepend-icon="mdi-paperclip" variant="outlined" multiple clearable>
                    </v-file-input>

                    <v-btn @click="addFiles">
                        Add Files
                    </v-btn>
                </v-card-actions>

                <v-card-item>
                    <v-chip-group>
                        <FileChip v-for="(file, index) in allFiles" :key="index" :icon="`mdi-close-circle-outline`"
                            :fileName="file.name" @click="removeFile(index)" />
                    </v-chip-group>
                </v-card-item>

            </v-card-text>
            <v-card-actions>
                <v-btn @click="saveChanges">Save</v-btn>
                <v-btn @click="cancelModal">Cancel</v-btn>
            </v-card-actions>


        </v-card>
    </v-dialog>
</template>
  
<script setup lang="ts">
const allFiles: any = ref();
const selectedFiles: Ref<File[]> = ref([]);

const firebaseUser = ref();
const authenticated = ref();

onMounted(async () => {
    firebaseUser.value = useAttrs().user;
    authenticated.value = useAttrs().isAuthenticated;
});


const props = defineProps({
    reviewToEdit: Object,
    isActive: Boolean
});

if (props.reviewToEdit !== undefined) {
    allFiles.value = await getFiles(props.reviewToEdit.id);
}

const emit = defineEmits();
const editedReview = ref();

onUpdated(() => editedReview.value = { ...props.reviewToEdit });

const cancelModal = () => {
    editedReview.value = { ...props.reviewToEdit };
    emit('close-edit-modal', props.reviewToEdit);
};

const saveChanges = () => {
    updateDocument();
    emit('close-edit-modal', editedReview.value);
};

import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from '~/lib/firebase';
import { getFiles } from "~/lib/storage";

async function updateDocument() {
    try {
        const docRef = doc(db, "posts", props.reviewToEdit?.id);
        await updateDoc(docRef, {
            rating: editedReview.value.rating,
            textReview: editedReview.value.textReview,
            modifiedAt: serverTimestamp()
        });
    }
    catch (e) {
        console.log(e);
    }

}

function addFiles() {
    //concatenate the currently selected ones to the list of all files
    const concatenatedFiles = [...allFiles.value, ...selectedFiles.value];
    //set the concatenated list to be the allFiles value
    allFiles.value = concatenatedFiles;
    //reset the currently selected files
    selectedFiles.value = [];
    //console.log(allFiles.value);
}


function removeFile(index:any) {
    // Remove the clicked file from the allFiles array
    allFiles.value.splice(index, 1);
}

</script>
  
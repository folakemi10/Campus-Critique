<template>
    <v-dialog>
        <v-card>
            <v-card-title>Edit Review</v-card-title>
            <v-card-item>
                <v-card-subtitle>
                    Adjust Your Rating:
                </v-card-subtitle>
                <v-rating :model-value="editedReview.rating" color="amber" density="compact"></v-rating>

                <v-card-subtitle>
                    Adjust Your Review:
                </v-card-subtitle>
                <v-textarea variant="filled" auto-grow v-model="editedReview.textReview" label="Review"
                    outlined></v-textarea>
            </v-card-item>
            <v-card-actions class="flex-row justify-space-between align-center">
                <v-file-input v-model="selectedFiles" color="primary" label="Upload Files" placeholder="Select your files"
                    prepend-icon="mdi-paperclip" variant="outlined" multiple clearable>
                </v-file-input>

                <v-btn color="primary" @click="addFiles">
                    Add Files
                </v-btn>
            </v-card-actions>

            <v-card-item>
                <v-chip-group>
                    <FileChip v-for="(file, index) in concatenatedFiles" :key="index" :icon="`mdi-close-circle-outline`"
                        :fileName="file.metadata ? file.metadata.name : file.name" @click="removeFile(index)" />
                </v-chip-group>
            </v-card-item>


            <v-card-actions>
                <v-btn variant="outlined" @click="cancelModal">Cancel</v-btn>
                <v-btn variant="flat" color="primary-button" @click="saveChanges">Save</v-btn>
            </v-card-actions>


        </v-card>
    </v-dialog>
</template>
  
<script setup lang="ts">
const firebaseUser = ref();
const authenticated = ref();

onMounted(async () => {
    firebaseUser.value = useAttrs().user;
    authenticated.value = useAttrs().isAuthenticated;

    getAttachments(props.reviewToEdit?.id);
});

const props = defineProps({
    reviewToEdit: Object,
    isActive: Boolean,
});

const emit = defineEmits();
const editedReview = ref();

const allFiles: any = ref([]);
const selectedFiles: Ref<File[]> = ref([]);

const filesToAdd: Ref<File[]> = ref([]);
const filesToRemove: Ref<any[]> = ref([]);

//concatenatedFiles handles the front-end display of chips; database changes only actually happen on save
const concatenatedFiles: Ref<any> = ref([]);


async function getAttachments(reviewId: any) {
    const files = await getFiles(reviewId);
    allFiles.value = files;
    concatenatedFiles.value = [...allFiles.value];
}

onUpdated(async () => {
    editedReview.value = {
        ...props.reviewToEdit
    };

    getAttachments(props.reviewToEdit?.id);

    emit('open-edit-modal")');
});

const cancelModal = () => {
    editedReview.value = { ...props.reviewToEdit };
    emit('close-edit-modal', props.reviewToEdit);
};

const saveChanges = async () => {
    updateDocument();

    //remove files marked for delete
    if (filesToRemove.value.length > 0) {
        for (let i = 0; i < filesToRemove.value.length; i++) {
            //console.log(filesToRemove.value[i]);
            await deleteFiles(props.reviewToEdit?.id, filesToRemove.value[i]);
        }
    }

    //add files
    if (filesToAdd.value.length > 0) {
        await uploadFiles(props.reviewToEdit?.id, filesToAdd.value);
    }

    emit('close-edit-modal', editedReview.value);
};

import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from '~/lib/firebase';
import { deleteFiles, getFiles, uploadFiles } from "~/lib/storage";

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
    concatenatedFiles.value = [...allFiles.value, ...selectedFiles.value];


    filesToAdd.value.push(...selectedFiles.value);
    console.log(filesToAdd.value);

    //reset the currently selected files
    selectedFiles.value = [];
    //console.log(allFiles.value);
}


async function removeFile(index: any) {
    // Remove the clicked file from the allFiles array
    let fileName = concatenatedFiles.value[index].name ? concatenatedFiles.value[index].name : concatenatedFiles.value[index].metadata.name;

    filesToRemove.value.push(fileName);
    console.log(filesToRemove.value);
    concatenatedFiles.value.splice(index, 1);
    //await deleteFiles(props.reviewToEdit?.id, allFiles.value[index]);
}

</script>
  
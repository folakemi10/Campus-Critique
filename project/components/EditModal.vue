<template>
    <v-dialog v-model="modalVisible">
        <v-card>
            <v-card-title>Edit Review</v-card-title>
            <v-card-text>
                <v-rating :model-value="editedReview.rating" v-model="editedReview.rating" color="amber" density="compact"></v-rating>
                <v-text-field v-model="editedReview.textReview" label="Review" outlined></v-text-field>

            </v-card-text>
            <v-card-actions>
                <v-btn @click="saveChanges">Save</v-btn>
                <v-btn @click="cancelModal">Cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
  
<script setup>

const props = defineProps({
    reviewToEdit: Object,
    isActive: Boolean
});

const modalVisible = ref(props.isActive.value);
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

import { doc, updateDoc } from "firebase/firestore";
import { db } from '~/lib/firebase';

async function updateDocument() {
    try {
        const docRef = doc(db, "posts", props.reviewToEdit.id);
        await updateDoc(docRef, {
            rating: editedReview.value.rating,
            textReview: editedReview.value.textReview
        });
    }
    catch (e) {
        console.log(e);
    }

}

</script>
  
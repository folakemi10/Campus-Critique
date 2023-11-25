project/components/BookmarkBtn.vue
<template>
  <v-btn @click="onBookmarkClick"  size="small" variant="outlined">
    {{ isBookmarked ? 'Remove Bookmark' : 'Bookmark' }}
  </v-btn>
</template>
<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { db } from '~/lib/firebase';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, query, where} from "firebase/firestore";

const firebaseUser = useFirebaseUser();
const userId = ref(firebaseUser.value?.uid);
const isBookmarked = ref(false);

watchEffect(() => {
  checkIfBookmarked();
});

const props = defineProps({
  reviewedObjectId: String,
})

async function checkIfBookmarked() {
  if (userId.value) {
    const bookmarksCollectionRef = collection(db, 'bookmarks');
    const q = query(
      bookmarksCollectionRef,
      where('userId', '==', userId.value),
      where('reviewedObjectId', '==', props.reviewedObjectId)
    );

    const querySnapshot = await getDocs(q);

    isBookmarked.value = !querySnapshot.empty;
  }
}

async function onBookmarkClick() {
  if (userId.value) {
    if (isBookmarked.value) {
      await removeBookmark();
    } else {
      await addBookmark();
    }
  }
}

async function addBookmark() {
  const ts = serverTimestamp();

  const classRef = doc(db, "classes", props.reviewedObjectId);
  const classSnap = await getDoc(classRef);

  const bookmark = {
    userId: userId.value,
    reviewedObjectId: props.reviewedObjectId,
    createdAt: ts,
    modifiedAt: ts,
    reviewedObjectName: classSnap.data().title
  };
  const colRef = collection(db, "bookmarks");
  await addDoc(colRef, bookmark);
  
  console.log(classSnap.data());

  isBookmarked.value = true;
}

async function removeBookmark() {
  const bookmarksCollectionRef = collection(db, 'bookmarks');
  const q = query(
    bookmarksCollectionRef,
    where('userId', '==', userId.value),
    where('reviewedObjectId', '==', props.reviewedObjectId)
  );

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const docToDelete = querySnapshot.docs[0];
    await deleteDoc(docToDelete.ref);
    isBookmarked.value = false;
  }
}


</script>
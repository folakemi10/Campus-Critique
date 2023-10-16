<template>
  <GlobalNav />
  <v-form @submit.prevent="onSubmit">

    <!-- Selecting either professor or class -->
    <v-card class="m-6">
      <v-card-title>I want to add/edit a: </v-card-title>
      <v-radio-group v-model="formCategory" inline @update:modelValue="onTypeChoose">
        <v-radio label="Class" value="class"></v-radio>
        <v-radio label="Professor" value="prof"></v-radio>
      </v-radio-group>
    </v-card>

    <!-- Add or Edit -->
    <v-card v-if="formCategory != ''" class="m-6">
      <v-radio-group v-model="formType" inline>
        <v-radio label="Add" value="add"></v-radio>
        <v-radio label="Edit" value="edit"></v-radio>
      </v-radio-group>
    </v-card>

    <!-- Editing Class -->
    <v-card class="m-6" v-if="formCategory=='class' && formType=='edit'">
      <v-card-title>Which class are you editing?</v-card-title>
      <v-autocomplete label="Classes" v-model="classData" return-object
        :items="classes" item-title="title" @update:modelValue="onSubjectChoose"></v-autocomplete>
    </v-card>

    <!-- Editing Professor -->
    <v-card class="m-6" v-if="formCategory=='prof' && formType=='edit'">
      <v-card-title>Which professor are you editing? </v-card-title>
      <v-autocomplete label="Professors" v-model="profData"
        :items="profs" item-title="firstname" item-value="value" @update:modelValue="onSubjectChoose"></v-autocomplete>
    </v-card>

    <!-- Class Form -->
    <v-card class="m-6" v-if="(subjectChosen == true || formType == 'add') && formCategory=='class'">
      <v-text-field label="Title" v-model="classData.title"></v-text-field>
      <v-text-field label="Department" v-model="classData.department"></v-text-field>
      <v-text-field label="School" v-model="classData.school"></v-text-field>
      <div id="new-class-prof">
        <v-autocomplete label="Add Professor" v-model="newClassProfID" ref="input"  
        :items="profs" item-title="firstname" item-value="value.id"></v-autocomplete>
        <v-btn @click="onNewClassProf">Add New Professor</v-btn>
      </div>
      
      <div id="current-profs">
        Current Professors: {{this.classProfNames}}
      </div>
    </v-card>

    <!-- Professor Form -->
    <v-card class="m-6" v-if="(subjectChosen == true || formType == 'add') && formCategory=='prof'">
      <v-text-field label="First Name" v-model="profData.firstname"></v-text-field>
      <v-text-field label="Last Name" v-model="profData.lastname"></v-text-field>
    </v-card>

    <v-btn type="submit" block class="mt-2" text="Submit"></v-btn>

    <div id="error">
      {{errorMessage}}
    </div>

  </v-form>
</template>

<script>
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";

import { queryEntireCollection } from '~/lib/db';
import { db } from "~/lib/firebase"

export default {
data() {
  return {
    subjectChosen: false,
    formType: "",
    formCategory: "",

    // database data
    classes: [],
    profs: [],

    // currently being edited
    classData: {
      title: "",
      department: "",
      profs: [],
      school: ""
    },
    profData: {
      firstname: "",
      lastname: ""
    },

    // adding prof to class
    newClassProfID: null,

    //messages
    errorMessage: ""
  }
},
computed: {
    classProfNames() {
      const result = []
      this.profs.forEach(p => {
        if (this.classData.profs.includes(p.value.id)) {
          result.push(p.value.firstname + " " + p.value.lastname);
        }
      });
      return result.join(", ");
    },
    isEmptyData() {
      const data = this.formCategory == "class" ? this.classData : this.profData;
      for (let [key, value] of Object.entries(data)) {
        if (value == "" || value == []) {
          return true;
        }
      }
      return false;
    }
     
},
methods: {
  onTypeChoose() {
    this.subjectChosen = false;
    // reset class and prof data
    this.classData = {
      title: "",
      department: "",
      profs: [],
      school: "",
      id: ""
    };
    this.profData = {
      firstname: "",
      lastname: "",
      id: ""
    };
  },
  onSubjectChoose() {
    if (this.formCategory == "prof" && this.profData) {
      this.subjectChosen = true;
    }
    else if (this.formCategory == "class" && this.classData) {
      this.subjectChosen = true;
    }
  },
  onNewClassProf() {
    if (this.newClassProfID != null && !this.classData.profs.includes(this.newClassProfID)) {
      console.log("New Prof: " + this.newClassProfID);
      this.classData.profs.push(this.newClassProfID);
      this.$refs.input.reset();
    }
  },
  async onSubmit() {

    let newDoc = null;
    let col = null;
    let id = null;
    
    // submit class
    if (this.formCategory == "class") {
      newDoc = this.classData;
      col = "classes";
    }

    // submit prof
    else if (this.formCategory == "prof") {
      newDoc = this.profData;
      col = "profs"
    }

    id = newDoc.id; // save old ID
    delete newDoc.id; // remove "id" field from document

    console.log(col);
    console.log(newDoc);

    // check for empty data
    if (this.isEmptyData) {
      const msg = "Error: Missing Fields";
      console.log(msg);
      this.errorMessage = msg;
    }
    // otherwise prepare to contact Firestore
    else {
      
      
      let result = null;
      // for editing/updating
      if (this.formType == "edit") {
        const newRef = doc(db, col, id);
        result = await updateDoc(newRef, newDoc);
      }
      // for adding
      else if (this.formType == "add") {
        const newRef = collection(db, col);
        result = await addDoc(newRef, newDoc);
      }

      console.log(result);
      this.errorMessage = JSON.stringify(result);
    } 
  }
},
async mounted() {
  
  this.classes = await queryEntireCollection("classes");

  const profs = await queryEntireCollection("profs");
  // needed for v-autocomplete to work properly
  this.profs = profs.map(p => {
    return {
      // i wanted to name this field "fullname" but i was getting bizarre errors...
      // probably vuetify's fault idk
      firstname: p.firstname + " " + p.lastname, 
      value: p
    }
  }); 
}
}
</script>

<style>
#new-class-prof {
  display: flex;
}
#current-profs {
  margin-left: 10px;
  margin-bottom: 10px;
}
#error {
  text-align: center;
  margin-top: 10px;
}
</style>

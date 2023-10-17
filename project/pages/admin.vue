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
      <v-radio-group v-model="formType" inline @update:modelValue="onTypeChoose">
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
        <v-autocomplete label="Choose Professor" v-model="newClassProfID" ref="input"  
        :items="profs" item-title="firstname" item-value="value.id"></v-autocomplete>
      <div id="prof-btns">
        <v-btn @click="onNewClassProf">Add Professor</v-btn>
        <v-btn @click="onDeleteClassProf">Remove Professor</v-btn>
      </div>
        
      </div>
      
      <div id="current-profs">
        <strong>Current Professors:</strong> {{this.classProfNames}}
      </div>
    </v-card>

    <!-- Professor Form -->
    <v-card class="m-6" v-if="(subjectChosen == true || formType == 'add') && formCategory=='prof'">
      <v-text-field label="First Name" v-model="profData.firstname"></v-text-field>
      <v-text-field label="Last Name" v-model="profData.lastname"></v-text-field>
    </v-card>

    <v-btn type="submit" v-if="!isEmptyData" block class="mt-2" text="Submit"></v-btn>

    <div id="error">
      {{errorMessage}}
    </div>

  </v-form>
</template>

<script>
import { addDoc, collection, doc, DocumentReference, setDoc, updateDoc } from "firebase/firestore";

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
  /**
   * Full names of all the professors in the database
   */
  classProfNames() {
    const result = []
    this.profs.forEach(p => {
      if (this.classData.profs.includes(p.value.id)) {
        result.push(p.value.firstname + " " + p.value.lastname);
      }
    });
    return result.join(", ");
  },
  /**
   * Whether there is at least one field that still needs to be filled out
   */
  isEmptyData() {
    // check if editing and subject is not chosen
    if (this.formType == "edit" && !this.subjectChosen) {
      return true;
    }
    // check if all required data exists
    const data = this.formCategory == "class" ? this.classData : this.profData;
    for (let [key, value] of Object.entries(data)) {
      if ( key != "id" && (value == "" || value == [])) {
        return true;
      }
    }
    return false;
  }
},
methods: {
  /**
   * Handler after choosing form options
   */
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
  /**
   * Handler when choosing editing subject
   */
  onSubjectChoose() {
    if (this.formCategory == "prof" && this.profData) {
      this.subjectChosen = true;
    }
    else if (this.formCategory == "class" && this.classData) {
      this.subjectChosen = true;
    }
  },
  /**
   * Handler when adding new professor to a class
   */
  onNewClassProf() {
    if (this.newClassProfID != null && !this.classData.profs.includes(this.newClassProfID)) {
      console.log("New Prof: " + this.newClassProfID);
      this.classData.profs.push(this.newClassProfID);
      this.$refs.input.reset();
    }
  },
  /**
   * Handler when removing a professor from a class
   */
  onDeleteClassProf() {
    if (this.newClassProfID != null && this.classData.profs.includes(this.newClassProfID)) {
      console.log("Removed Prof: " + this.newClassProfID);
      const index = this.classData.profs.indexOf(this.newClassProfID);
      if (index > -1) {
        this.classData.profs.splice(index, 1);
      }
      this.$refs.input.reset();
    }
  },
  /**
   * Handler for submitting the form
   */
  async onSubmit() {

    let newDoc = null;
    let col = null;
    let id = null;
    
    // submit class
    if (this.formCategory == "class") {
      newDoc = structuredClone(toRaw(this.classData));
      col = "classes";
    }

    // submit prof
    else if (this.formCategory == "prof") {
      newDoc = structuredClone(toRaw(this.profData));
      col = "profs"
    }

    id = newDoc.id; // save old ID
    console.log(id);
    delete newDoc.id; // remove "id" field from document

    console.log(col);
    console.log(newDoc);

    // check for empty data
    // if (this.isEmptyData) {
    if (1 == 2){
      const msg = "Error: Missing Fields";
      console.log(msg);
      this.errorMessage = msg;
    }
    // otherwise prepare to contact Firestore
    else {
      // for editing/updating
      if (this.formType == "edit") {
        const newRef = doc(db, col, id);
        try {
          await updateDoc(newRef, newDoc);
          this.errorMessage = "Success";
        }
        catch(e) {
          console.error(e);
          this.errorMessage = e;
        }
      }
      // for adding
      else if (this.formType == "add") {
        const newRef = collection(db, col);
        try {
          const result = await addDoc(newRef, newDoc);
          console.log(result);
          this.errorMessage = "Success";
        }
        catch(e) {
          console.error(e);
          this.errorMessage = e;
        }
      }
      this.resetForm();
    } 
  },
  /**
   * Reset The Form and Grab Latest Firestore Data
   */
  async resetForm() {
    // reset form variables
    this.subjectChosen = false;
    this.formType = "";
    this.formCategory = "";
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
    //get new Firestore Data
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
#prof-btns {
  display: flex;
  flex-direction: column;
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

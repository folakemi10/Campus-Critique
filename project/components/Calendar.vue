<template>
    <DayPilotCalendar id="dp" :config="config" />
  </template>
  
  <script>
  import {DayPilotCalendar} from '@daypilot/daypilot-lite-vue'
  
  export default {
    name: 'Calendar',
    data: function() {
      return {
        config: {
          viewType: "Week",
        },
      }
    },
    components: {
      DayPilotCalendar
    },
  }
  </script>
  
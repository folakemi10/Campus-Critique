import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { createVuetify } from "vuetify";
import { ThemeDefinition } from "vuetify";

const customDarkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    'primary-button': '#6200EE',
  },
};

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: "customDarkTheme",
      themes: {
        customDarkTheme,
      },
    },
  });
  app.vueApp.use(vuetify);
});

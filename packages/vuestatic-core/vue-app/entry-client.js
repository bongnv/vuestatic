import Vue from "vue";

import applyClientPlugins from "@vuestatic/applyClientPlugins";

import { createApp } from "@vuestatic/app";

const { app, router } = createApp();

applyClientPlugins({ Vue, app, router });

router.onReady(() => {
  app.$mount("#app");
});

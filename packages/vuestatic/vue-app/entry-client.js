import Vue from "vue";

import applyClientPlugins from "./applyClientPlugins";

import { createApp } from "app";

const { app, router } = createApp();

applyClientPlugins({ Vue, app, router });

router.onReady(() => {
  app.$mount("#app");
});

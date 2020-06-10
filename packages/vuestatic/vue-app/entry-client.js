import Vue from "vue";
import VueAnalytics from "vue-analytics";

import PrefetchLink from "./plugins/prefetch-link";
import join from "./shared/join";

import { createApp } from "app";
import siteMeta from "site-meta";

const handleRouteChange = () => {
  const lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

  if ("IntersectionObserver" in window) {
    const lazyImageObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.classList.remove("lazy");
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach(function (lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
  } else {
    // Possibly fall back to a more compatible method here
    lazyImages.forEach((lazyImage) => {
      lazyImage.src = lazyImage.dataset.src;
      lazyImage.classList.remove("lazy");
    });
  }
};

const { app, router } = createApp();

Vue.use(PrefetchLink);

if (siteMeta.GA) {
  Vue.use(VueAnalytics, {
    id: siteMeta.GA,
    router,
  });
}

router.beforeResolve((to, from, next) => {
  const pageDataURL = join(to.path, "pageProps.json");
  fetch(pageDataURL)
    .then((response) => response.json())
    .then((pageData) => {
      if (to.matched.length > 0) {
        to.matched[0].props["default"] = pageData;
      }
      next();
      Vue.nextTick(handleRouteChange);
    })
    .catch(next);
});

router.onReady(() => {
  app.$mount("#app");
});
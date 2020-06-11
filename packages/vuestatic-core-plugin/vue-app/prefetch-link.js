import { join } from "./join";

const isBrowser = typeof window !== "undefined";
const isSupported = isBrowser && "IntersectionObserver" in window;
const requestIdleCallback =
  isBrowser && "requestIdleCallback" in window
    ? window.requestIdleCallback
    : (cb) => setTimeout(cb, 0);

const install = (Vue) => {
  if (!isSupported) {
    console.warn("Not supported, falling back to router-link");
    return;
  }

  const preFetched = {};

  const prefetchLink = (url) => {
    return new Promise((resolve, reject) => {
      const link = document.createElement(`link`);
      link.rel = `prefetch`;
      link.href = url;

      link.addEventListener("load", resolve);
      link.addEventListener("error", reject);

      document.head.appendChild(link);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const link = entry.target;
        if (!preFetched[link._prefetchLink]) {
          preFetched[link._prefetchLink] = true;
          requestIdleCallback(() => prefetchLink(link._prefetchLink));
        }
        observer.unobserve(link);
      }
    });
  });

  const RouterLink =
    Vue.component("router-link") || Vue.component("RouterLink");

  const PrefetchLink = {
    name: "PrefetchLink",
    extends: RouterLink,
    mounted() {
      this.$el._prefetchLink = join(this.to, "pageProps.json");
      observer.observe(this.$el);
    },
    destroyed() {
      observer.unobserve(this.$el);
    },
  };

  Vue.component("router-link", PrefetchLink);
};

export const PrefetchLink = {
  install,
}

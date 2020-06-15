import { PrefetchLink } from "./prefetch-link";
import { asyncRouterProps } from "./async-router-props";

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

export default function ({ Vue, router }) {
  Vue.use(PrefetchLink);

  router.beforeResolve((to, from, next) =>
    asyncRouterProps(to)
      .then(() => next())
      .catch((err) => {
        console.error(err);
        next(false);
      }),
  );

  router.beforeResolve((to, from, next) => {
    next();
    Vue.nextTick(handleRouteChange);
  });
}

import type { VueConstructor } from "vue";
import type Router from "vue-router";
import VueAnalytics from "vue-analytics";

interface Props {
  Vue: VueConstructor;
  router: Router;
}

export default function ({ Vue, router }: Props) {
  Vue.use(VueAnalytics, {
    id: __GOOGLE_ANALYTICS_ID__,
    router,
  });
};

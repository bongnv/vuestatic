import path from "path";
import type Router from "vue-router";
import type { Route } from "vue-router";

//@ts-ignore
import { createApp } from "app";

const pushURL = (router: Router, url: string): Promise<Route> => {
  return new Promise((resolve, reject) => {
    router.push(url, resolve, reject);
  });
};

interface Context {
  meta: any;
  url: string;
  pageDataPath: string;
  pageData: Object;
}

export default async (context: Context) => {
  const { app, router } = createApp();
  const route = await pushURL(router, context.url);
  if (!route.matched.length) {
    throw { code: 404 };
  }

  context.meta = app.$meta();
  context.pageDataPath = path.join(context.url, "pageProps.json");
  route.matched[0].props["default"] = context.pageData;
  return app;
};

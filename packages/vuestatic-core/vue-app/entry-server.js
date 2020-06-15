import path from "path";

import { createApp } from "@vuestatic/app";
import { staticProps } from "@vuestatic/static-props";
import { asyncRouterProps } from "./async-router-props";

const pushURL = (router, url) => {
  return new Promise((resolve, reject) => {
    router.push(url, resolve, reject);
  });
};

export default async (context) => {
  const { app, router } = createApp();
  const route = await pushURL(router, context.url);
  if (!route.matched.length) {
    throw { code: 404 };
  }

  context.meta = app.$meta();
  context.pagePropsPath = path.join(context.url, "pageProps.json");
  context.pageProps = await staticProps(route);
  await asyncRouterProps(route);
  return app;
};

import { join } from "./join";

export const staticProps = (route) => {
  const pagePropsURL = join(route.path, "pageProps.json");
  return new Promise((resolve, reject) => {
    fetch(pagePropsURL)
      .then((response) => response.json())
      .then(resolve)
      .catch(reject);
  });
};

import applyPropsHandlers from "./apply-props-handlers";

const defaultHandler = () => undefined;

// apply transformers which allows plugins to generate static props from route.
const getStaticProps = applyPropsHandlers(defaultHandler);

// We probably need a better cache. LRU?
const cached = {};

export const staticProps = (route) => {
  if (!cached[route.path]) {
    // meta is used to pass through multiple handlers to share data.
    const meta = {};
    cached[route.path] = getStaticProps(route, meta);
  }

  return cached[route.path];
};

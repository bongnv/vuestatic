const path = require("path");
const { createBundleRenderer } = require("vue-server-renderer");
const fs = require("fs").promises;

const createGetProps = ({ config }) => {
  // TODO: invalidate cache when we need to reload
  // we generate app so pageProps will be available in context.
  const createApp = require(path.join(config.serverPath, "app.js")).default;
  return async (url) => {
    const ctx = {
      url,
    };
    await createApp(ctx);
    return ctx.pageProps;
  };
};

const createGetHTML = async (context) => {
  const clientManifest = await getClientManifest(context.clientDevMiddleware);

  const templateFile = path.resolve(__dirname, "index.html");
  const template = await fs.readFile(templateFile, "utf-8");
  const serverBundleFile = path.join(
    context.config.serverPath,
    "vue-ssr-server-bundle.json",
  );
  const renderer = createBundleRenderer(serverBundleFile, {
    clientManifest,
    template,
    runInNewContext: false,
  });

  return (url) =>
    renderer.renderToString({
      url,
    });
};

const getClientManifest = (middleware) => {
  return new Promise((resolve) => {
    middleware.waitUntilValid(() => {
      const rawClientManifest = middleware.fileSystem.readFileSync(
        path.resolve(process.cwd(), "dist/vue-ssr-client-manifest.json"),
      );
      resolve(JSON.parse(rawClientManifest));
    });
  });
};

const setupHooks = (context) => {
  const invalid = () => {
    if (context.ready) {
      console.log("Compiling...");
    }

    context.ready = false;
  };

  const done = async () => {
    try {
      context.getHTML = await createGetHTML(context);
      context.getProps = createGetProps(context);

      const { callbacks } = context;
      context.ready = true;
      context.callbacks = [];
      callbacks.forEach((callback) => {
        callback();
      });
    } catch (err) {
      console.log("error while calling back", err);
    }
  };

  context.serverCompiler.hooks.watchRun.tap("DevMiddleware", invalid);
  context.serverCompiler.hooks.invalid.tap("DevMiddleware", invalid);
  context.serverCompiler.hooks.done.tapPromise("DevMiddleware", done);
};

const devMiddleware = (config, serverCompiler, clientDevMiddleware) => {
  const context = {
    ready: false,
    serverCompiler,
    callbacks: [],
    renderer: null,
    clientDevMiddleware,
    config,
  };

  setupHooks(context);
  const waitForBuild = (callback) => {
    if (context.ready) {
      callback();
    } else {
      console.log("wait until bundle finished");
      context.callbacks.push(callback);
    }
  };

  serverCompiler.watch(serverCompiler.options.watchOptions, (err, stats) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(stats.toString());
  });

  return (req, res, next) => {
    if (!req.path.endsWith("pageProps.json")) {
      return waitForBuild(() => {
        context
          .getHTML(req.path)
          .then((html) => {
            res.send(html);
          })
          .catch((err) => {
            if (err.code === 404) {
              return next();
            }

            console.error("err", req.fullPath, err);
            res.status(500).send(err);
          });
      });
    }

    return waitForBuild(() => {
      try {
        // TOD: using a hack here, need a proper design for server side
        context
          .getProps(req.path.replace(/pageProps\.json/i, ""))
          .then((pageProps) => {
            res.json(pageProps);
          })
          .catch((err) => {
            console.log("err", err);
            res.status(err.code || 500).send(err);
          });
      } catch (err) {
        console.error(err);
      }
    });
  };
};

module.exports = devMiddleware;

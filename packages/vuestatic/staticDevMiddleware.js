const path = require("path");
const { createBundleRenderer } = require("vue-server-renderer");
const fs = require("fs").promises;

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
      const { callbacks } = context;
      const clientManifest = await getClientManifest(
        context.clientDevMiddleware,
      );
      const template = await fs.readFile(
        path.resolve(__dirname, "index.ssr.html"),
        "utf-8",
      );
      context.renderer = await createBundleRenderer(
        path.resolve(process.cwd(), ".server/vue-ssr-server-bundle.json"),
        {
          clientManifest,
          template,
          runInNewContext: false,
        },
      );
      context.ready = true;
      context.callbacks = [];
      callbacks.forEach((callback) => {
        callback();
      });
    } catch (err) {
      console.log("error while calling back", err);
    }
  };

  context.compiler.hooks.watchRun.tap("DevMiddleware", invalid);
  context.compiler.hooks.invalid.tap("DevMiddleware", invalid);
  context.compiler.hooks.done.tapPromise("DevMiddleware", done);
};

const getPageData = async (renderer, url) => {
  const context = {
    url,
  };

  await renderer.renderToString(context);
  return context.pageData;
};

const getPageHTML = (renderer, url) =>
  renderer.renderToString({
    url,
  });

const devMiddleware = (compiler, clientDevMiddleware) => {
  const context = {
    ready: false,
    compiler: compiler,
    watchOptions: compiler.options.watchOptions || {},
    callbacks: [],
    renderer: null,
    clientDevMiddleware,
  };

  setupHooks(context);
  const waitForBuild = (callback) => {
    if (context.ready) {
      callback();
    } else {
      context.callbacks.push(callback);
    }
  };

  compiler.watch(context.watchOptions, (err, stats) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(stats.toString());
  });

  return (req, res, next) => {
    if (!req.path.endsWith("pageData.json")) {
      return waitForBuild(() => {
        getPageHTML(context.renderer, req.path)
          .then((html) => {
            res.send(html);
          })
          .catch((err) => {
            if (err.code === 404) {
              return next();
            }

            console.log("err", err);
            res.status(500).send(err);
          });
      });
    }

    return waitForBuild(() => {
      getPageData(context.renderer, req.path.replace(/pageData\.json/i, ""))
        .then((pageData) => {
          res.json(pageData);
        })
        .catch((err) => {
          console.log("err", err);
          res.status(500).send(err);
        });
    });
  };
};

module.exports = devMiddleware;

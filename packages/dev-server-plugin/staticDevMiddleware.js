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

  const done = async (type) => {
    try {
      const clientManifest = await getClientManifest(
        context.clientDevMiddleware,
      );
      const template = await fs.readFile(
        path.resolve(process.cwd(), "src", "index.ssr.html"),
        "utf-8",
      );
      context.renderer = await createBundleRenderer(
        path.resolve(process.cwd(), ".vuestatic/server/vue-ssr-server-bundle.json"),
        {
          clientManifest,
          template,
          runInNewContext: false,
        },
      );
      context.getProps = require(path.resolve(process.cwd(), ".vuestatic/server/static-props.js")).default;
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

const getPageHTML = async (renderer, getProps, url) => {
  const pageData = await getProps(url);
  return renderer.renderToString({
    url,
    pageData,
  })
};

const devMiddleware = (serverCompiler, clientDevMiddleware) => {
  const context = {
    ready: false,
    serverCompiler,
    callbacks: [],
    renderer: null,
    clientDevMiddleware,
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
    if (!req.path.endsWith("pageData.json")) {
      return waitForBuild(() => {
        getPageHTML(context.renderer, context.getProps, req.path)
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
      try {
        context.getProps(req.path.replace(/pageData\.json/i, ""))
          .then((pageData) => {
            res.json(pageData);
          })
          .catch((err) => {
            console.log("err", err);
            res.status(err.code || 500).send(err);
          });
      } catch (err) {
        console.log(err);
      }
    });
  };
};

module.exports = devMiddleware;

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
  const invalid = (type) => {
    if (context[type + "Ready"]) {
      console.log("Compiling...");
    }

    context[type + "Ready"] = false;
  };

  const done = async (type) => {
    try {
      context[type + "Ready"] = true;
      console.log(`${type} is ready.`);
      if (!context.serverReady || !context.staticReady) {
        return;
      }

      const { callbacks } = context;
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
      context.getProps = require(path.resolve(process.cwd(), ".vuestatic/static-props/index.js")).default;
      context.ready = true;
      context.callbacks = [];
      callbacks.forEach((callback) => {
        callback();
      });
    } catch (err) {
      console.log("error while calling back", err);
    }
  };

  context.serverCompiler.hooks.watchRun.tap("DevMiddleware", () => invalid("server"));
  context.serverCompiler.hooks.invalid.tap("DevMiddleware", () => invalid("server"));
  context.serverCompiler.hooks.done.tapPromise("DevMiddleware", () => done("server"));
  context.staticCompiler.hooks.watchRun.tap("DevMiddleware", () => invalid("static"));
  context.staticCompiler.hooks.invalid.tap("DevMiddleware", () => invalid("static"));
  context.staticCompiler.hooks.done.tapPromise("DevMiddleware", () => done("static"));
};

const getPageHTML = async (renderer, getProps, url) => {
  const pageData = await getProps(url);
  return renderer.renderToString({
    url,
    pageData,
  })
};

const devMiddleware = (serverCompiler, staticCompiler, clientDevMiddleware) => {
  const context = {
    serverReady: false,
    staticReady: false,
    serverCompiler,
    staticCompiler,
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

  serverCompiler.watch(serverCompiler.options.watchOptions, (err, stats) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(stats.toString());
  });

  staticCompiler.watch(staticCompiler.options.watchOptions, (err, stats) => {
    if (err) {
      return console.error(err);
    }

    console.log(stats.toString());
  })

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
      context.getProps(req.path.replace(/pageData\.json/i, ""))
        .then((pageData) => {
          res.json(pageData);
        })
        .catch((err) => {
          console.log("err", err);
          res.status(err.code || 500).send(err);
        });
    });
  };
};

module.exports = devMiddleware;

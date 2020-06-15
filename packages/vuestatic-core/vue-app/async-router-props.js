export const asyncRouterProps = (route) =>
  Promise.all(
    route.matched.map((match) => {
      const matchProps = match.originalProps || match.props || {};
      if (!match.originalProps) {
        match.originalProps = Object.assign({}, matchProps);
      }

      return Promise.all(
        Object.entries(matchProps).map(
          ([key, props]) =>
            new Promise((resolve, reject) => {
              if (typeof props === "function") {
                const result = props(route);
                Promise.resolve(result)
                  .then((data) => {
                    match.props[key] = data;
                    resolve();
                  })
                  .catch((err) => reject(err));
              } else {
                resolve();
              }
            }),
        ),
      );
    }),
  );

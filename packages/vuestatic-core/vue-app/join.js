export function join(base, path) {
  if (base.length > 0 && base[base.length - 1] === "/") {
    return base + path;
  }

  return base + "/" + path;
}

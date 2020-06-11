export function join(base: string, path: string) {
  if (base.length > 0 && base[base.length - 1] === "/") {
    return base + path;
  }

  return base + "/" + path;
}

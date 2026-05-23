const absoluteUrlPattern = /^(?:[a-z][a-z0-9+.-]*:)?\/\//i;

export function publicPath(path: string) {
  if (absoluteUrlPattern.test(path) || path.startsWith("data:")) {
    return path;
  }

  const base = import.meta.env?.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;

  if (path.startsWith(normalizedBase)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${normalizedBase}${normalizedPath}`;
}

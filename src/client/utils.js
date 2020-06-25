function parseQueryParams(urlStr) {
  return new URL(urlStr).searchParams
    .toString()
    .split("&")
    .reduce((previous, current) => {
      const [key, value] = current.split("=");
      previous[key] = value;
      return previous;
    }, {});
}

module.exports = { parseQueryParams };

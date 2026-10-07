/* Release metadata shared by the app and service worker. Bump for every published change. */
(function (scope) {
  const version = '2.3.1';
  const build = '20261007.8';
  scope.GYM_RELEASE = Object.freeze({ version, build, cacheId: 'v' + version + '-' + build });
})(globalThis);


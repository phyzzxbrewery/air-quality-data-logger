/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
	mount: {
    public: { url: '/', static: true },
    src: { url: '/js' },
	},
	plugins: [
    /* ... */
  ],
  routes: [
    /* Enable an SPA Fallback in development: */
    // {"match": "routes", "src": ".*", "dest": "/index.html"},
  ],
  optimize: {
    /* Example: Bundle your final build: */
    // "bundle": true,
  },
  packageOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    out: "/home/lillebror/scripts/python-websockets/static",
    // watch: true
  },
};

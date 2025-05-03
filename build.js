const esbuild = require("esbuild");

esbuild.build({
  entryPoints: ["src/popup.jsx"],
  bundle: true,
  minify: true,
  outfile: "dist/popup.js",
  jsx: "automatic",
  target: ["chrome100", "firefox100"],
}).catch(() => process.exit(1));
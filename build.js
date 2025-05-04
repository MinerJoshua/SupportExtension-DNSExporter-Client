const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: [
      "content/index.js", // main content script
      "src/popup.jsx", // popup UI entry
      "background/index.js", //background js script
    ],
    bundle: true,
    minify: false,
    outdir: "dist",
    target: ["chrome114"], // or any modern baseline
    format: "esm",
    loader: {
      ".js": "jsx", // in case you use JSX in content components
      ".jsx": "jsx",
    },
    define: {
      "process.env.NODE_ENV": '"production"',
    },
  })
  .catch(() => process.exit(1));

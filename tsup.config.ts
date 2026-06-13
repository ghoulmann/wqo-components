import { defineConfig } from "tsup"

export default defineConfig({
  entry: { index: "src/index.tsx" },
  format: ["esm"],
  dts: true,
  clean: true,
  target: "es2022",
  splitting: false,
  external: [
    "preact",
    "preact/hooks",
    "preact/jsx-runtime",
    "preact/compat",
    "@jackyzha0/quartz",
    "@jackyzha0/quartz/*",
  ],
  esbuildOptions(options) {
    options.jsx = "automatic"
    options.jsxImportSource = "preact"
  },
})

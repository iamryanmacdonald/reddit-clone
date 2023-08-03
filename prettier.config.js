/** @typedef {import("prettier").Config} PrettierConfig */
/** @typedef {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig */
/** @typedef {{ tailwindConfig: string }} TailwindConfig */

/** @type { PrettierConfig | SortImportsConfig | TailwindConfig } */
const config = {
  importOrder: [
    "^(react/(.*)$)|^(react$)",
    "^(next/(.*)$)|^(next$)",
    "<THIRD_PARTY_MODULES>",
    "",
    "^~/app/(.*)$",
    "^~/components/(.*)$",
    "^~/lib/(.*)$",
    "",
    "^[./]",
    "",
    "^(?!.*[.]css$)[./].*$",
    ".css$",
  ],
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  pluginSearchDirs: false,
  tailwindConfig: "./tailwind.config.js",
};

module.exports = config;

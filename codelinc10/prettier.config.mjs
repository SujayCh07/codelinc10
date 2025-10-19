/** @type {import("prettier").Config} */
const config = {
  semi: false,
  singleQuote: false,
  printWidth: 100,
  trailingComma: "all",
  plugins: ["@trivago/prettier-plugin-sort-imports"],
  importOrder: ["^react$", "^next", "^@/", "^[./]"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}

export default config

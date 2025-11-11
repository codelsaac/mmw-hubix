const { FlatCompat } = require("@eslint/eslintrc")

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
})

module.exports = [
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "dist/**"],
  },
  ...compat.extends("next/core-web-vitals"),
]

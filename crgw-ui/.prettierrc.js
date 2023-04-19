module.exports = {
  printWidth: 100,
  singleQuote: false,
  importOrder: [
    "^typedefs\\/.*",
    "^providers\\/.*",
    "^hooks\\/.*",
    "^bizlog\\/.*",
    "^clients\\/.*",
    "^shared\\/.*",
    "^utils\\/.*",
    "^components\\/.*",
    "^assets\\/.*",
    "^[.].*(?<!css)$", // local dependencies (except css)
    "^[.].*css$", // local CSS files
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

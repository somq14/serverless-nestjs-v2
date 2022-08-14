// webpack の設定
// Nest.js はビルドツールとして webpack を使う。

const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = (config) => {
  return {
    ...config,
    externals: [
      // node_modules はバンドル対象から除外する
      // プロジェクトルートにある node_modules も除外する
      nodeExternals({
        additionalModuleDirs: [
          path.resolve(__dirname, "..", "..", "node_modules"),
        ],
      }),
    ],
  };
};

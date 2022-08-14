// webpack の設定
// Nest.js はビルドツールとして webpack を使う。
// この設定は AWS Lambda 用

const TerserPlugin = require("terser-webpack-plugin");

module.exports = (config, webpack) => {
  return {
    ...config,

    // 出力ファイルが common.js モジュールになるようにビルドする。
    // エントリーポイントが export したものが出力ファイルでも export される。
    // cf. https://webpack.js.org/configuration/output/#type-commonjs2
    output: {
      ...config.output,
      library: {
        type: "commonjs2",
      },
    },

    // コードサイズが小さくなるようコードを圧縮する。
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            // class-validator のためにクラス名を維持する必要がある。
            // cf. https://docs.nestjs.com/faq/serverless#example-integration
            keep_classnames: true,
          },
        }),
      ],
    },

    // ここ指定したモジュールはバンドル対象外になる。
    // node_modules のパッケージまで含めてバンドルする。
    externals: [],

    // Nest.js が Lazy Import のためにいくつかのライブラリを内部的に import しているが、
    // インストールしていないモジュールのためビルドに失敗する。
    // webpack にこれを無視するよう指示する。
    plugins: [
      ...config.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          return [
            "@nestjs/microservices/microservices-module",
            "@nestjs/websockets/socket-module",
          ].includes(resource);
        },
      }),
    ],
  };
};

const path = require("path");
const { IgnorePlugin } = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const { TsconfigPathsPlugin } = require("tsconfig-paths-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = () => ({
  mode: "production",

  entry: {
    api: path.resolve(__dirname, "apps/api/src/main.ts"),
    "aws-lambda-handler": path.resolve(
      __dirname,
      "apps/api/src/aws-lambda-handler.ts"
    ),
  },

  output: {
    filename: "[name].js",
    library: {
      // 出力ファイルが common.js モジュールになるようにビルドする。
      // エントリーポイントが export したものが出力ファイルでも export される。
      // cf. https://webpack.js.org/configuration/output/#type-commonjs2
      type: "commonjs2",
    },
    clean: true,
  },

  // ソースマップをインラインで生成する
  devtool: "source-map",

  // コードサイズが小さくなるようコードを圧縮する。
  optimization: {
    minimizer: [
      new TerserPlugin({
        // minify: TerserPlugin.swcMinify,
        terserOptions: {
          // class-validator のためにクラス名を維持する必要がある。
          // cf. https://docs.nestjs.com/faq/serverless#example-integration
          // keepClassnames: true,
          keep_classnames: true,
        },
      }),
    ],
  },

  module: {
    rules: [
      // {
      //   test: /.tsx?/,
      //   use: {
      //     loader: "swc-loader",
      //     options: {},
      //   },
      //   exclude: /node_modules/,
      // },
      {
        test: /.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },

  resolve: {
    extensions: [".js", ".jsx", ".mjs", ".ts", ".tsx"],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, "tsconfig.json"),
      }),
    ],
  },

  // ここ指定したモジュールはバンドル対象外になる。
  // node_modules のパッケージまで含めてバンドルする。
  target: "node",
  externals: [],

  // Nest.js が Lazy Import のためにいくつかのライブラリを内部的に import しているが、
  // インストールしていないモジュールのためビルドに失敗する。
  // webpack にこれを無視するよう指示する。
  plugins: [
    new IgnorePlugin({
      checkResource(resource) {
        return [
          "cache-manager",
          "class-transformer",
          "class-validator",
          "@nestjs/microservices",
          "@nestjs/microservices/microservices-module",
          "@nestjs/websockets/socket-module",
        ].includes(resource);
      },
    }),
    new ForkTsCheckerWebpackPlugin(),
  ],

  stats: {
    preset: "minimal",
    entrypoints: true,
  },
});

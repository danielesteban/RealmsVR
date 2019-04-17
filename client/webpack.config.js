const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const GHPagesSPAWebpackPlugin = require('ghpages-spa-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const RobotstxtPlugin = require('robotstxt-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const modulesPath = path.resolve(__dirname, 'node_modules');
const srcPath = path.resolve(__dirname, 'src');
const outputPath = path.resolve(__dirname, 'dist');
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const api = process.env.API || (mode === 'production' ? 'https://projects.gatunes.com/realmsvr/' : 'http://localhost:8081/');
const basename = process.env.BASENAME || '/';
const analyticsId = process.env.ANALYTICS_ID || 'UA-113342424-4';
const analyticsCDN = 'https://www.google-analytics.com/';
const fontsCDN = 'https://fonts.googleapis.com/';
const robotoCDN = 'https://fonts.gstatic.com/s/roboto/';
const soundcloudCDN = 'https://*.soundcloud.com/ https://*.sndcdn.com';
const domain = process.env.DOMAIN || 'realmsvr.gatunes.com';

let version;
if (fs.existsSync(path.resolve(__dirname, '..', '.git'))) {
  // Get version from the repo commit count
  let commitCount;
  try {
    commitCount = parseInt(childProcess.execSync('git rev-list HEAD --count').toString(), 10);
  } catch (e) {
    commitCount = 0;
  }
  version = `${Math.floor(commitCount / 1000)}.${Math.floor(commitCount / 100) % 10}.${commitCount % 100}`;
} else {
  // Failover to package.json version
  try {
    // eslint-disable-next-line prefer-destructuring
    version = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'))).version;
  } catch (e) {
    version = '0.0.0';
  }
}

if (mode === 'production') {
  console.log(`RealmsVR - v${version}`);
}

module.exports = {
  mode,
  entry: [
    '@babel/polyfill',
    path.join(srcPath, 'index.css'),
    path.join(srcPath, 'index.jsx'),
  ],
  output: {
    filename: `code/${(mode === 'production' ? '[name].[contenthash]' : '[name]')}.js`,
    globalObject: 'this',
    path: outputPath,
    publicPath: basename,
  },
  resolve: {
    alias: {
      '@': srcPath,
      ...(mode === 'development' ? {
        'react-dom': '@hot-loader/react-dom',
      } : {}),
    },
    extensions: ['.js', '.jsx', '.json'],
  },
  module: {
    rules: [
      ...(mode === 'development' ? [
        {
          test: /\.(js|jsx)$/,
          enforce: 'pre',
          loader: 'eslint-loader',
          options: {
            emitWarning: true,
          },
          include: srcPath,
        },
      ] : []),
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          presets: [
            ['@babel/preset-env', { modules: false }],
            ['@babel/preset-react'],
          ],
          plugins: [
            'react-hot-loader/babel',
            'styled-components',
          ],
        },
        include: srcPath,
        exclude: [/\.worker\.js$/],
      },
      {
        test: /\.worker\.js$/,
        use: [
          {
            loader: 'worker-loader',
            options: {
              name: `code/${(mode === 'production' ? '[name].[contenthash]' : '[name]')}.js`,
            },
          },
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { modules: false }],
              ],
            },
          },
        ],
        include: srcPath,
        exclude: modulesPath,
      },
      {
        test: /\.css/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: true,
            },
          },
        ],
        include: srcPath,
      },
      {
        test: /\.(bin|gif|jpg|png|svg|ttf|woff|woff2|mp3|ogg)$/,
        loader: 'file-loader',
        options: {
          name: `assets/${(mode === 'production' ? '[hash]' : '[name]')}.[ext]`,
        },
        include: srcPath,
      },
    ],
  },
  devtool: false,
  devServer: {
    historyApiFallback: {
      disableDotRule: true,
    },
    hot: true,
    port: 8080,
    stats: 'minimal',
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        terserOptions: {
          compress: {
            pure_funcs: ['console.log'],
          },
        },
      }),
    ],
    runtimeChunk: {
      name: 'manifest',
    },
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
  performance: { hints: false },
  stats: { children: false, entrypoints: false, modules: false },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
      },
      __ANALYTICS__: JSON.stringify(analyticsId),
      __API__: JSON.stringify(api),
      __BASENAME__: JSON.stringify(basename),
      __DOMAIN__: JSON.stringify(domain),
      __PRODUCTION__: JSON.stringify(mode === 'production'),
      __VERSION__: JSON.stringify(version),
    }),
    new HtmlWebpackPlugin({
      csp: (
        `default-src 'self' ${api} ${analyticsCDN} ${soundcloudCDN}${mode === 'development' ? " ws: 'unsafe-eval'" : ''};`
        + `font-src 'self' ${robotoCDN};`
        + `style-src 'self' ${fontsCDN} 'unsafe-inline';`
      ),
      domain,
      minify: { collapseWhitespace: true },
      description: 'A recursive VR experience',
      template: path.join(srcPath, 'index.ejs'),
      title: 'RealmsVR',
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
    new MiniCssExtractPlugin({
      filename: 'code/[name].[contenthash].css',
    }),
    ...(mode === 'production' ? [
      new CleanWebpackPlugin(),
      new webpack.HashedModuleIdsPlugin(),
      new RobotstxtPlugin({
        policy: [{
          userAgent: '*',
          allow: '/',
        }],
      }),
      new GHPagesSPAWebpackPlugin({
        domain,
      }),
      new webpack.SourceMapDevToolPlugin({
        test: /\.js$/,
        filename: 'code/[name].[contenthash].js.map',
        exclude: /(manifest|vendor)/,
      }),
      ...(process.env.npm_config_report ? ([
        new BundleAnalyzerPlugin(),
      ]) : []),
    ] : [
      new webpack.NamedModulesPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.EvalSourceMapDevToolPlugin({
        moduleFilenameTemplate: info => (
          `file:///${info.absoluteResourcePath}`
        ),
      }),
    ]),
  ],
};

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { generateBuildInfo } = require('./scripts/generate-build-info');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  // Generate build info at build time
  const buildInfo = generateBuildInfo();
  const buildInfoHtml = isProduction 
    ? `v${buildInfo.version}-${buildInfo.gitCommit}`
    : `v${buildInfo.version} | ${buildInfo.buildType} | ${buildInfo.shortTimestamp}<br/>${buildInfo.buildId}`;
  
  return {
    mode: isProduction ? 'production' : 'development',
    
    // Multiple entry points for different builds
    entry: {
      // Main game bundle - concatenated files
      bundle: './src/bundle-entry.js',
      // Editor bundle (separate)
      editor: './src/editor-entry.js'
    },
    
    // Watch source files for changes and trigger concatenation
    watchOptions: {
      ignored: /node_modules/,
      poll: 1000,
    },
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true
    },
    
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: {
                    browsers: ['> 1%', 'last 2 versions']
                  }
                }]
              ]
            }
          }
        }
      ]
    },
    
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction,
              drop_debugger: true,
              pure_funcs: ['console.log']
            },
            mangle: true,
            format: {
              comments: false
            }
          },
          extractComments: false
        })
      ]
    },
    
    plugins: [
      // Copy static assets
      new CopyWebpackPlugin({
        patterns: [
          { from: 'styles.css', to: 'styles.css' },
          { from: 'editor_styles.css', to: 'editor_styles.css' },
          { from: 'assets/css', to: 'assets/css' },
          { from: 'assets/js', to: 'assets/js' },
          { from: 'assets/fonts', to: 'assets/fonts' },
          { from: 'assets/sounds', to: 'assets/sounds' },
          { from: 'levels', to: 'levels' },
          { from: 'favicon.svg', to: 'favicon.svg' },
          { from: 'editor_favicon.svg', to: 'editor_favicon.svg' }
        ]
      }),
      
      // Generate main HTML file with proper script injection
      new HtmlWebpackPlugin({
        template: './src/index.template.html',
        filename: 'index.html',
        chunks: ['bundle'],
        inject: 'body', // Inject at end of body
        scriptLoading: 'blocking', // Use blocking instead of defer
        minify: isProduction,
        templateParameters: {
          BUILD_PLACEHOLDER: buildInfoHtml
        }
      }),
      
      // Generate editor HTML file
      new HtmlWebpackPlugin({
        template: './src/editor.template.html',
        filename: 'editor.html',
        chunks: ['editor'],
        inject: 'head', // Inject in head to ensure functions are available before onclick handlers
        scriptLoading: 'blocking', // Use blocking instead of defer
        minify: isProduction,
        templateParameters: {
          BUILD_PLACEHOLDER: buildInfoHtml
        }
      })
    ],
    
    devtool: isProduction ? false : 'source-map',
    
    devServer: {
      static: path.join(__dirname, 'dist'),
      port: 8080,
      open: true,
      hot: true,
      liveReload: true,
      watchFiles: {
        paths: [
          'constants.js',
          'utils.js',
          'html-builder.js',
          'display-manager.js',
          'managers/**/*.js',
          'app.js',
          'app-bridge.js',
          'src/editor.js'
        ],
        options: {
          usePolling: false,
          interval: 100
        }
      }
    },
    
    stats: {
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }
  };
}; 
const mode = 'development'
let client = {
  mode,
  devtool: 'source-map',
  target: 'web',
  entry: ['babel-polyfill','./src/index.js'],
  output: {
    filename: 'index.bundle.js',
    path: __dirname + '/public/js/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ["@babel/preset-env","@babel/preset-react"],
          plugins: [
            ["@babel/plugin-proposal-decorators", { legacy: true }],
            ["@babel/plugin-proposal-class-properties", { loose: true }],
          ]
        }
      }
    ]
  },
  resolve: {
    alias: {
      Containers: __dirname+'/src/containers/',
      Classes: __dirname+'/src/classes/',
      Stores: __dirname+'/src/stores/index.js',
    }
  }
}


let server = {
  entry: ['babel-polyfill','./server.js'],
  devtool: 'source-map',
  output: {
    filename: 'server.bundle.js',
    path: __dirname+'/'
  },
  mode,
  target: 'node',
  externals: {
    uws: "uws"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ["@babel/preset-env"],
          plugins: ["@babel/plugin-proposal-class-properties"]
        }
      }
    ]
  }
}



module.exports = [client]

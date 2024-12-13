const path = require('path');

const loaderRules = [
    {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
    },
    { 
        test: /\.s?css$/,
        use: [
          { loader: 'style-loader' },
          'css-loader', 
          "sass-loader"
        ],
      },
    { test: /\.svg$/, loader: 'svg-url-loader' }
];

module.exports = [{
    entry:{
        "quick-word": path.join(__dirname, "/src/main/quickWord/QuickWord.ts")
    },
    output:{
        path: path.join(__dirname, "/bin/js"),
        filename:"[name].js"
    },

    devtool:'source-map',
    mode: 'development',
    resolve:{
        extensions:[".ts", ".tsx", ".js"]
    },
    module: {
        rules: loaderRules
    },
}];
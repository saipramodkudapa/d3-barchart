const HtmlWebPackPlugin = require('html-webpack-plugin')

const htmlPlugin = new HtmlWebPackPlugin({
  template: './src/index.html',
  filename: './index.html'
})

module.exports = {
    module: {
        rules: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
            loader: 'babel-loader'
            }
        },
        {
            test: /\.css$/,
            use: [
            {
                loader: 'style-loader'
            },
            {
                loader: 'css-loader',
                options: {
                modules: true,
                importLoaders: 1,
                localIdentName: '[name]_[local]_[hash:base64]',
                sourceMap: true,
                minimize: true
                }
            }
            ]
        },
        // {
        //     test: /\.csv$/,
        //     loader: 'csv-loader',
        //     options: {
        //         dynamicTyping: true,
        //         header: true,
        //         skipEmptyLines: true,
        //         delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
        //     }
        //   }
        {
            test: /\.(c|d|t)sv$/, // load all .csv, .dsv, .tsv files with dsv-loader
            use: ['dsv-loader'] // or dsv-loader?delimiter=,
        }
        ]
    },
    plugins: [htmlPlugin]
}
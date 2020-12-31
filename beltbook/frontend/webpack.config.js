const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const path = require("path");

module.exports = (env, argv) => {
    const config = {
        resolve: {
            alias: {
                "../../theme.config$": path.join(__dirname, "src/semantic-ui/theme.config"),
                "../semantic-ui/site": path.join(__dirname, "/semantic-ui/site")
            }
        },
        module: {
            rules: [
                //LESS
                {
                    test: /\.(less)$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        "css-loader",
                        "less-loader"
                    ]
                },

                // this handles images
                {
                    test: /\.jpe?g$|\.gif$|\.ico$|\.png$|\.svg$/,
                    use: 'file-loader?name=[name].[ext]?[hash]'
                },

                // the following rules handle font extraction
                {
                    test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    loader: 'url-loader?limit=10000&mimetype=application/font-woff'
                },
                {
                    test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    loader: 'file-loader'
                },
                {
                    test: /\.otf(\?.*)?$/,
                    use: 'file-loader?name=/fonts/[name].[ext]&mimetype=application/font-otf'
                },
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader"
                    }
                }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin(),
        ]
    }

    if (argv.mode === 'production') {
        config.optimization = {
            minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
        }
    }
    return config;
};
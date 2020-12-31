module.exports = {
    webpack: {
        configure: (webpackConfig, {env, paths}) => {
            return webpackConfig;
        }
    },
    plugins: [{plugin: require('@semantic-ui-react/craco-less')}],
};
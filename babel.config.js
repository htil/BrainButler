module.exports = function(api)
{
	api.cache.never();

	return {
		presets: ["module:metro-react-native-babel-preset"]
	};
}


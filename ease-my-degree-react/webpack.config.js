const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      "buffer": require.resolve("buffer/"),
      "crypto": require.resolve("crypto-browserify"),
      "util": require.resolve("util/"),
      "stream": require.resolve("stream-browserify")
    }
  },
  // Additional configuration can go here, like entry, output, etc.
};

/* eslint-disable */
import path from 'path';

exports.onCreateWebpackConfig = (args) => {
  args.actions.setWebpackConfig({
    resolve: {
      modules: [path.resolve(__dirname, "../src"), "node_modules"],
    },
  });
};

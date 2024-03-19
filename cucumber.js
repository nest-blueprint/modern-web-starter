let common = [
  './module/core/feature/**/*.feature', // Specify our feature files
  '--require-module ts-node/register', // Load TypeScript module
  '--require ./dist/module/core/feature/step/**/*.js', // Load step definitions
  '--publish-quiet',
].join(' ');

module.exports = {
  default: common,
};

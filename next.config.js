const path = require('path');

/** @type {import('next').NextConfig} */
module.exports = {
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    config.resolve.alias['@lib'] = path.resolve(__dirname, 'src/lib');
    return config;
  },
};

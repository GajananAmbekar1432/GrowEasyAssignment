/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    // Ensure Turbopack uses the frontend folder as the workspace root
    root: path.join(__dirname),
  },
};

module.exports = nextConfig;

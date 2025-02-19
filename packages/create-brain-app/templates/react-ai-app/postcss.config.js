/** @type {import('postcss-load-config').Config} */
export default {
  plugins: {
    // https://tailwindcss.com/docs/upgrade-guide#using-postcss
    // 默认包含了 autoprefixer
    '@tailwindcss/postcss': {}
  }
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: "loose", // 添加此配置解决ESM包引用问题
  },
};

module.exports = nextConfig;

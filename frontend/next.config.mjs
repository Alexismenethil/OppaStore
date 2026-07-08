/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      // El admin puede pegar URLs de imagen arbitrarias (fallback sin Cloudinary).
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;

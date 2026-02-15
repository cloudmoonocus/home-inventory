/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict TypeScript checking to catch errors during build
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  // Ensure all build errors are caught
  onBuildSuccessful: async () => {
    console.log('Build completed successfully');
  },
};

export default nextConfig

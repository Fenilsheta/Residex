/** @type {import('next').NextConfig} */
const nextConfig = {
    
    experimental: {
      appDir: true,  // Ensure this is enabled for Next.js 13+
    },
    images: {
      domains: ["bfdmxfdukysnmuxdybpc.supabase.co","img.clerk.com"], // Replace with your actual Supabase project domain
      // remotePatterns: [
      //   {
      //     protocol: "https",
      //     hostname: "**.supabase.co",
      //   },
      // ],
    },

  };
  
export default nextConfig;
  
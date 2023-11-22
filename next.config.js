/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        config.module.rules.push({
          test: /\.wasm$/,
          loader: "base64-loader",
          type: "javascript/auto",
        });
    
        config.module.noParse = /\.wasm$/;
    
        config.module.rules.forEach((rule) => {
          (rule.oneOf || []).forEach((oneOf) => {
            if (oneOf.loader && oneOf.loader.indexOf("file-loader") >= 0) {
              oneOf.exclude.push(/\.wasm$/);
            }
          });
        });

        
    
        if (!isServer) {
          config.resolve.fallback.fs = false;
        }
    
        // Perform customizations to webpack config
        config.plugins.push(
          new webpack.IgnorePlugin({ resourceRegExp: /\/__tests__\// })
        );
    
        // Important: return the modified config
        return config;
      },typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
      },
}

module.exports = {
  ...nextConfig,
  env:{
    GITHUB_ID:process.env.GITHUB_ID,
    GITHUB_SECRET:process.env.GITHUB_SECRET,
    GOOGLE_ID:process.env.GOOGLE_ID,
    GOOGLE_SECRET:process.env.GOOGLE_SECRET,
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        
      },
      {
        protocol: "https",
        hostname: "icon.horse",
        pathname: '/icon/**',
        
      },
    ],
  },
}

import type { NextConfig } from 'next';
import { withPutty } from 'puttycss/next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withPutty(nextConfig);

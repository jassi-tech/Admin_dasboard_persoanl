import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
    transpilePackages: ['antd', '@ant-design/icons'],
};

export default withNextIntl(nextConfig);

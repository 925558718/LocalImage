import createNextIntlPlugin from "next-intl/plugin";
import { isLocal } from "./src/lib/utils";
/** @type {import('next').NextConfig} */
const nextConfig = {
    assetPrefix: isLocal() ? "https://static.limgx.com/localimage" : ""
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
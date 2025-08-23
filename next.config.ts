import createNextIntlPlugin from "next-intl/plugin";
import { isLocal } from "./src/lib/utils";
/** @type {import('next').NextConfig} */
const nextConfig = {
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
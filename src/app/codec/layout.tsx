import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "编解码工具集 - LocalImage",
  description: "全面的编码解码工具集合，包括Base64、URL、HTML、Unicode、十六进制、二进制编解码和JWT解析器。本地处理，保护数据隐私。",
  keywords: ["编解码", "base64", "url编码", "html实体", "unicode", "十六进制", "二进制", "jwt解析", "开发工具"],
};

export default function CodecLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
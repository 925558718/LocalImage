"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Button } from "@/components/shadcn/button";
import { ArrowRight } from "lucide-react";

interface CodecTool {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const CodecOverviewPage = () => {
  const codecTools: CodecTool[] = [
    {
      href: "/codec/base64",
      title: "Base64 编解码",
      description: "Base64编码和解码，用于二进制数据的文本表示",
      color: "from-blue-500 to-cyan-500",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      href: "/codec/url",
      title: "URL 编解码",
      description: "URL编码和解码，处理URL中的特殊字符",
      color: "from-green-500 to-emerald-500",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    },
    {
      href: "/codec/html",
      title: "HTML 实体编解码",
      description: "HTML实体编码和解码，防止XSS攻击",
      color: "from-orange-500 to-red-500",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    },
    {
      href: "/codec/unicode",
      title: "Unicode 转义编解码",
      description: "Unicode转义序列编码和解码",
      color: "from-purple-500 to-pink-500",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3v18M15 8l4-4 4 4-4 4-4-4z" />
        </svg>
      )
    },
    {
      href: "/codec/hex",
      title: "十六进制编解码",
      description: "十六进制编码和解码，查看数据的字节表示",
      color: "from-yellow-500 to-orange-500",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      href: "/codec/binary",
      title: "二进制编解码",
      description: "二进制编码和解码，查看数据的位表示",
      color: "from-gray-500 to-slate-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      )
    },
    {
      href: "/codec/jwt",
      title: "JWT Token 解析",
      description: "JWT令牌解析，查看Header、Payload和Signature",
      color: "from-indigo-500 to-purple-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          编解码工具集
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          全面的编码解码工具集合，支持多种格式转换，保护您的数据隐私，所有处理都在本地完成
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {codecTools.map((tool) => (
          <Card key={tool.href} className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-3">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tool.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform duration-300`}>
                {tool.icon}
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                {tool.title}
              </CardTitle>
              <CardDescription className="text-sm">
                {tool.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={tool.href}>
                <Button className="w-full group/btn" variant="outline">
                  <span className="mr-2">开始使用</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 p-6 bg-muted/50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">功能特点</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">本地处理</h3>
            <p className="text-sm text-muted-foreground">所有编解码操作都在浏览器本地完成，保护数据隐私</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">高速处理</h3>
            <p className="text-sm text-muted-foreground">实时编解码，无需等待，支持大文本处理</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">格式全面</h3>
            <p className="text-sm text-muted-foreground">支持常见的编码格式，满足开发中的各种需求</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">易于使用</h3>
            <p className="text-sm text-muted-foreground">简洁的界面设计，一键复制，快速上手</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodecOverviewPage; 
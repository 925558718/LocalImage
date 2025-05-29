"use client";

import React, { useState } from "react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { Textarea } from "@/components/shadcn/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Copy, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const jwtUtils = {
  decode: (token: string): { header: any, payload: any, signature: string } => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('无效的JWT令牌格式');
      }
      
      // JWT使用URL-safe Base64编码
      const base64Decode = (str: string): string => {
        // 将URL-safe Base64转换为标准Base64
        let standardBase64 = str.replace(/-/g, '+').replace(/_/g, '/');
        // 添加必要的填充
        while (standardBase64.length % 4) {
          standardBase64 += '=';
        }
        return decodeURIComponent(escape(atob(standardBase64)));
      };
      
      const header = JSON.parse(base64Decode(parts[0]));
      const payload = JSON.parse(base64Decode(parts[1]));
      
      return {
        header,
        payload,
        signature: parts[2]
      };
    } catch (error) {
      throw new Error('无效的JWT令牌');
    }
  }
};

const JwtCodecPage = () => {
  const [jwtToken, setJwtToken] = useState('');
  const [jwtResult, setJwtResult] = useState<any>(null);

  const parseJWT = () => {
    try {
      const result = jwtUtils.decode(jwtToken);
      setJwtResult(result);
      toast.success('JWT解析成功！');
    } catch (error) {
      toast.error(`JWT解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setJwtResult(null);
    }
  };

  const clear = () => {
    setJwtToken('');
    setJwtResult(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板！');
  };

  const formatTimestamp = (timestamp: number): string => {
    if (!timestamp) return '未设置';
    try {
      return new Date(timestamp * 1000).toLocaleString('zh-CN');
    } catch {
      return '无效时间戳';
    }
  };

  const isExpired = (exp: number): boolean => {
    if (!exp) return false;
    return Date.now() / 1000 > exp;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          JWT Token 解析器
        </h1>
        <p className="text-muted-foreground">
          解析JWT令牌结构，查看Header、Payload和Signature内容
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>JWT Token Parser</CardTitle>
            <CardDescription>
              输入JWT令牌以查看其结构和内容（仅用于解析，不验证签名）
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>JWT Token</Label>
              <Textarea
                placeholder="粘贴JWT令牌到这里..."
                value={jwtToken}
                onChange={(e) => setJwtToken(e.target.value)}
                className="min-h-[120px] font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={parseJWT} className="flex-1">
                解析JWT令牌
              </Button>
              <Button onClick={clear} variant="outline">
                清空
              </Button>
            </div>

            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ 此工具仅用于解析JWT结构，不验证签名。请勿信任未验证的JWT内容。
              </span>
            </div>
          </CardContent>
        </Card>

        {jwtResult && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Header（头部）</CardTitle>
                <CardDescription>
                  包含令牌类型和签名算法信息
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto border font-mono">
                    <code>{JSON.stringify(jwtResult.header, null, 2)}</code>
                  </pre>
                  <Button
                    onClick={() => copyToClipboard(JSON.stringify(jwtResult.header, null, 2))}
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payload（负载）</CardTitle>
                <CardDescription>
                  包含声明信息，如用户数据、过期时间等
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto border font-mono">
                    <code>{JSON.stringify(jwtResult.payload, null, 2)}</code>
                  </pre>
                  <Button
                    onClick={() => copyToClipboard(JSON.stringify(jwtResult.payload, null, 2))}
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                {/* 显示常见的JWT claims */}
                {jwtResult.payload && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-sm">常见声明字段:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {jwtResult.payload.iss && (
                        <div>
                          <span className="font-medium text-muted-foreground">签发者 (iss):</span>
                          <span className="ml-2">{jwtResult.payload.iss}</span>
                        </div>
                      )}
                      {jwtResult.payload.sub && (
                        <div>
                          <span className="font-medium text-muted-foreground">主题 (sub):</span>
                          <span className="ml-2">{jwtResult.payload.sub}</span>
                        </div>
                      )}
                      {jwtResult.payload.aud && (
                        <div>
                          <span className="font-medium text-muted-foreground">受众 (aud):</span>
                          <span className="ml-2">{Array.isArray(jwtResult.payload.aud) ? jwtResult.payload.aud.join(', ') : jwtResult.payload.aud}</span>
                        </div>
                      )}
                      {jwtResult.payload.exp && (
                        <div>
                          <span className="font-medium text-muted-foreground">过期时间 (exp):</span>
                          <span className={`ml-2 ${isExpired(jwtResult.payload.exp) ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            {formatTimestamp(jwtResult.payload.exp)}
                            {isExpired(jwtResult.payload.exp) && ' (已过期)'}
                          </span>
                        </div>
                      )}
                      {jwtResult.payload.iat && (
                        <div>
                          <span className="font-medium text-muted-foreground">签发时间 (iat):</span>
                          <span className="ml-2">{formatTimestamp(jwtResult.payload.iat)}</span>
                        </div>
                      )}
                      {jwtResult.payload.nbf && (
                        <div>
                          <span className="font-medium text-muted-foreground">生效时间 (nbf):</span>
                          <span className="ml-2">{formatTimestamp(jwtResult.payload.nbf)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Signature（签名）</CardTitle>
                <CardDescription>
                  用于验证令牌完整性的签名部分
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Input
                    value={jwtResult.signature}
                    readOnly
                    className="font-mono text-sm bg-muted"
                  />
                  <Button
                    onClick={() => copyToClipboard(jwtResult.signature)}
                    size="sm"
                    className="absolute top-1 right-1"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>JWT 说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• JWT (JSON Web Token) 由三部分组成：Header.Payload.Signature</p>
              <p>• Header 包含令牌类型（typ）和签名算法（alg）</p>
              <p>• Payload 包含声明（claims），如用户信息、过期时间等</p>
              <p>• Signature 用于验证令牌的完整性和真实性</p>
              <p>• <strong>重要：</strong>此工具仅解析令牌结构，不验证签名有效性</p>
              
              <div className="mt-4 p-3 bg-background rounded border">
                <h5 className="font-medium text-foreground mb-2">常见声明字段说明：</h5>
                <div className="space-y-1 text-xs">
                  <div><span className="font-medium">iss:</span> 签发者（Issuer）</div>
                  <div><span className="font-medium">sub:</span> 主题（Subject），通常是用户ID</div>
                  <div><span className="font-medium">aud:</span> 受众（Audience），令牌的目标接收者</div>
                  <div><span className="font-medium">exp:</span> 过期时间（Expiration Time）</div>
                  <div><span className="font-medium">iat:</span> 签发时间（Issued At）</div>
                  <div><span className="font-medium">nbf:</span> 生效时间（Not Before）</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JwtCodecPage; 
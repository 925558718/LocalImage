"use client";

import React, { useState } from "react";
import { Button } from "@/components/shadcn/button";
import { Label } from "@/components/shadcn/label";
import { Textarea } from "@/components/shadcn/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Copy, RefreshCw, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

const urlUtils = {
  encode: (text: string): string => {
    return encodeURIComponent(text);
  },
  decode: (encoded: string): string => {
    try {
      return decodeURIComponent(encoded);
    } catch (error) {
      throw new Error('无效的URL编码字符串');
    }
  }
};

const UrlCodecPage = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  const encode = () => {
    try {
      const result = urlUtils.encode(inputText);
      setOutputText(result);
      toast.success('URL编码成功！');
    } catch (error) {
      toast.error(`编码失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const decode = () => {
    try {
      const result = urlUtils.decode(inputText);
      setOutputText(result);
      toast.success('URL解码成功！');
    } catch (error) {
      toast.error(`解码失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const swap = () => {
    const temp = inputText;
    setInputText(outputText);
    setOutputText(temp);
  };

  const clear = () => {
    setInputText('');
    setOutputText('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板！');
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          URL 编解码
        </h1>
        <p className="text-muted-foreground">
          URL编码和解码工具，处理URL中的特殊字符，确保URL的正确传输
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>URL Encoding & Decoding</CardTitle>
          <CardDescription>
            对URL中的特殊字符进行编码，或将编码后的URL还原
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>输入文本</Label>
              <Textarea
                placeholder="输入要编码或解码的URL文本..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[300px] font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label>输出结果</Label>
              <div className="relative">
                <Textarea
                  placeholder="结果将显示在这里..."
                  value={outputText}
                  readOnly
                  className="min-h-[300px] font-mono bg-muted"
                />
                {outputText && (
                  <Button
                    onClick={() => copyToClipboard(outputText)}
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={encode} className="flex-1">
              URL编码
            </Button>
            <Button onClick={decode} variant="outline" className="flex-1">
              URL解码
            </Button>
            <Button onClick={swap} variant="outline" size="icon">
              <ArrowRightLeft className="w-4 h-4" />
            </Button>
            <Button onClick={clear} variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">URL编码说明</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• URL编码（百分号编码）将URL中的特殊字符转换为安全格式</p>
              <p>• 空格变成%20，&变成%26，中文字符被编码为UTF-8字节序列</p>
              <p>• 用于确保URL在不同系统间正确传输和解析</p>
              <p>• 常用于表单提交、API请求参数等场景</p>
              
              <div className="mt-3 p-3 bg-background rounded border">
                <h5 className="font-medium text-foreground mb-2">常见转换示例：</h5>
                <div className="space-y-1 text-xs">
                  <div><span className="text-green-600">空格：</span> " " → "%20"</div>
                  <div><span className="text-green-600">中文：</span> "你好" → "%E4%BD%A0%E5%A5%BD"</div>
                  <div><span className="text-green-600">符号：</span> "&" → "%26", "?" → "%3F"</div>
                  <div><span className="text-green-600">邮箱：</span> "test@example.com" → "test%40example.com"</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UrlCodecPage; 
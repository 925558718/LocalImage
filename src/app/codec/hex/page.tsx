"use client";

import React, { useState } from "react";
import { Button } from "@/components/shadcn/button";
import { Label } from "@/components/shadcn/label";
import { Textarea } from "@/components/shadcn/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Copy, RefreshCw, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

const hexUtils = {
  encode: (text: string): string => {
    return Array.from(new TextEncoder().encode(text))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  },
  decode: (encoded: string): string => {
    try {
      const bytes = encoded.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
      return new TextDecoder().decode(new Uint8Array(bytes));
    } catch (error) {
      throw new Error('无效的十六进制字符串');
    }
  }
};

const HexCodecPage = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  const encode = () => {
    try {
      const result = hexUtils.encode(inputText);
      setOutputText(result);
      toast.success('十六进制编码成功！');
    } catch (error) {
      toast.error(`编码失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const decode = () => {
    try {
      const result = hexUtils.decode(inputText);
      setOutputText(result);
      toast.success('十六进制解码成功！');
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
        <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
          十六进制编解码
        </h1>
        <p className="text-muted-foreground">
          十六进制编码和解码工具，查看文本的字节级表示
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hexadecimal Encoding &amp; Decoding</CardTitle>
          <CardDescription>
            将文本转换为十六进制表示或将十六进制数据还原为文本
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>输入文本</Label>
              <Textarea
                placeholder="输入要编码或解码的文本..."
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
              十六进制编码
            </Button>
            <Button onClick={decode} variant="outline" className="flex-1">
              十六进制解码
            </Button>
            <Button onClick={swap} variant="outline" size="icon">
              <ArrowRightLeft className="w-4 h-4" />
            </Button>
            <Button onClick={clear} variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">十六进制编码说明</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• 十六进制（Hex）使用0-9和A-F字符表示数据的字节值</p>
              <p>• 每个字节用两个十六进制字符表示（00-FF）</p>
              <p>• 常用于程序调试、数据分析和底层编程</p>
              <p>• 可以直观地看到文本的UTF-8字节编码</p>
              
              <div className="mt-3 p-3 bg-background rounded border">
                <h5 className="font-medium text-foreground mb-2">编码示例：</h5>
                <div className="space-y-1 text-xs">
                  <div><span className="text-yellow-600">ASCII：</span> &quot;Hello&quot; → &quot;48656c6c6f&quot;</div>
                  <div><span className="text-yellow-600">数字：</span> &quot;123&quot; → &quot;313233&quot;</div>
                  <div><span className="text-yellow-600">中文：</span> &quot;你好&quot; → &quot;e4bda0e5a5bd&quot;</div>
                  <div><span className="text-yellow-600">符号：</span> &quot;@#$&quot; → &quot;402324&quot;</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HexCodecPage; 
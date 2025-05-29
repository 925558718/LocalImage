"use client";

import React, { useState } from "react";
import { Button } from "@/components/shadcn/button";
import { Label } from "@/components/shadcn/label";
import { Textarea } from "@/components/shadcn/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Copy, RefreshCw, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

const base64Utils = {
  encode: (text: string): string => {
    try {
      return btoa(unescape(encodeURIComponent(text)));
    } catch (error) {
      throw new Error('无效的Base64编码输入');
    }
  },
  decode: (encoded: string): string => {
    try {
      return decodeURIComponent(escape(atob(encoded)));
    } catch (error) {
      throw new Error('无效的Base64字符串');
    }
  }
};

const Base64CodecPage = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  const encode = () => {
    try {
      const result = base64Utils.encode(inputText);
      setOutputText(result);
      toast.success('Base64编码成功！');
    } catch (error) {
      toast.error(`编码失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const decode = () => {
    try {
      const result = base64Utils.decode(inputText);
      setOutputText(result);
      toast.success('Base64解码成功！');
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
        <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Base64 编解码
        </h1>
        <p className="text-muted-foreground">
          Base64编码和解码工具，用于二进制数据的文本表示和传输
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Base64 Encoding & Decoding</CardTitle>
          <CardDescription>
            将文本转换为Base64编码或将Base64编码还原为原始文本
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
              Base64编码
            </Button>
            <Button onClick={decode} variant="outline" className="flex-1">
              Base64解码
            </Button>
            <Button onClick={swap} variant="outline" size="icon">
              <ArrowRightLeft className="w-4 h-4" />
            </Button>
            <Button onClick={clear} variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Base64编码说明</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• Base64是一种基于64个可打印字符来表示二进制数据的编码方法</p>
              <p>• 常用于在文本协议中传输二进制数据，如邮件附件、HTTP传输等</p>
              <p>• 编码后的数据大小约为原始数据的133%</p>
              <p>• 支持Unicode字符，可处理中文等多字节字符</p>
              
              <div className="mt-3 p-3 bg-background rounded border">
                <h5 className="font-medium text-foreground mb-2">示例：</h5>
                <div className="space-y-1 text-xs">
                  <div><span className="text-blue-600">原文：</span> Hello World</div>
                  <div><span className="text-green-600">编码：</span> SGVsbG8gV29ybGQ=</div>
                  <div className="mt-2">
                    <span className="text-blue-600">原文：</span> 你好世界
                  </div>
                  <div><span className="text-green-600">编码：</span> 5L2g5aW95LiW55WM</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Base64CodecPage; 
"use client";

import React, { useState } from "react";
import { Button } from "@/components/shadcn/button";
import { Label } from "@/components/shadcn/label";
import { Textarea } from "@/components/shadcn/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Copy, RefreshCw, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

const unicodeUtils = {
  encode: (text: string): string => {
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      return code > 127 ? `\\u${code.toString(16).padStart(4, '0')}` : char;
    }).join('');
  },
  decode: (encoded: string): string => {
    return encoded.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
      return String.fromCharCode(parseInt(code, 16));
    });
  }
};

const UnicodeCodecPage = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  const encode = () => {
    try {
      const result = unicodeUtils.encode(inputText);
      setOutputText(result);
      toast.success('Unicode编码成功！');
    } catch (error) {
      toast.error(`编码失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const decode = () => {
    try {
      const result = unicodeUtils.decode(inputText);
      setOutputText(result);
      toast.success('Unicode解码成功！');
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
        <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Unicode 转义编解码
        </h1>
        <p className="text-muted-foreground">
          Unicode转义序列编码和解码，用于JSON和JavaScript字符串处理
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unicode Escape Encoding & Decoding</CardTitle>
          <CardDescription>
            将非ASCII字符转换为Unicode转义序列（\uXXXX）或进行反向转换
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
              Unicode编码
            </Button>
            <Button onClick={decode} variant="outline" className="flex-1">
              Unicode解码
            </Button>
            <Button onClick={swap} variant="outline" size="icon">
              <ArrowRightLeft className="w-4 h-4" />
            </Button>
            <Button onClick={clear} variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Unicode转义编码说明</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• Unicode转义序列使用 \uXXXX 格式表示Unicode字符</p>
              <p>• 仅对非ASCII字符（码位 &gt; 127）进行编码，ASCII字符保持不变</p>
              <p>• 常用于JSON字符串、JavaScript代码和配置文件</p>
              <p>• 确保文本在任何编码环境下都能正确显示</p>
              
              <div className="mt-3 p-3 bg-background rounded border">
                <h5 className="font-medium text-foreground mb-2">编码示例：</h5>
                <div className="space-y-1 text-xs">
                  <div><span className="text-purple-600">中文：</span> &quot;你好&quot; → &quot;\\u4f60\\u597d&quot;</div>
                  <div><span className="text-purple-600">日文：</span> &quot;こんにちは&quot; → &quot;\\u3053\\u3093\\u306b\\u3061\\u306f&quot;</div>
                  <div><span className="text-purple-600">符号：</span> &quot;©®&quot; → &quot;\\u00a9\\u00ae&quot;</div>
                  <div><span className="text-purple-600">表情：</span> &quot;🚀&quot; → &quot;\\ud83d\\ude80&quot;</div>
                  <div><span className="text-purple-600">混合：</span> &quot;Hello 世界!&quot; → &quot;Hello \\u4e16\\u754c!&quot;</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnicodeCodecPage; 
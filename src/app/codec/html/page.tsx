"use client";

import React, { useState } from "react";
import { Button } from "@/components/shadcn/button";
import { Label } from "@/components/shadcn/label";
import { Textarea } from "@/components/shadcn/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Copy, RefreshCw, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

const htmlUtils = {
  encode: (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
  decode: (encoded: string): string => {
    const div = document.createElement('div');
    div.innerHTML = encoded;
    return div.textContent || div.innerText || '';
  }
};

const HtmlCodecPage = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  const encode = () => {
    try {
      const result = htmlUtils.encode(inputText);
      setOutputText(result);
      toast.success('HTML编码成功！');
    } catch (error) {
      toast.error(`编码失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const decode = () => {
    try {
      const result = htmlUtils.decode(inputText);
      setOutputText(result);
      toast.success('HTML解码成功！');
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
        <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          HTML 实体编解码
        </h1>
        <p className="text-muted-foreground">
          HTML实体编码和解码工具，防止XSS攻击，处理HTML特殊字符
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>HTML Entity Encoding & Decoding</CardTitle>
          <CardDescription>
            转换HTML特殊字符为实体或反之，保护网页安全
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>输入文本</Label>
              <Textarea
                placeholder="输入要编码或解码的HTML文本..."
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
              HTML编码
            </Button>
            <Button onClick={decode} variant="outline" className="flex-1">
              HTML解码
            </Button>
            <Button onClick={swap} variant="outline" size="icon">
              <ArrowRightLeft className="w-4 h-4" />
            </Button>
            <Button onClick={clear} variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">HTML实体编码说明</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• HTML编码将特殊字符转换为HTML实体，防止XSS攻击</p>
              <p>• 常见转换：&lt; → &amp;lt;, &gt; → &amp;gt;, &amp; → &amp;amp;</p>
              <p>• 引号转换：" → &amp;quot;, ' → &amp;#39;</p>
              <p>• 用于在HTML中安全显示用户输入的内容</p>
              
              <div className="mt-3 p-3 bg-background rounded border">
                <h5 className="font-medium text-foreground mb-2">示例：</h5>
                <div className="space-y-1 text-xs">
                  <div><span className="text-red-600">原文：</span> &lt;script&gt;alert("XSS")&lt;/script&gt;</div>
                  <div><span className="text-green-600">编码：</span> &amp;lt;script&amp;gt;alert(&amp;quot;XSS&amp;quot;)&amp;lt;/script&amp;gt;</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HtmlCodecPage; 
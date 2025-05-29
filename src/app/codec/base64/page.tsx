"use client";

import React, { useState } from "react";
import { Button } from "@/components/shadcn/button";
import { Label } from "@/components/shadcn/label";
import { Textarea } from "@/components/shadcn/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Copy, RefreshCw, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/hooks/useI18n";

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
  const { t } = useI18n();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  const encode = () => {
    try {
      const result = base64Utils.encode(inputText);
      setOutputText(result);
      toast.success(t('codec_encode_success'));
    } catch (error) {
      toast.error(`${t('codec_encode_failed')}: ${error instanceof Error ? error.message : t('codec_unknown_error')}`);
    }
  };

  const decode = () => {
    try {
      const result = base64Utils.decode(inputText);
      setOutputText(result);
      toast.success(t('codec_decode_success'));
    } catch (error) {
      toast.error(`${t('codec_decode_failed')}: ${error instanceof Error ? error.message : t('codec_unknown_error')}`);
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
    toast.success(t('codec_copied'));
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          {t('codec_base64_title')}
        </h1>
        <p className="text-muted-foreground">
          {t('codec_base64_desc')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Base64 Encoding & Decoding</CardTitle>
          <CardDescription>
            {t('codec_page_description_base64')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('codec_input_text')}</Label>
              <Textarea
                placeholder={t('codec_input_placeholder')}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[300px] font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('codec_output_result')}</Label>
              <div className="relative">
                <Textarea
                  placeholder={t('codec_output_placeholder')}
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
              {t('codec_base64_encode')}
            </Button>
            <Button onClick={decode} variant="outline" className="flex-1">
              {t('codec_base64_decode')}
            </Button>
            <Button onClick={swap} variant="outline" size="icon">
              <ArrowRightLeft className="w-4 h-4" />
            </Button>
            <Button onClick={clear} variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">{t('codec_base64_explanation')}</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>{t('codec_base64_explanation_1')}</p>
              <p>{t('codec_base64_explanation_2')}</p>
              <p>{t('codec_base64_explanation_3')}</p>
              <p>{t('codec_base64_explanation_4')}</p>
              
              <div className="mt-3 p-3 bg-background rounded border">
                <h5 className="font-medium text-foreground mb-2">{t('codec_base64_example')}</h5>
                <div className="space-y-1 text-xs">
                  <div><span className="text-blue-600">{t('codec_base64_original')}</span> Hello World</div>
                  <div><span className="text-green-600">{t('codec_base64_encoded')}</span> SGVsbG8gV29ybGQ=</div>
                  <div className="mt-2">
                    <span className="text-blue-600">{t('codec_base64_original')}</span> 你好世界
                  </div>
                  <div><span className="text-green-600">{t('codec_base64_encoded')}</span> 5L2g5aW95LiW55WM</div>
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
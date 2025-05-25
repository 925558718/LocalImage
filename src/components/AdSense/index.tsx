"use client";

import { useEffect, useState, useRef } from "react";
import { useI18n } from "@/hooks/useI18n";

interface AdSenseProps {
  className?: string;
  slot: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  style?: React.CSSProperties;
  responsive?: boolean;
  showLabel?: boolean;
}

export default function AdSense({
  className = "",
  slot,
  format = "auto",
  style,
  responsive = true,
  showLabel = true,
}: AdSenseProps) {
  const { t } = useI18n();
  const [isLoaded, setIsLoaded] = useState(false);
  const [adLabel, setAdLabel] = useState<string>("");
  const isDev = process.env.NODE_ENV === 'development';
  const adRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false); // 跟踪广告是否已初始化

  useEffect(() => {
    // 尝试获取广告标签的翻译，如果不存在则使用默认值
    try {
      setAdLabel(t('ad_label') || "Advertisement");
    } catch {
      setAdLabel("Advertisement");
    }

    // 只在生产环境中加载广告，并确保只初始化一次
    if (!isDev && !isInitialized.current) {
      const loadAd = setTimeout(() => {
        try {
          if (adRef.current && !isInitialized.current) {
            // 确保adsbygoogle已定义
            if (typeof window !== 'undefined' && window.adsbygoogle) {
              // 使用数组方法push
              (window.adsbygoogle = window.adsbygoogle || []).push({});
              setIsLoaded(true);
              isInitialized.current = true; // 标记为已初始化
              console.log("AdSense ad loaded for slot:", slot);
            }
          }
        } catch (err) {
          console.error("AdSense error:", err);
        }
      }, 100);

      return () => {
        clearTimeout(loadAd);
      };
    }
  }, [t, isDev, slot]);

  // 防止组件卸载后仍然尝试加载广告
  useEffect(() => {
    return () => {
      isInitialized.current = false;
    };
  }, []);

  return (
    <div className={`relative overflow-hidden my-4 mx-auto rounded-lg border bg-card text-card-foreground transition-all hover:shadow-md ${className}`}>
      {showLabel && (
        <div className="absolute top-0 right-0 px-2 py-0.5 text-xs bg-background/80 rounded-bl-lg text-muted-foreground backdrop-blur-sm z-10">
          {adLabel}
        </div>
      )}
      
      {isDev ? (
        // 开发环境中显示占位符
        <div 
          style={style || { display: "block", textAlign: "center", minHeight: "280px" }}
          className="flex items-center justify-center bg-muted/10 border-dashed border-2 border-muted"
        >
          <div className="text-muted-foreground text-sm">
            AdSense {slot} - {format}
            <p className="text-xs opacity-70">
              (广告仅在生产环境显示)
            </p>
          </div>
        </div>
      ) : (
        // 生产环境中显示实际广告
        <div ref={adRef}>
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-4 w-4 bg-primary/20 rounded-full mb-2"></div>
                <div className="h-2 w-16 bg-primary/20 rounded"></div>
              </div>
            </div>
          )}
          
          <ins
            className="adsbygoogle"
            style={style || { display: "block", textAlign: "center", minHeight: "280px" }}
            data-ad-client="ca-pub-3559955380533996"
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive={responsive ? "true" : "false"}
          />
        </div>
      )}
    </div>
  );
}

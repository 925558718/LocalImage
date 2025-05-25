"use client";

import { useEffect, useState, useRef } from "react";
import { useI18n } from "@/hooks/useI18n";

interface EzoicAdProps {
  className?: string;
  slotId: number;
  style?: React.CSSProperties;
  showLabel?: boolean;
}

export default function EzoicAd({
  className = "",
  slotId,
  style,
  showLabel = true,
}: EzoicAdProps) {
  const { t } = useI18n();
  const [isLoaded, setIsLoaded] = useState(false);
  const [adLabel, setAdLabel] = useState<string>("");
  const isDev = process.env.NODE_ENV === 'development';
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 尝试获取广告标签的翻译，如果不存在则使用默认值
    try {
      setAdLabel(t('ad_label') || "Advertisement");
    } catch {
      setAdLabel("Advertisement");
    }

    // 在生产环境中处理 Ezoic 广告
    if (!isDev && typeof window !== 'undefined') {
      // 使用 Ezoic 的 ezstandalone 来显示广告
      if (window.ezstandalone && window.ezstandalone.cmd) {
        window.ezstandalone.cmd.push(function() {
          try {
            if (window.ezstandalone) {
              window.ezstandalone.display(slotId);
              setIsLoaded(true);
              console.log("Ezoic ad loaded for slot ID:", slotId);
            }
          } catch (err) {
            console.error("Ezoic ad error:", err);
          }
        });
      }
    }
  }, [t, isDev, slotId]);

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
            Ezoic Ad Slot ID: {slotId}
            <p className="text-xs opacity-70">
              (广告仅在生产环境显示)
            </p>
          </div>
        </div>
      ) : (
        // 生产环境中显示 Ezoic 广告
        <div ref={adRef} style={style || { display: "block", minHeight: "280px" }}>
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-4 w-4 bg-primary/20 rounded-full mb-2"></div>
                <div className="h-2 w-16 bg-primary/20 rounded"></div>
              </div>
            </div>
          )}
          
          {/* Ezoic 广告位放置点 */}
          <div id={`ezoic-pub-ad-placeholder-${slotId}`}></div>
        </div>
      )}
    </div>
  );
}

// 为了保持向后兼容性，声明一个全局 ezstandalone 类型
declare global {
  interface Window {
    ezstandalone?: {
      cmd: any[];
      display: (slotId: number) => void;
    };
  }
}

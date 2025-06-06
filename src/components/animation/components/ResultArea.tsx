import { useTranslations } from "next-intl";
import { Button } from "@/components/shadcn";
import Image from "next/image";
import { Download } from "lucide-react";

interface AnimationResult {
  url: string;
  name: string;
  size: number;
  format: string;
}

interface ResultAreaProps {
  result: AnimationResult | null;
  onDownload: () => void;
  onClear: () => void;
}

export default function ResultArea({ result, onDownload, onClear }: ResultAreaProps) {
  const t = useTranslations();
  
  if (!result) return null;
  
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800/50 shadow-sm p-6 flex flex-col h-full">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
          {t("animation_result")}
        </h3>
        <div className="text-green-700 dark:text-green-300 space-y-1">
          <div className="font-semibold">
            {result.name}
          </div>
          <div className="text-sm">
            {(result.size / 1024 / 1024).toFixed(2)} MB
            • {result.format.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-green-200 dark:border-green-800/50">
          {result.format === "mp4" || result.format === "webm" ? (
            // 视频播放器
            <video
              src={result.url}
              controls
              autoPlay
              loop
              className="w-auto h-auto max-w-full max-h-48 mx-auto rounded-lg"
              style={{ maxWidth: "100%", maxHeight: "12rem" }}
            />
          ) : (
            // 图片展示
            <Image
              src={result.url}
              alt="Generated Animation"
              width={0}
              height={0}
              className="w-auto h-auto max-w-full max-h-48 mx-auto rounded-lg"
              style={{ maxWidth: "100%", maxHeight: "12rem" }}
              unoptimized // 由于是blob URL，需要禁用优化
              sizes="100vw"
            />
          )}
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <Button
          onClick={onDownload}
          size="sm"
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
        >
          <Download className="w-4 h-4 mr-2" />
          {t("download")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="bg-white dark:bg-slate-800 border-green-300 dark:border-green-700"
        >
          {t("clear_result")}
        </Button>
      </div>
    </div>
  );
} 
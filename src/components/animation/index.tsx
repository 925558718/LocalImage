"use client";
import ffm_ins from "@/lib/ffmpeg";
import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useFFmpeg } from "@/hooks/useFFmpeg";
import {
  Progress,
  Label,
} from "@/components/shadcn";
import { Loader2 } from "lucide-react";
import React from "react";
import styles from './animation.module.scss';
import {
  FormatSelector,
  AnimationControls,
  ActionButtons,
  PreviewArea,
  ResultArea,
  FileDropzone
} from './components';
import PageTitle from "@/components/PageTitle";

function AnimationComposer() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState("");
  const t = useTranslations();
  const {
    isLoading: ffmpegLoading,
    isReady: ffmpegReady,
    error: ffmpegError,
  } = useFFmpeg();
  const [animationResult, setAnimationResult] = useState<{
    url: string;
    name: string;
    size: number;
    format: string;
  } | null>(null);

  // 文件管理
  const [files, setFiles] = useState<File[]>([]);

  // 动画设置
  const [format, setFormat] = useState("webp");
  const [frameRate, setFrameRate] = useState([30]);
  const [quality, setQuality] = useState([75]);

  // 预览相关
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 文件排序函数 - 与FFmpeg中的逻辑保持一致
  const getSortedFiles = useCallback((files: File[]) => {
    return [...files].sort((a, b) => {
      // 提取文件名中的数字部分
      const extractNumbers = (filename: string): number[] => {
        const numbers = filename.match(/\d+/g);
        return numbers ? numbers.map((num) => Number.parseInt(num, 10)) : [];
      };

      const aNumbers = extractNumbers(a.name);
      const bNumbers = extractNumbers(b.name);

      // 按数字序列比较
      for (let i = 0; i < Math.max(aNumbers.length, bNumbers.length); i++) {
        const aNum = aNumbers[i] || 0;
        const bNum = bNumbers[i] || 0;
        if (aNum !== bNum) {
          return aNum - bNum;
        }
      }

      // 如果数字相同，按字符串排序
      return a.name.localeCompare(b.name);
    });
  }, []);

  // 处理新文件添加
  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  // 处理删除单个文件
  const handleRemoveFile = (file: File) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f !== file));
  };

  // 清空已选择的文件
  const handleClearFiles = () => {
    setFiles([]);
    stopPreview();
  };

  // 预览控制
  const startPreview = () => {
    if (files.length === 0) return;
    setIsPlaying(true);
    const sortedFiles = getSortedFiles(files);
    intervalRef.current = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % sortedFiles.length);
    }, 1000 / frameRate[0]);
  };

  const stopPreview = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const togglePreview = () => {
    if (isPlaying) {
      stopPreview();
    } else {
      startPreview();
    }
  };

  // 当帧率改变时，如果预览正在播放，重新启动预览
  useEffect(() => {
    if (isPlaying && files.length > 0 && intervalRef.current) {
      // 只有在预览正在播放时才重新启动
      clearInterval(intervalRef.current);

      const sortedFiles = getSortedFiles(files);
      intervalRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % sortedFiles.length);
      }, 1000 / frameRate[0]);
    }
  }, [frameRate[0], isPlaying, files, getSortedFiles]); // 添加缺失的依赖项

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // 处理动画合成
  async function handleCreateAnimation() {
    // 检查是否有足够的图片
    if (files.length < 2 || !ffmpegReady) return;

    // 显示文件排序信息
    const sortedFiles = getSortedFiles(files);

    setLoading(true);
    setProgress(0);
    setCurrentFileName(t("initializing_status"));
    stopPreview();

    try {
      if (!ffm_ins) {
        throw new Error(t("ffmpeg_not_initialized"));
      }

      setCurrentFileName(t("composing_animation"));
      const outputName = `animation_${Date.now()}.${format}`;

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // 确定视频编解码器（仅MP4需要）
      let videoCodec = "";
      if (format === "mp4") {
        videoCodec = "libx264"; // MP4标准编解码器
      }

      const result = await ffm_ins.createAnimation({
        images: files,
        outputName,
        frameRate: frameRate[0],
        quality: quality[0],
        videoCodec: videoCodec,
        format: format,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const mimeMap: Record<string, string> = {
        webp: "image/webp",
        gif: "image/gif",
        mp4: "video/mp4"
      };

      const blob = new Blob([result], {
        type: mimeMap[format] || "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);

      setAnimationResult({
        url,
        name: outputName,
        size: blob.size,
        format,
      });

      setCurrentFileName(t("composition_complete"));
      setTimeout(() => {
        setCurrentFileName("");
      }, 1000);
    } catch (error) {
      alert(
        `${t("animation_failed")}: ${error instanceof Error ? error.message : t("unknown_error")}`,
      );
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }

  // 下载动画
  const handleDownload = () => {
    if (!animationResult) return;

    const link = document.createElement("a");
    link.href = animationResult.url;
    link.download = animationResult.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 清除结果
  const clearResult = () => {
    if (animationResult) {
      URL.revokeObjectURL(animationResult.url);
      setAnimationResult(null);
    }
  };

  return (
    <>
      <div className="w-full max-w-6xl mx-auto space-y-8">
        {/* Hero Title Section with Animation */}
        <PageTitle
          title={t("animation_composer")}
          description={t("animation_desc")}
          features={[
            { text: "WebP & GIF", color: "green" },
            { text: t("local_processing"), color: "blue" },
            { text: t("real_time_preview"), color: "purple" }
          ]}
        />

        {/* Modern Container with Glass Effect */}
        <div className="bg-background/70 backdrop-blur-xl border border-border/30 rounded-2xl shadow-2xl overflow-hidden relative">
          {/* Loading 状态指示器 - 绝对定位在容器外部顶部 */}
          {(ffmpegLoading || !ffmpegReady || loading) && (
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10 bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm rounded-2xl p-3 border border-primary/20 shadow-lg">
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-primary font-medium text-sm">
                  {ffmpegLoading || !ffmpegReady
                    ? t("load_ffmpeg")
                    : t("creating_animation")}
                </span>
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-8 py-6 border-b border-border/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <title>limgx</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {t("animation_composer")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t("animation_composer_subtitle")}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              {files.length > 0 && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                    <span className="w-2 h-2 bg-primary rounded-full"/>
                    <span className="text-primary">
                      {files.length} {t("images_count")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-accent/10 rounded-full">
                    <span className="w-2 h-2 bg-accent rounded-full"/>
                    <span className="text-accent-foreground">
                      {frameRate[0]} FPS
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Control Panel */}
          <div className="px-8 py-6 bg-muted/50 border-b border-border/50">
            <div className="flex flex-wrap items-center justify-center gap-6">
              {/* Format Selection */}
              <FormatSelector 
                value={format} 
                onChange={setFormat} 
              />

              {/* Animation Controls */}
              <AnimationControls 
                frameRate={frameRate}
                quality={quality}
                onFrameRateChange={setFrameRate}
                onQualityChange={setQuality}
              />

              {/* Action Buttons */}
              <ActionButtons 
                isPlaying={isPlaying}
                loading={loading}
                ffmpegLoading={ffmpegLoading}
                ffmpegReady={ffmpegReady}
                filesCount={files.length}
                onPreviewToggle={togglePreview}
                onCreateAnimation={handleCreateAnimation}
              />
            </div>
          </div>

          {/* Progress Bar */}
          {loading && (
            <div className="px-8 py-4 bg-primary/10 border-b border-primary/20">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-primary font-medium">
                  {currentFileName || t("creating_animation")}
                </span>
                <span className="text-primary font-bold">
                  {progress}%
                </span>
              </div>
              <Progress
                value={progress}
                className="w-full h-2 bg-primary/20 [&>div]:bg-primary"
              />
            </div>
          )}

          {/* Main Content Area */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px]">
              {/* Left Panel: File Upload */}
              <div className="flex flex-col h-full">
                {/* File Upload Area */}
                <FileDropzone
                  files={files}
                  onAddFiles={handleFilesSelected}
                  onRemoveFile={handleRemoveFile}
                  onClearFiles={handleClearFiles}
                  getSortedFiles={getSortedFiles}
                />
              </div>

              {/* Right Panel: Preview/Result */}
              <div className="flex flex-col h-full">
                {files.length > 0 ? (
                  !animationResult ? (
                    // Preview Area
                    <PreviewArea 
                      files={files}
                      currentFrame={currentFrame}
                      getSortedFiles={getSortedFiles}
                    />
                  ) : (
                    // Result Area
                    <ResultArea 
                      result={animationResult}
                      onDownload={handleDownload}
                      onClear={clearResult}
                    />
                  )
                ) : (
                  // Empty State - 使用 PreviewArea 组件的空状态显示
                  <PreviewArea 
                    files={[]}
                    currentFrame={0}
                    getSortedFiles={getSortedFiles}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AnimationComposer;

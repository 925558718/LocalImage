"use client";
import Dropzone from "@/components/DropZone";
import {
    Button,
    Progress,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Slider,
} from "@/components/shadcn";
import { useFFmpeg } from "@/hooks/useFFmpeg";
import ffm_ins from "@/lib/ffmpeg";
import {
    OutputType,
    convertFilesToInputFileType,
} from "@/lib/fileUtils";
import { generateFFMPEGCommand } from "@/lib/strategy/upscale";
import { Loader2, ZoomIn, TrendingUp, Download, Trash2, ShieldCheck, ChartArea, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

function UpscaleComposer() {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentFileName, setCurrentFileName] = useState("");
    const t = useTranslations();
    const { isLoading: ffmpegLoading, isReady: ffmpegReady } = useFFmpeg();

    // 文件管理状态
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [upscaleResults, setUpscaleResults] = useState<OutputType[]>([]);
    const [showDragDrop, setShowDragDrop] = useState(true);

    // 放大设置状态
    const [upscaleFactor, setUpscaleFactor] = useState([2]);
    const [algorithm, setAlgorithm] = useState("lanczos");

    // 文件选择处理
    const handleFilesSelected = useCallback((newFiles: File[]) => {
        setImageFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }, []);

    // 删除单个文件
    const handleRemoveFile = useCallback((index: number) => {
        setImageFiles((prevFiles) => prevFiles.filter((_, idx) => idx !== index));
    }, []);

    // 清空文件
    const handleClearFiles = useCallback(() => {
        setImageFiles([]);
        setShowDragDrop(true);
    }, []);

    // 清空结果
    const handleClearResults = useCallback(() => {
        upscaleResults.forEach((result) => {
            if (result.url) {
                URL.revokeObjectURL(result.url);
            }
        });
        setUpscaleResults([]);
        setShowDragDrop(true);
        setImageFiles([]);
    }, [upscaleResults]);

    // 重新显示拖拽区域
    const handleShowDragDrop = useCallback(() => {
        setShowDragDrop(true);
        setImageFiles([]);
    }, []);

    // 核心处理函数
    const handleUpscale = useCallback(async () => {
        if (imageFiles.length === 0 || !ffmpegReady) {
            alert(t("min_upscale_files"));
            return;
        }

        setLoading(true);
        setProgress(0);
        setCurrentFileName(t("initializing_status"));
        setUpscaleResults([]);

        try {
            setCurrentFileName(t("converting_files"));
            setProgress(20);

            const inputFiles = await convertFilesToInputFileType(imageFiles);

            setCurrentFileName(t("generating_commands"));
            setProgress(40);

            inputFiles.forEach((file) => {
                generateFFMPEGCommand("upscale", file, {
                    scaleFactor: upscaleFactor[0],
                    algorithm: algorithm as
                        | "lanczos"
                        | "bicubic"
                        | "bilinear"
                        | "neighbor",
                    format: file.format,
                });
            });

            setCurrentFileName(t("processing_images"));
            setProgress(60);

            const results = await ffm_ins.processImages(inputFiles);

            setProgress(90);
            setCurrentFileName(t("finalizing"));

            const successResults = results.filter((result) => result.status === "success");
            setUpscaleResults(successResults);
            setProgress(100);

            if (successResults.length === 0) {
                setCurrentFileName(t("all_files_failed"));
                alert(t("all_upscale_failed"));
            } else {
                setCurrentFileName(t("upscale_complete"));
                setShowDragDrop(false);
            }

            setTimeout(() => {
                setCurrentFileName("");
            }, 2000);
        } catch (error) {
            console.error("Upscale error:", error);
            alert(
                `${t("upscale_failed")}: ${error instanceof Error ? error.message : t("unknown_error")}`,
            );
            // 出错时确保拖拽区域显示
            setShowDragDrop(true);
        } finally {
            setLoading(false);
        }
    }, [imageFiles, ffmpegReady, upscaleFactor, algorithm, t]);

    // 下载单个文件
    const handleDownload = async (result: OutputType) => {
        if (result.url) {
            try {
                const response = await fetch(result.url);
                const blob = await response.blob();
                const fileName = result.name;
                downloadFile(blob, fileName);
            } catch (error) {
                console.error("Download failed:", error);
                alert(t("download_failed"));
            }
        }
    }

    // 批量下载所有文件
    const handleDownloadAll = async () => {
        for (let i = 0; i < upscaleResults.length; i++) {
            await handleDownload(upscaleResults[i]);
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
    };

    // FFmpeg 加载状态
    if (ffmpegLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">{t("load_ffmpeg")}</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto">
            {/* 主容器 */}
            <div className="bg-background/70 backdrop-blur-xl rounded-3xl p-8 border border-border/20 shadow-xl relative">
                {/* 操作栏 */}
                <div className="flex gap-4 justify-center mb-8 flex-nowrap">
                    {/* 放大设置 */}
                    <div className="flex items-center gap-6 px-6 py-3 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/30">
                        {/* 放大倍数设置 */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <ZoomIn className="w-5 h-5 text-primary" />
                                <span className="text-sm font-medium text-foreground text-nowrap">
                                    {t("upscale_factor")}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-32">
                                    <Slider
                                        value={upscaleFactor}
                                        onValueChange={setUpscaleFactor}
                                        min={1}
                                        max={4}
                                        step={0.5}
                                        className="w-full"
                                    />
                                </div>
                                <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg min-w-[3rem] text-center">
                                    {upscaleFactor[0]}x
                                </span>
                            </div>
                        </div>

                        {/* 分隔线 */}
                        <div className="w-px h-8 bg-border/50" />

                        {/* 算法选择 */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                <span className="text-sm font-medium text-foreground text-nowrap">
                                    {t("upscale_algorithm")}
                                </span>
                            </div>
                            <div className="relative">
                                <Select value={algorithm} onValueChange={setAlgorithm}>
                                    <SelectTrigger className="w-32 h-8 bg-card/70 border-border/40">
                                        <SelectValue placeholder={t("select_algorithm")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lanczos">
                                            {t("algorithm_lanczos")}
                                        </SelectItem>
                                        <SelectItem value="bicubic">
                                            {t("algorithm_bicubic")}
                                        </SelectItem>
                                        <SelectItem value="bilinear">
                                            {t("algorithm_bilinear")}
                                        </SelectItem>
                                        <SelectItem value="neighbor">
                                            {t("algorithm_nearest")}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* 开始按钮 */}
                    <Button
                        onClick={handleUpscale}
                        disabled={
                            loading || ffmpegLoading || !ffmpegReady || imageFiles.length === 0
                        }
                        className="!px-6 !py-3 w-48 !h-[62px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {ffmpegLoading || !ffmpegReady || loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <ZoomIn className="w-5 h-5" />
                                <span>{t("start_upscale")} ({imageFiles.length} {t("files")})</span>
                            </>
                        )}
                    </Button>
                </div>

                {/* 进度条区域 */}
                {loading && (
                    <div className="mb-8">
                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm rounded-2xl p-6 border border-primary/20">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                                    <span className="text-sm font-semibold text-foreground">
                                        {currentFileName || t("processing_progress")}
                                    </span>
                                </div>
                                <span className="text-lg font-bold text-primary">
                                    {Math.round(progress)}%
                                </span>
                            </div>

                            <Progress value={progress} className="w-full h-3 mb-4" />

                            {imageFiles.length > 1 && (
                                <div className="text-center mt-3 text-sm text-muted-foreground">
                                    {Math.floor((progress / 100) * imageFiles.length)} / {imageFiles.length}{" "}
                                    {t("files")}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 文件上传区域 */}
                {showDragDrop && (
                    <div className="mb-8">
                        <Dropzone
                            files={imageFiles}
                            onFilesSelected={handleFilesSelected}
                            onRemoveFile={handleRemoveFile}
                            onClearAllFiles={handleClearFiles}
                        />
                    </div>
                )}

                {/* 结果区域 */}
                {upscaleResults.length > 0 && (
                    <div className="space-y-6">
                        {/* 结果区域标题 */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
                                    <ShieldCheck className="w-4 h-4 text-primary-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground">
                                    {t("upscale_result")} ({upscaleResults.length})
                                </h3>
                            </div>
                            <div className="flex gap-2">
                                {!showDragDrop && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleShowDragDrop}
                                        className="bg-card/50 backdrop-blur-sm border-primary/20 text-primary hover:bg-primary/10"
                                    >
                                        <Plus className="w-4 h-4" />
                                        {t("continue_upscaling")}
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDownloadAll}
                                    className="bg-card/50 backdrop-blur-sm border-primary/20 text-primary hover:bg-primary/10"
                                >
                                    <Download className="w-4 h-4" />
                                    {t("download_all")}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearResults}
                                    className="bg-card/50 backdrop-blur-sm border-destructive/20 text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {t("clear_result")}
                                </Button>
                            </div>
                        </div>

                        {/* 总体统计信息 */}
                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm rounded-2xl p-6 border border-primary/20">
                            <h4 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                                <ChartArea className="w-4 h-4" />
                                {t("overall_stats")}
                            </h4>
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center justify-between bg-background p-3 rounded-md border">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium">{t("all_files")}</span>
                                        <span className="text-sm font-medium text-primary">
                                            {upscaleResults.length} {t("files")} {t("upscaled")}
                                        </span>
                                    </div>
                                    <Button
                                        onClick={handleDownloadAll}
                                        disabled={upscaleResults.length === 0}
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <Download size={16} />
                                        {t("download_all")} ({upscaleResults.length})
                                    </Button>
                                </div>

                                {/* 总体文件大小和处理时间 */}
                                <div className="flex justify-between text-xs px-2">
                                    <span className="text-muted-foreground">
                                        {t("total_size")}: {Math.round(upscaleResults.reduce((sum, result) => sum + result.size, 0) / 1024)}KB
                                    </span>
                                    <span className="text-muted-foreground">
                                        {t("total_processing_time")}: {Math.round(upscaleResults.reduce((sum, result) => sum + (result.processingTime || 0), 0))}ms
                                    </span>
                                </div>

                                {/* 放大设置信息 */}
                                <div className="grid grid-cols-2 gap-2 text-xs px-2 text-muted-foreground">
                                    <div>
                                        <span className="font-medium">{t("upscale_factor")}:</span> {upscaleFactor[0]}x
                                    </div>
                                    <div>
                                        <span className="font-medium">{t("algorithm")}:</span> {t(`algorithm_${algorithm}`)}
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                )}
            </div>
        </div>
    );
}

export default UpscaleComposer;

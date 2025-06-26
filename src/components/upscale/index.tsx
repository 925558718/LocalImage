"use client";
import { Loader2, ZoomIn } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import {
    Button,
    Progress,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Slider
} from "@/components/shadcn";
import { Card } from "@/components/shadcn/card";
import { useFFmpeg } from "@/hooks/useFFmpeg";
import ffm_ins from "@/lib/ffmpeg";
import {
    type InputFileType,
    OutputType,
    convertFilesToInputFileType
} from "@/lib/fileUtils";
import { generateFFMPEGCommand } from "@/lib/strategy/upscale";
import type { UpscaleOptions } from "@/lib/strategy/upscale";
import { DropzoneWithPreview } from "@/components/compress/components/DropzoneWithPreview";

// 扩展的结果类型
interface UpscaleResult extends OutputType {
    name: string;
    originalFile: File;
    targetWidth: number;
    targetHeight: number;
}

const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
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

    // 放大设置状态
    const [upscaleFactor, setUpscaleFactor] = useState([2]);
    const [algorithm, setAlgorithm] = useState("lanczos");

    // 文件选择处理
    const handleFilesSelected = useCallback((newFiles: File[]) => {
        setImageFiles(prevFiles => [...prevFiles, ...newFiles]);
    }, []);

    // 删除单个文件
    const handleRemoveFile = useCallback((index: number) => {
        setImageFiles(prevFiles => prevFiles.filter((_, idx) => idx !== index));
    }, []);

    // 清空文件
    const handleClearFiles = useCallback(() => {
        setImageFiles([]);
    }, []);

    // 清空结果
    const handleClearResults = useCallback(() => {
        upscaleResults.forEach(result => {
            if (result.url) {
                URL.revokeObjectURL(result.url);
            }
        });
        setUpscaleResults([]);
    }, [upscaleResults]);

    // 核心处理函数 - 基于选中的代码重构
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

            // 核心代码：文件转换
            const inputFiles = await convertFilesToInputFileType(imageFiles);
            
            setCurrentFileName(t("generating_commands"));
            setProgress(40);

            // 核心代码：生成FFmpeg命令
            inputFiles.forEach(file => {
                generateFFMPEGCommand("upscale", file, {
                    scaleFactor: upscaleFactor[0],
                    algorithm: algorithm as 'lanczos' | 'bicubic' | 'bilinear' | 'neighbor',
                    format: file.format,
                });
            });

            setCurrentFileName(t("processing_images"));
            setProgress(60);

            // 核心代码：批量处理
            const results = await ffm_ins.processImages(inputFiles);

            setProgress(90);
            setCurrentFileName(t("finalizing"));

            // 直接使用 results，无需转换
            setUpscaleResults(results.filter(result => result.status === 'success'));
            setProgress(100);
            setCurrentFileName(t("upscale_complete"));

            setTimeout(() => {
                setCurrentFileName("");
            }, 2000);

        } catch (error) {
            console.error('Upscale error:', error);
            alert(
                `${t("upscale_failed")}: ${error instanceof Error ? error.message : t("unknown_error")}`
            );
        } finally {
            setLoading(false);
        }
    }, [imageFiles, ffmpegReady, upscaleFactor, algorithm, t]);

    // 下载单个文件
    const handleDownload = useCallback(async (result: OutputType, index: number) => {
        if (result.url) {
            try {
                const response = await fetch(result.url);
                const blob = await response.blob();
                const fileName = `upscaled_image_${index + 1}.${imageFiles[index]?.name.split('.').pop() || 'png'}`;
                downloadFile(blob, fileName);
            } catch (error) {
                console.error('Download failed:', error);
                alert(t("download_failed"));
            }
        }
    }, [t, imageFiles]);

    // 批量下载所有文件
    const handleDownloadAll = useCallback(async () => {
        for (let i = 0; i < upscaleResults.length; i++) {
            await handleDownload(upscaleResults[i], i);
            // 添加延迟避免浏览器阻止多文件下载
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }, [upscaleResults, handleDownload]);

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
        <div className="w-full space-y-8">
            {/* 控制面板 */}
            <Card className="p-6">
                <div className="space-y-6">
                    <div className="flex items-center space-x-2">
                        <ZoomIn className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">{t("upscale_settings")}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 放大倍数设置 */}
                        <div className="space-y-3">
                            <div className="text-sm font-medium">{t("upscale_factor")}</div>
                            <div className="space-y-2">
                                <Slider
                                    value={upscaleFactor}
                                    onValueChange={setUpscaleFactor}
                                    min={1}
                                    max={4}
                                    step={0.5}
                                    className="w-full"
                                />
                                <div className="text-center text-sm text-muted-foreground">
                                    {upscaleFactor[0]}x
                                </div>
                            </div>
                        </div>

                        {/* 算法选择 */}
                        <div className="space-y-3">
                            <div className="text-sm font-medium">{t("upscale_algorithm")}</div>
                            <Select value={algorithm} onValueChange={setAlgorithm}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t("select_algorithm")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="lanczos">{t("algorithm_lanczos")}</SelectItem>
                                    <SelectItem value="bicubic">{t("algorithm_bicubic")}</SelectItem>
                                    <SelectItem value="bilinear">{t("algorithm_bilinear")}</SelectItem>
                                    <SelectItem value="neighbor">{t("algorithm_nearest")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* 开始按钮 */}
                    <Button
                        onClick={handleUpscale}
                        disabled={loading || imageFiles.length === 0}
                        className="w-full"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t("upscaling")}
                            </>
                        ) : (
                            <>
                                <ZoomIn className="w-4 h-4 mr-2" />
                                {t("start_upscale")} ({imageFiles.length} {t("files")})
                            </>
                        )}
                    </Button>
                </div>
            </Card>

            {/* 进度显示 */}
            {loading && (
                <Card className="p-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>{currentFileName}</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="w-full" />
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 左侧：文件上传区域 */}
                <div className="space-y-6">
                    <DropzoneWithPreview
                        files={imageFiles}
                        onFilesSelected={handleFilesSelected}
                        onRemoveFile={handleRemoveFile}
                        onClearAllFiles={handleClearFiles}
                    />
                </div>

                {/* 右侧：结果展示区域 */}
                <div className="space-y-6">
                    {upscaleResults.length > 0 && (
                        <Card className="p-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">{t("upscale_result")}</h3>
                                    <div className="space-x-2">
                                        <Button
                                            variant="outline"
                                            onClick={handleDownloadAll}
                                            size="sm"
                                        >
                                            {t("download_all")}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleClearResults}
                                            size="sm"
                                        >
                                            {t("clear_result")}
                                        </Button>
                                    </div>
                                </div>

                                {/* 统计信息 */}
                                <div className="text-sm text-muted-foreground">
                                    {t("total_processed")}: {upscaleResults.length} / {imageFiles.length}
                                </div>

                                {/* 结果列表 */}
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {upscaleResults.map((result, index) => (
                                        <div key={`${result.url}-${index}`} className="p-4 border rounded-lg space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-sm truncate">放大结果 {index + 1}</span>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleDownload(result, index)}
                                                >
                                                    {t("download")}
                                                </Button>
                                            </div>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <div>{t("upscaled_size")}: {result.width} × {result.height}</div>
                                                <div>{t("processing_time")}: {Math.round(result.processingTime || 0)}ms</div>
                                                <div>{t("file_size")}: {Math.round(result.size / 1024)}KB</div>
                                            </div>
                                            {result.url && (
                                                <img
                                                    src={result.url}
                                                    alt={`放大结果 ${index + 1}`}
                                                    className="max-w-full h-32 object-contain border rounded"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UpscaleComposer; 
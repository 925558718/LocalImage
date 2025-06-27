"use client";
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
import {
	ImageFormat,
	ImageFormatType,
} from "@/lib/strategy/conversions/ConversionStrategy";
import {
	BicepsFlexed,
	ChartArea,
	FileType,
	Loader2,
	Plus,
	ShieldCheck,
	Trash2,
	Upload,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
// 导入FFMPEG类和策略系统
import ffm_ins from "@/lib/ffmpeg";
import { convertFilesToInputFileType, InputFileType, OutputType } from "@/lib/fileUtils";
import { generateFFMPEGCommand } from "@/lib/strategy";
// 确保策略被初始化
import DropzoneWithPreview from "../DropZone";
import Advanced from "./components/Advanced";
import CompressItem from "./components/CompressItem";

// 支持的图片格式配置 - 按常用程度排序
const SUPPORTED_FORMATS = [
	// 最常用格式（优先显示）
	{ value: ImageFormat.WEBP, label: ".webp" },
	{ value: ImageFormat.PNG, label: ".png" },
	{ value: ImageFormat.JPG, label: ".jpg" },

	// 其他常见格式
	{ value: ImageFormat.JPEG, label: ".jpeg" },
	{ value: ImageFormat.GIF, label: ".gif" },
	{ value: ImageFormat.BMP, label: ".bmp" },
	{ value: ImageFormat.TIFF, label: ".tiff" },

	// 专业格式
	{ value: ImageFormat.TIF, label: ".tif" },
	{ value: ImageFormat.ICO, label: ".ico" },
	{ value: ImageFormat.DPX, label: ".dpx" },
	{ value: ImageFormat.EXR, label: ".exr" },

	// 其他格式
	{ value: ImageFormat.PPM, label: ".ppm" },
	{ value: ImageFormat.PGM, label: ".pgm" },
	{ value: ImageFormat.PBM, label: ".pbm" },
	{ value: ImageFormat.PAM, label: ".pam" },

	{ value: ImageFormat.SGI, label: ".sgi" },
	{ value: ImageFormat.XBM, label: ".xbm" },
];

const NO_SUPPORT_QUALITY_SETTING_FORMATS: ImageFormatType[] = [
	ImageFormat.BMP,
	ImageFormat.GIF,
	ImageFormat.TIFF,
	ImageFormat.TIF,
	ImageFormat.DPX,
	ImageFormat.EXR,
	ImageFormat.PPM,
	ImageFormat.PGM,
	ImageFormat.PBM,
	ImageFormat.PAM,
	ImageFormat.SGI,
	ImageFormat.XBM,
];

export default function Compress() {
	const t = useTranslations();
	const {
		isLoading: ffmpegLoading,
		isReady: ffmpegReady,
		error: ffmpegError,
	} = useFFmpeg();

	// 核心状态
	const [loading, setLoading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [files, setFiles] = useState<File[]>([]);
	const [downloadList, setDownloadList] = useState<OutputType[]>([]);
	const [showDragDrop, setShowDragDrop] = useState(true);
	const [failedCount, setFailedCount] = useState(0);

	// 格式和高级配置
	const [format, setFormat] = useState("webp");
	const [quality, setQuality] = useState(85);
	const [advanced, setAdvanced] = useState({
		width: "",
		height: "",
		outputSuffixName: "",
	});

	// 判断格式是否需要质量设置
	const needsQualitySetting = (format: ImageFormatType): boolean => {
		return !NO_SUPPORT_QUALITY_SETTING_FORMATS.includes(format);
	};

	// 释放blob URL
	const revokeBlobUrls = (items: OutputType[]) => {
		for (const item of items) {
			if (item.url) {
				URL.revokeObjectURL(item.url);
			}
		}
	};

	// 单独处理downloadList变化时的清理 - 确保URL被及时释放
	useEffect(() => {
		return () => {
			revokeBlobUrls(downloadList);
		};
	}, [downloadList]);

	// 处理新文件添加
	const handleFilesSelected = (newFiles: File[]) => {
		setFiles((prevFiles) => [...prevFiles, ...newFiles]);
	};

	// 处理删除单个文件
	const handleRemoveFile = (index: number) => {
		setFiles((prevFiles) => prevFiles.filter((_, idx) => idx !== index));
	};

	// 清空已选择的文件
	const handleClearFiles = () => {
		setFiles([]);
		setShowDragDrop(true);
	};

	// 清空已压缩的文件列表
	const handleClearDownloadList = useCallback(async () => {
		revokeBlobUrls(downloadList);
		setDownloadList([]);
		setShowDragDrop(true);
		setFiles([]);
		setFailedCount(0); // 重置失败计数
	}, [downloadList, revokeBlobUrls]);

	// 重新显示拖拽区域
	const handleShowDragDrop = useCallback(() => {
		setShowDragDrop(true);
		setFiles([]);
	}, []);

	// 核心处理函数 - 模仿upscale的实现
	const handleCompress = useCallback(async () => {
		if (files.length === 0 || !ffmpegReady) {
			alert(t("min_compress_files"));
			return;
		}

		setLoading(true);
		setProgress(0);
		setDownloadList([]);
		setFailedCount(0);

		try {

			const inputFiles = await convertFilesToInputFileType(files);


			inputFiles.forEach((file: InputFileType) => {
				generateFFMPEGCommand("convert", file, {
					format: format,
					compressionLevel: quality,
					width: advanced.width ? Number.parseInt(advanced.width) : undefined,
					height: advanced.height ? Number.parseInt(advanced.height) : undefined,
					outputSuffixName: advanced.outputSuffixName,
				});
			});


			const results = await ffm_ins.processMultiDataToMultiData(inputFiles, (current, total) => {
				setProgress(Math.floor((current / total) * 100));
			});



			const successResults = results.filter(
				(result) => result.status === "success",
			);

			setDownloadList(successResults);

			if (successResults.length === 0) {
				alert(t("all_compress_failed"));
			} else {
				setShowDragDrop(false);
			}
		} catch (error) {
			console.error("Compress error:", error);
			alert(
				`${t("compress_failed")}: ${error instanceof Error ? error.message : t("unknown_error")}`,
			);
			// 出错时确保拖拽区域显示
			setShowDragDrop(true);
		} finally {
			setLoading(false);
		}
	}, [files, ffmpegReady, format, quality, advanced, t]);

	// UI渲染
	return (
		<div className="w-full max-w-6xl mx-auto">
			{/* 主容器 */}
			<div className="bg-background/70 backdrop-blur-xl rounded-3xl p-8 border border-border/20 shadow-xl relative">
				{/* 操作栏 */}
				<div className="flex gap-4 justify-center mb-8 flex-nowrap">
					{/* 格式和质量设置 */}
					<div className="flex items-center gap-6 px-6 py-3 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/30">
						{/* 格式选择器 */}
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-2">
								<FileType className="w-5 h-5 text-primary" />
								<span className="text-sm font-medium text-foreground text-nowrap">
									{t("output_format")}
								</span>
							</div>
							<div className="relative">
								<Select value={format} onValueChange={setFormat}>
									<SelectTrigger className="w-32 h-8 bg-card/70 border-border/40">
										<SelectValue placeholder="Format" />
									</SelectTrigger>
									<SelectContent className="w-96 max-h-80">
										<div className="grid grid-cols-4 gap-1 p-2">
											{SUPPORTED_FORMATS.map((formatOption) => (
												<SelectItem
													key={formatOption.value}
													value={formatOption.value}
													className="flex flex-col items-center justify-center p-2 h-16 text-xs hover:bg-accent/50 rounded-md transition-colors"
												>
													<div className="font-medium">
														{formatOption.label}
													</div>
												</SelectItem>
											))}
										</div>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* 分隔线 - 只有当质量设置显示时才显示 */}
						{needsQualitySetting(format as ImageFormatType) && (
							<div className="w-px h-8 bg-border/50" />
						)}

						{/* 质量设置 */}
						{needsQualitySetting(format as ImageFormatType) && (
							<div className="flex items-center gap-3">
								<div className="flex items-center gap-2">
									<BicepsFlexed className="w-5 h-5 text-primary" />
									<span className="text-sm font-medium text-foreground">
										{t("advanceoption.quality")}
									</span>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-32">
										<Slider
											value={[quality]}
											onValueChange={(v) => setQuality(v[0])}
											max={100}
											step={1}
											className="w-full"
										/>
									</div>
									<span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg min-w-[3rem] text-center">
										{quality}%
									</span>
								</div>
							</div>
						)}
					</div>

					<Advanced onChange={setAdvanced} />

					<Button
						onClick={handleCompress}
						disabled={
							loading || ffmpegLoading || !ffmpegReady || files.length === 0
						}
						className="!px-6 !py-3 w-48 !h-[62px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{ffmpegLoading || !ffmpegReady || loading ? (
							<Loader2 className="w-5 h-5 animate-spin" />
						) : (
							<>
								<Upload className="w-5 h-5" />
								<span>{t("compress_btn")}</span>
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
										{t("processing_progress")}
									</span>
								</div>
								<span className="text-lg font-bold text-primary">
									{progress}%
								</span>
							</div>

							<Progress value={progress} className="w-full h-3 mb-4" />

							{files.length > 1 && (
								<div className="text-center mt-3 text-sm text-muted-foreground">
									{Math.floor((progress / 100) * files.length)} / {files.length}{" "}
									{t("files_selected")}
								</div>
							)}

							{files.length > 3 && (
								<div className="mt-4 p-4 bg-accent/10 backdrop-blur-sm rounded-xl border border-accent/20">
									<div className="text-sm text-accent-foreground">
										<div className="flex items-center gap-2 mb-2">
											<span>💡</span>
											<span className="font-medium">
												{t("performance_tips")}
											</span>
										</div>
										<ul className="space-y-1 text-xs opacity-90">
											<li>• {t("batch_processing_tip")}</li>
											<li>• {t("memory_optimization_tip")}</li>
											<li>• {t("browser_tab_tip")}</li>
										</ul>
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{/* 文件上传区域 */}
				{showDragDrop && (
					<div className="mb-8">
						<DropzoneWithPreview
							onFilesSelected={handleFilesSelected}
							files={files}
							onRemoveFile={handleRemoveFile}
							onClearAllFiles={handleClearFiles}
						/>
					</div>
				)}

				{/* 压缩结果区域 */}
				{downloadList.length > 0 && (
					<div className="space-y-6">
						{/* 结果区域标题 */}
						<div className="flex justify-between items-center">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
									<ShieldCheck className="w-4 h-4 text-primary-foreground" />
								</div>
								<h3 className="text-xl font-semibold text-foreground">
									{t("compressed_files")} ({downloadList.length})
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
										{t("continue_compressing")}
									</Button>
								)}
								<Button
									variant="outline"
									size="sm"
									onClick={handleClearDownloadList}
									className="bg-card/50 backdrop-blur-sm border-destructive/20 text-destructive hover:bg-destructive/10"
								>
									<Trash2 className="w-4 h-4" />
									{t("clear_all")}
								</Button>
							</div>
						</div>

						{/* 总体统计信息 */}
						{downloadList.length > 0 && (
							<div className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm rounded-2xl p-6 border border-primary/20">
								<h4 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
									<ChartArea className="w-4 h-4" />
									{t("overall_stats")}
								</h4>
								<CompressItem
									name={t("all_files")}
									originalSize={files.reduce(
										(sum, item) => sum + item.size,
										0,
									)}
									compressedSize={downloadList.reduce(
										(sum, item) => sum + item.size,
										0,
									)}
									processingTime={downloadList.reduce(
										(sum, item) => sum + (item.processingTime || 0),
										0,
									)}
									format={format
									}
									quality={quality}
									downloadItems={downloadList}
									failedCount={failedCount}
									key="overall-stats"
								/>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

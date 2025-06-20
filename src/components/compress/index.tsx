"use client";
import ffm_ins from "@/lib/ffmpeg";
import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useFFmpeg } from "@/hooks/useFFmpeg";
import CompressItem from "./components/CompressItem";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Button,
	Progress,
	Slider,
} from "@/components/shadcn";
import { toast } from "sonner";
import Advanced from "./components/Advanced";
import { DropzoneWithPreview } from "./components/DropzoneWithPreview";
import {
	Loader2,
	Upload,
	FileType,
	ShieldCheck,
	Plus,
	Trash2,
	ChartArea,
	BicepsFlexed,
} from "lucide-react";

// 导入FFMPEG类用于静态方法调用
import { FFMPEG } from "@/lib/ffmpeg";
import { ImageFormat } from "@/lib/conversions/ConversionStrategy";

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

// 类型定义
type DownloadItem = {
	url: string;
	name: string;
	originalSize: number;
	compressedSize: number;
	processingTime?: number;
	format?: string;
	quality?: number;
	blob?: Blob;
};

type FileProgressMap = {
	[key: string]: {
		isProcessing: boolean;
		progress: number;
	};
};

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
	const [downloadList, setDownloadList] = useState<DownloadItem[]>([]);
	const [fileProgress, setFileProgress] = useState<FileProgressMap>({});
	const [showDragDrop, setShowDragDrop] = useState(true);

	// 格式和高级配置
	const [format, setFormat] = useState("webp");
	const [quality, setQuality] = useState(85);
	const [advanced, setAdvanced] = useState({
		width: "",
		height: "",
		outputName: "",
	});

	// 释放blob URL
	const revokeBlobUrls = useCallback((items: DownloadItem[]) => {
		for (const item of items) {
			if (item.url) {
				URL.revokeObjectURL(item.url);
			}
		}
	}, []);

	// 单独处理downloadList变化时的清理 - 确保URL被及时释放
	useEffect(() => {
		return () => {
			revokeBlobUrls(downloadList);
		};
	}, [downloadList, revokeBlobUrls]);

	// 处理新文件添加
	const handleFilesSelected = useCallback((newFiles: File[]) => {
		setFiles((prevFiles) => [...prevFiles, ...newFiles]);
	}, []);

	// 处理删除单个文件
	const handleRemoveFile = useCallback((index: number) => {
		setFiles((prevFiles) => prevFiles.filter((_, idx) => idx !== index));
	}, []);

	// 清空已选择的文件
	const handleClearFiles = useCallback(() => {
		setFiles([]);
		setShowDragDrop(true);
	}, []);

	// 清空已压缩的文件列表
	const handleClearDownloadList = useCallback(async () => {
		revokeBlobUrls(downloadList);
		setDownloadList([]);
		setShowDragDrop(true);
		setFiles([]);
	}, [downloadList, revokeBlobUrls]);

	// 重新显示拖拽区域
	const handleShowDragDrop = useCallback(() => {
		setShowDragDrop(true);
		setFiles([]);
	}, []);

	// 处理压缩
	async function handleCompress() {
		if (files.length === 0) return;

		// 验证FFmpeg状态
		if (ffmpegLoading) return;
		if (!ffmpegReady) {
			alert("FFmpeg正在加载中，请稍等...");
			return;
		}
		if (ffmpegError) {
			return;
		}

		// 初始化状态
		setLoading(true);
		setProgress(0);
		setDownloadList([]);
		setFileProgress({});

		// 大图片警告
		const totalSize = files.reduce((sum, file) => sum + file.size, 0);
		const largeImageWarningSize = 20 * 1024 * 1024; // 20MB
		const maxBatchSize = 100 * 1024 * 1024; // 100MB

		if (totalSize > maxBatchSize) {
			const confirmProcess = confirm(
				`警告：您选择的图片总大小超过 ${Math.round(maxBatchSize / 1024 / 1024)}MB，可能导致内存不足。建议您分批处理或选择较小的图片。是否继续？`,
			);
			if (!confirmProcess) {
				setLoading(false);
				return;
			}
		} else if (files.some((file) => file.size > largeImageWarningSize)) {
			console.warn(
				`检测到超过 ${Math.round(largeImageWarningSize / 1024 / 1024)}MB 的大图片，可能影响处理性能`,
			);
		}

		try {
			// 智能批处理：将大文件拆分处理，防止内存溢出
			const fileGroups: File[][] = [];
			let currentGroup: File[] = [];
			let currentGroupSize = 0;
			const maxGroupSize = 50 * 1024 * 1024; // 50MB

			// 首先处理大文件
			const sortedFiles = [...files].sort((a, b) => b.size - a.size);

			for (const file of sortedFiles) {
				// 特别大的文件单独处理
				if (file.size > maxGroupSize / 2) {
					fileGroups.push([file]);
					continue;
				}

				// 如果当前组加上这个文件会超过限制，创建新组
				if (
					currentGroupSize + file.size > maxGroupSize &&
					currentGroup.length > 0
				) {
					fileGroups.push(currentGroup);
					currentGroup = [file];
					currentGroupSize = file.size;
				} else {
					currentGroup.push(file);
					currentGroupSize += file.size;
				}
			}

			// 添加最后一组（如果有）
			if (currentGroup.length > 0) {
				fileGroups.push(currentGroup);
			}

			console.log(
				`智能批处理：将 ${files.length} 个文件分为 ${fileGroups.length} 批处理`,
			);

			// 为批处理跟踪总进度
			let processedFiles = 0;
			const totalFiles = files.length;

			// 确保FFmpeg已加载
			if (ffm_ins) {
				await ffm_ins.load();
			}

			// 按批次顺序处理文件
			for (let groupIndex = 0; groupIndex < fileGroups.length; groupIndex++) {
				const fileGroup = fileGroups[groupIndex];
				console.log(
					`处理第 ${groupIndex + 1}/${fileGroups.length} 批，包含 ${fileGroup.length} 个文件`,
				);

				// 并行读取当前批次的所有文件
				const fileData = await Promise.all(
					fileGroup.map(async (file) => {
						setFileProgress((prev) => ({
							...prev,
							[file.name]: { isProcessing: true, progress: 0 },
						}));

						const arrayBuffer = await file.arrayBuffer();
						return {
							data: arrayBuffer,
							name: file.name,
							originalSize: file.size,
						};
					}),
				);

				// 使用串行压缩模式处理当前批次
				await FFMPEG.convertImagesSerial({
					files: fileData,
					format,
					quality: quality,
					width: advanced.width ? Number.parseInt(advanced.width) : undefined,
					height: advanced.height
						? Number.parseInt(advanced.height)
						: undefined,
					processedCount: processedFiles,
					onProgress: (completed, total) => {
						// 计算当前批次的进度百分比
						const batchProgress =
							((completed - processedFiles) / fileData.length) * 100;
						setProgress(Math.round((completed / totalFiles) * 100));

						// 更新当前处理文件的进度
						// 获取当前正在处理的文件在当前批次中的索引
						const currentBatchIndex = completed - processedFiles - 1;
						if (currentBatchIndex >= 0 && currentBatchIndex < fileData.length) {
							const currentFileName = fileData[currentBatchIndex]?.name;
							if (currentFileName) {
								setFileProgress((prev) => ({
									...prev,
									[currentFileName]: {
										isProcessing: true,
										progress: Math.round(batchProgress),
									},
								}));
							}
						}
					},
					onFileComplete: (result: DownloadItem) => {
						processedFiles++; // 增加已处理文件计数

						const originalFileName =
							fileData.find((file) =>
								result.name.includes(file.name.replace(/\.[^.]+$/, "")),
							)?.name || result.name;

						setFileProgress((prev) => ({
							...prev,
							[originalFileName]: { isProcessing: false, progress: 100 },
						}));

						setDownloadList((prev) => {
							const newList = [...prev, result];

							// 异步获取并缓存blob数据
							setTimeout(async () => {
								try {
									if (result.url?.startsWith("blob:")) {
										const response = await fetch(result.url);
										if (response.ok) {
											const blob = await response.blob();
											if (blob && blob.size > 0) {
												setDownloadList((currentList) =>
													currentList.map((item) =>
														item.url === result.url && item.name === result.name
															? { ...item, blob }
															: item,
													),
												);
											}
										}
									}
								} catch (error) {
									console.warn(`[blob缓存] 缓存失败: ${result.name}`, error);
								}
							}, 0);

							return newList;
						});
					},
				});
			}

			// 完成所有文件处理
			setTimeout(() => {
				setProgress(100);
				setShowDragDrop(false);
			}, 300);
		} catch (e) {
			console.error("压缩失败", e);
			setFileProgress({});
			setShowDragDrop(true);
			setFiles([]);
			setDownloadList([]);
			setProgress(0);

			const errorMessage = e instanceof Error ? e.message : String(e);
			// 处理内存超出边界错误
			if (errorMessage.includes("RuntimeError: memory access out of bounds")) {
				toast.error("内存超出限制", {
					description:
						"处理图片时内存不足，请尝试压缩更小的图片或减少批量处理数量。",
					duration: 5000,
				});
			} else {
				// 其他错误使用常规提示
				toast.error("图片压缩失败", {
					description: "请重试或尝试压缩更小的图片。",
					duration: 3000,
				});
			}
		} finally {
			setLoading(false);
			setProgress(0);
		}
	}

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
													<div className="font-medium">{formatOption.label}</div>
												</SelectItem>
											))}
										</div>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* 分隔线 */}
						<div className="w-px h-8 bg-border/50" />

						{/* 质量设置 */}
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
									isOverallStats={true}
									name={t("all_files")}
									url=""
									originalSize={downloadList.reduce(
										(sum, item) => sum + item.originalSize,
										0,
									)}
									compressedSize={downloadList.reduce(
										(sum, item) => sum + item.compressedSize,
										0,
									)}
									processingTime={downloadList.reduce(
										(sum, item) => sum + (item.processingTime || 0),
										0,
									)}
									format={
										downloadList.length > 0
											? downloadList[downloadList.length - 1].format
											: format
									}
									quality={
										downloadList.length > 0
											? downloadList[0].quality
											: undefined
									}
									downloadItems={downloadList.map((item) => ({
										url: item.url,
										name: item.name,
										blob: item.blob,
									}))}
									key="overall-stats"
								/>
							</div>
						)}

						{/* 单个文件列表 */}
						<div className="space-y-3">
							{downloadList.map((item) => {
								const currentProgress = fileProgress[item.name];
								return (
									<div
										key={item.name + item.url}
										className="bg-card/40 backdrop-blur-sm rounded-2xl border border-border/30"
									>
										<CompressItem
											name={item.name}
											url={item.url}
											originalSize={item.originalSize}
											compressedSize={item.compressedSize}
											processingTime={item.processingTime}
											format={item.format}
											quality={item.quality}
											isProcessing={currentProgress?.isProcessing || false}
											progress={currentProgress?.progress || 0}
											blob={item.blob}
										/>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

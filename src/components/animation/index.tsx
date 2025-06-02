import ffm_ins from "@/lib/ffmpeg";
import { useState, useRef } from "react";
import { useI18n } from "@/hooks/useI18n";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Button,
	Progress,
	Slider,
	Label,
} from "@/components/shadcn";
import { DropzoneWithPreview } from "../compress/components/DropzoneWithPreview";
import { Download, Play, Pause } from "lucide-react";

function AnimationComposer() {
	const [loading, setLoading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [currentFileName, setCurrentFileName] = useState("");
	const { t } = useI18n();
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
	const [frameRate, setFrameRate] = useState([10]);
	const [quality, setQuality] = useState([75]);
	
	// 预览相关
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentFrame, setCurrentFrame] = useState(0);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	
	// 文件排序函数 - 与FFmpeg中的逻辑保持一致
	const getSortedFiles = (files: File[]) => {
		return [...files].sort((a, b) => {
			// 提取文件名中的数字部分
			const extractNumbers = (filename: string): number[] => {
				const numbers = filename.match(/\d+/g);
				return numbers ? numbers.map(num => parseInt(num, 10)) : [];
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
	};
	
	// 处理新文件添加
	const handleFilesSelected = (newFiles: File[]) => {
		setFiles(prevFiles => [...prevFiles, ...newFiles]);
	};
	
	// 处理删除单个文件
	const handleRemoveFile = (index: number) => {
		setFiles(prevFiles => prevFiles.filter((_, idx) => idx !== index));
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
			setCurrentFrame(prev => (prev + 1) % sortedFiles.length);
		}, 1000 / frameRate[0]);
	};
	
	const stopPreview = () => {
		setIsPlaying(false);
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	};
	
	// 处理动画合成
	async function handleCreateAnimation() {
		// 检查是否有足够的图片
		if (files.length < 2) {
			alert(t("min_files_alert"));
			return;
		}
		
		// 显示文件排序信息
		const sortedFiles = getSortedFiles(files);
		console.log('=== 动画合成开始 ===');
		console.log('原始文件顺序:', files.map(f => f.name));
		console.log('排序后顺序:', sortedFiles.map(f => f.name));
		console.log('文件数量:', sortedFiles.length);
		console.log('设置 - 格式:', format, '帧率:', frameRate[0], '质量:', quality[0]);
		
		setLoading(true);
		setProgress(0);
		setCurrentFileName(t("initializing_status"));
		stopPreview();
		
		try {
			if (!ffm_ins) {
				throw new Error(t("ffmpeg_not_initialized"));
			}

			// 先测试FFmpeg是否正常工作
			setCurrentFileName(t("testing_ffmpeg"));
			const isFFmpegWorking = await ffm_ins.testFFmpeg();
			if (!isFFmpegWorking) {
				throw new Error(t("ffmpeg_test_failed"));
			}
			console.log('[动画合成] FFmpeg测试通过');

			setCurrentFileName(t("composing_animation"));
			const outputName = `animation_${Date.now()}.${format}`;
			
			// 模拟进度更新
			const progressInterval = setInterval(() => {
				setProgress(prev => Math.min(prev + 10, 90));
			}, 200);
			
			const result = await ffm_ins.createAnimation({
				images: files,
				outputName,
				frameRate: frameRate[0],
				quality: quality[0]
			});
			
			clearInterval(progressInterval);
			setProgress(100);
			
			const mimeMap: Record<string, string> = {
				webp: "image/webp",
				gif: "image/gif"
			};
			
			const blob = new Blob([result], { type: mimeMap[format] || "application/octet-stream" });
			const url = URL.createObjectURL(blob);
			
			setAnimationResult({
				url,
				name: outputName,
				size: blob.size,
				format
			});
			
			setCurrentFileName(t("composition_complete"));
			setTimeout(() => {
				setCurrentFileName("");
			}, 1000);
			
		} catch (error) {
			console.error("动画合成失败:", error);
			alert(`${t("animation_failed")}: ${error instanceof Error ? error.message : t("unknown_error")}`);
		} finally {
			setLoading(false);
			setProgress(0);
		}
	}
	
	// 下载动画
	const handleDownload = () => {
		if (!animationResult) return;
		
		const link = document.createElement('a');
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
		<div className="w-full max-w-7xl mx-auto bg-transparent">
			<div className="flex flex-col gap-6">
				{/* Main Controls - Clean Design */}
				<div className="border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-4 bg-gray-50/30 dark:bg-gray-800/30">
					{/* Single Row Layout - All controls in one line */}
					<div className="flex flex-wrap gap-4 justify-center items-center">
						<div className="flex items-center gap-2">
							<Label className="text-sm font-medium">{t("format")}:</Label>
							<Select value={format} onValueChange={setFormat}>
								<SelectTrigger className="w-[100px] bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="bg-gray-50 dark:bg-gray-800">
									<SelectItem value="webp">.webp</SelectItem>
									<SelectItem value="gif">.gif</SelectItem>
								</SelectContent>
							</Select>
						</div>
						
						<div className="flex items-center gap-2">
							<Label className="text-sm">{t("frame_rate")}:</Label>
							<div className="w-20">
								<Slider
									value={frameRate}
									onValueChange={setFrameRate}
									min={1}
									max={60}
									step={1}
								/>
							</div>
							<span className="text-xs font-mono w-8">
								{frameRate[0]}
							</span>
						</div>
						
						<div className="flex items-center gap-2">
							<Label className="text-sm">{t("quality")}:</Label>
							<div className="w-20">
								<Slider
									value={quality}
									onValueChange={setQuality}
									min={10}
									max={100}
									step={5}
								/>
							</div>
							<span className="text-xs font-mono w-8">
								{quality[0]}
							</span>
						</div>
						
						<Button 
							onClick={isPlaying ? stopPreview : startPreview}
							disabled={files.length < 2}
							variant="outline"
							size="sm"
						>
							{isPlaying ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
							{isPlaying ? t("stop_preview") : t("preview")}
						</Button>
						
						<Button 
							onClick={handleCreateAnimation} 
							disabled={loading || files.length < 2}
							size="sm"
							className="bg-blue-600 hover:bg-blue-700 text-white"
						>
							{loading ? t("creating_animation") : t("create_animation")}
						</Button>
					</div>
				</div>
				
				{/* Progress Bar - Minimal Design */}
				{loading && (
					<div className="space-y-2">
						<div className="flex justify-between items-center text-sm">
							<span className="text-blue-600 dark:text-blue-400">
								{currentFileName || t("creating_animation")}
							</span>
							<span className="text-blue-600 dark:text-blue-400 font-bold">
								{progress}%
							</span>
						</div>
						<Progress 
							value={progress} 
							className="w-full h-2 bg-transparent [&>div]:bg-gray-200 [&>div]:dark:bg-gray-700 [&>div>div]:bg-blue-500" 
						/>
					</div>
				)}
				
				{/* Main Content - Clean Two Column Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Left: File Upload */}
					<div className="space-y-4">
						{/* File Naming Guide - Clean */}
						<div className="p-3">
							<div className="flex items-center gap-2 mb-2">
								<span className="text-lg">📝</span>
								<h4 className="text-base font-bold text-gray-800 dark:text-gray-200">
									{t("file_naming_suggestion")}
								</h4>
							</div>
							<div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
								<p>{t("naming_tip_intro")}</p>
								<div className="text-sm text-green-600 dark:text-green-400 font-medium">
									✅ {t("format_support")} • {t("auto_sort")}
								</div>
							</div>
						</div>
						
						{/* File Upload Area - Clean */}
						<div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
							<DropzoneWithPreview
								onFilesSelected={handleFilesSelected}
								files={files}
								onRemoveFile={handleRemoveFile}
								onClearAllFiles={handleClearFiles}
							/>
						</div>
						
						{/* File Count Warning - Minimal */}
						{files.length > 0 && files.length < 2 && (
							<div className="text-center py-2">
								<div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
									⚠️ {t("min_files_required")} {files.length} {t("files_count")}
								</div>
							</div>
						)}
					</div>
					
					{/* Right: Preview/Result */}
					<div className="flex flex-col h-full">
						{files.length > 0 ? (
							!animationResult ? (
								// Preview Area - Clean
								<div className="p-4 flex-1 flex flex-col">
									<h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center pb-3">
										{t("animation_preview")}
									</h3>
									<div className="flex-1 flex items-center justify-center">
										{(() => {
											const sortedFiles = getSortedFiles(files);
											const currentFile = sortedFiles[currentFrame];
											return currentFile && (
												<div className="space-y-3 w-full">
													<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
														<img
															src={URL.createObjectURL(currentFile)}
															alt={`Frame ${currentFrame + 1}`}
															className="max-w-full max-h-64 mx-auto rounded"
														/>
													</div>
													<div className="text-center space-y-1">
														<div className="text-base font-semibold text-gray-700 dark:text-gray-300">
															{t("frame_count").replace("{current}", (currentFrame + 1).toString()).replace("{total}", sortedFiles.length.toString())}
														</div>
														<div className="text-sm text-gray-500 dark:text-gray-400">
															{currentFile.name}
														</div>
													</div>
												</div>
											);
										})()}
									</div>
								</div>
							) : (
								// Result Area - Clean
								<div className="p-4 flex-1 flex flex-col">
									<div className="text-center mb-4">
										<h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-3 flex items-center justify-center gap-2 pb-3">
											<span className="text-2xl">🎉</span>
											{t('animation_result')}
										</h3>
										<div className="text-base text-green-700 dark:text-green-300 space-y-1 font-medium">
											<div className="text-lg font-bold">{animationResult.name}</div>
											<div>{(animationResult.size / 1024 / 1024).toFixed(2)} MB • {animationResult.format.toUpperCase()}</div>
										</div>
									</div>
									
									<div className="flex-1 flex items-center justify-center mb-4">
										<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
											<img 
												src={animationResult.url} 
												alt="Generated Animation" 
												className="max-w-full max-h-64 mx-auto rounded"
											/>
										</div>
									</div>
									
									<div className="flex justify-center gap-2">
										<Button 
											onClick={handleDownload}
											size="sm"
											className="bg-green-600 hover:bg-green-700 text-white"
										>
											<Download className="w-3 h-3 mr-1" />
											{t("download")}
										</Button>
										<Button 
											variant="outline" 
											size="sm"
											onClick={clearResult}
										>
											{t("clear_result")}
										</Button>
									</div>
								</div>
							)
						) : (
							// Empty State - Minimal
							<div className="text-center py-12 text-gray-400 dark:text-gray-500 flex-1 flex flex-col items-center justify-center">
								<svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
								</svg>
								<h3 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-2">
									{t("animation_preview")}
								</h3>
								<p className="text-base text-gray-500 dark:text-gray-500">
									{t("preview_instruction")}
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default AnimationComposer;
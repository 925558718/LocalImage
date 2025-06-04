import ffm_ins from "@/lib/ffmpeg";
import { useState, useRef } from "react";
import { useI18n } from "@/hooks/useI18n";
import { useFFmpeg } from "@/hooks/useFFmpeg";
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
import { Download, Play, Pause, Loader2, Clapperboard } from "lucide-react";

function AnimationComposer() {
	const [loading, setLoading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [currentFileName, setCurrentFileName] = useState("");
	const { t } = useI18n();
	const { isLoading: ffmpegLoading, isReady: ffmpegReady, error: ffmpegError } = useFFmpeg();
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

			// 先测试FFmpeg是否正常工作
			setCurrentFileName(t("testing_ffmpeg"));
			const isFFmpegWorking = await ffm_ins.testFFmpeg();
			if (!isFFmpegWorking) {
				throw new Error(t("ffmpeg_test_failed"));
			}

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
		<>
			<style jsx>{`
				@keyframes gradient-shift {
					0% {
						background-position: 0% 50%;
					}
					50% {
						background-position: 100% 50%;
					}
					100% {
						background-position: 0% 50%;
					}
				}
				
				@keyframes float {
					0%, 100% {
						transform: translateY(0px);
					}
					50% {
						transform: translateY(-10px);
					}
				}
				
				@keyframes pulse-glow {
					0%, 100% {
						box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
					}
					50% {
						box-shadow: 0 0 40px rgba(59, 130, 246, 0.6);
					}
				}
				
				.animation-title {
					font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
					font-weight: 900;
					font-size: 3.5rem;
					letter-spacing: -0.025em;
					background: linear-gradient(
						-45deg,
						#3b82f6,
						#8b5cf6,
						#06b6d4,
						#10b981,
						#f59e0b,
						#ef4444,
						#ec4899
					);
					background-size: 400% 400%;
					background-clip: text;
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
					animation: gradient-shift 4s ease infinite;
					text-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
					filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.4));
				}
				
				.float-animation {
					animation: float 6s ease-in-out infinite;
				}
				
				@media (max-width: 768px) {
					.animation-title {
						font-size: 2.5rem;
					}
				}
			`}</style>
			
			<div className="w-full max-w-6xl mx-auto space-y-8">
				{/* Hero Title Section with Animation */}
				<div className="text-center space-y-6">
					<h1 className="animation-title mb-3 text-center">
						{t("animation_composer")}
					</h1>
					<p className="font-OS text-lg opacity-80 text-center max-w-2xl mx-auto leading-relaxed">
						{t("animation_desc")}
					</p>
					
					{/* Feature highlights */}
					<div className="flex flex-wrap justify-center gap-3">
						<div className="flex items-center gap-2 bg-white/20 dark:bg-black/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">
							<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
							<span>WebP & GIF</span>
						</div>
						<div className="flex items-center gap-2 bg-white/20 dark:bg-black/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">
							<div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
							<span>{t("local_processing")}</span>
						</div>
						<div className="flex items-center gap-2 bg-white/20 dark:bg-black/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">
							<div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
							<span>{t("real_time_preview")}</span>
						</div>
					</div>
				</div>

				{/* Modern Container with Glass Effect */}
				<div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden relative">
					{/* Loading 状态指示器 - 绝对定位在容器外部顶部 */}
					{(ffmpegLoading || !ffmpegReady || loading) && (
						<div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 backdrop-blur-sm rounded-2xl p-3 border border-purple-200/50 dark:border-purple-700/30 shadow-lg">
							<div className="flex items-center gap-3">
								<Loader2 className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-spin" />
								<span className="text-purple-700 dark:text-purple-300 font-medium text-sm">
									{ffmpegLoading || !ffmpegReady ? t("load_ffmpeg") : t("creating_animation")}
								</span>
							</div>
						</div>
					)}

					{/* Header Section */}
					<div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 px-8 py-6 border-b border-slate-200/50 dark:border-slate-600/50">
						<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
									<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
									</svg>
								</div>
								<div>
									<h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t("animation_composer")}</h2>
									<p className="text-sm text-slate-600 dark:text-slate-400">{t("animation_composer_subtitle")}</p>
								</div>
							</div>
							
							{/* Quick Stats */}
							{files.length > 0 && (
								<div className="flex items-center gap-4 text-sm">
									<div className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/50 rounded-full">
										<span className="w-2 h-2 bg-blue-500 rounded-full"></span>
										<span className="text-blue-700 dark:text-blue-300">{files.length} {t("images_count")}</span>
									</div>
									<div className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/50 rounded-full">
										<span className="w-2 h-2 bg-green-500 rounded-full"></span>
										<span className="text-green-700 dark:text-green-300">{frameRate[0]} FPS</span>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Control Panel */}
					<div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/50 dark:border-slate-600/50">
						<div className="flex flex-wrap items-center justify-center gap-6">
							{/* Format Selection */}
							<div className="flex items-center gap-3">
								<Label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("format")}</Label>
								<Select value={format} onValueChange={setFormat}>
									<SelectTrigger className="w-[120px] bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm">
										<SelectValue />
									</SelectTrigger>
									<SelectContent className="bg-white dark:bg-slate-800">
										<SelectItem value="webp">.webp</SelectItem>
										<SelectItem value="gif">.gif</SelectItem>
									</SelectContent>
								</Select>
							</div>
							
							{/* Frame Rate */}
							<div className="flex items-center gap-3">
								<Label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("frame_rate")}</Label>
								<div className="flex items-center gap-2">
									<div className="w-24">
										<Slider
											value={frameRate}
											onValueChange={setFrameRate}
											min={1}
											max={60}
											step={1}
											className="[&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-blue-500"
										/>
									</div>
									<span className="text-sm font-mono w-12 text-slate-600 dark:text-slate-400">
										{frameRate[0]}fps
									</span>
								</div>
							</div>
							
							{/* Quality */}
							<div className="flex items-center gap-3">
								<Label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("quality")}</Label>
								<div className="flex items-center gap-2">
									<div className="w-24">
										<Slider
											value={quality}
											onValueChange={setQuality}
											min={10}
											max={100}
											step={5}
											className="[&_[role=slider]]:bg-green-500 [&_[role=slider]]:border-green-500"
										/>
									</div>
									<span className="text-sm font-mono w-12 text-slate-600 dark:text-slate-400">
										{quality[0]}%
									</span>
								</div>
							</div>
							
							{/* Action Buttons */}
							<div className="flex items-center gap-3">
								<Button 
									onClick={isPlaying ? stopPreview : startPreview}
									disabled={files.length < 2}
									variant="outline"
									size="sm"
									className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
								>
									{isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
									{isPlaying ? t("stop_preview") : t("preview")}
								</Button>
								
								<Button 
									onClick={handleCreateAnimation} 
									disabled={loading || ffmpegLoading || !ffmpegReady || files.length < 2}
									size="sm"
									className="w-40 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg disabled:opacity-50"
								>
									{ffmpegLoading || !ffmpegReady || loading ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<>
											<Clapperboard className="w-4 h-4 mr-2" />
											{t("create_animation")}
										</>
									)}
								</Button>
							</div>
						</div>
					</div>
					
					{/* Progress Bar */}
					{loading && (
						<div className="px-8 py-4 bg-blue-50/50 dark:bg-blue-900/20 border-b border-blue-200/50 dark:border-blue-800/50">
							<div className="flex justify-between items-center text-sm mb-2">
								<span className="text-blue-700 dark:text-blue-300 font-medium">
									{currentFileName || t("creating_animation")}
								</span>
								<span className="text-blue-700 dark:text-blue-300 font-bold">
									{progress}%
								</span>
							</div>
							<Progress 
								value={progress} 
								className="w-full h-2 bg-blue-100 dark:bg-blue-900/50 [&>div]:bg-blue-500" 
							/>
						</div>
					)}
					
					{/* Main Content Area */}
					<div className="p-8">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							{/* Left Panel: File Upload */}
							<div className="space-y-6">
								{/* File Naming Guide */}
								<div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-yellow-200/50 dark:border-yellow-800/50">
									<div className="flex items-start gap-3">
										<div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
											<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										</div>
										<div className="flex-1">
											<h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">{t("file_naming_suggestion")}</h4>
											<p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">{t("naming_tip_intro")}</p>
											<div className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
												<div>✓ img_01.png, img_02.png, img_03.png</div>
												<div>✓ frame001.jpg, frame002.jpg, frame003.jpg</div>
											</div>
											<div className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 font-medium">
												✅ {t("format_support")} • {t("auto_sort")}
											</div>
										</div>
									</div>
								</div>
								
								{/* Upload Area */}
								<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
									<DropzoneWithPreview
										onFilesSelected={handleFilesSelected}
										files={files}
										onRemoveFile={handleRemoveFile}
										onClearAllFiles={handleClearFiles}
									/>
								</div>
								
								{/* File Count Warning */}
								{files.length > 0 && files.length < 2 && (
									<div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-xl p-4">
										<div className="flex items-center gap-3">
											<div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
												<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
												</svg>
											</div>
											<span className="text-sm text-orange-700 dark:text-orange-300 font-medium">
												{t("min_files_required")} {files.length} {t("files_count")}
											</span>
										</div>
									</div>
								)}
							</div>
							
							{/* Right Panel: Preview/Result */}
							<div className="flex flex-col h-full">
								{files.length > 0 ? (
									!animationResult ? (
										// Preview Area
										<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col h-full">
											<div className="flex items-center gap-3 mb-6">
												<div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
													<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
													</svg>
												</div>
												<div>
													<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t("animation_preview")}</h3>
													<p className="text-sm text-slate-500 dark:text-slate-400">{t("realtime_preview_desc")}</p>
												</div>
											</div>
											
											<div className="flex-1 flex items-center justify-center">
												{(() => {
													const sortedFiles = getSortedFiles(files);
													const currentFile = sortedFiles[currentFrame];
													return currentFile && (
														<div className="space-y-4 w-full max-w-md">
															<div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
																<img
																	src={URL.createObjectURL(currentFile)}
																	alt={`Frame ${currentFrame + 1}`}
																	className="max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
																/>
															</div>
															<div className="text-center space-y-2">
																<div className="text-lg font-semibold text-slate-700 dark:text-slate-300">
																	{t("frame_count").replace("{current}", (currentFrame + 1).toString()).replace("{total}", sortedFiles.length.toString())}
																</div>
																<div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-1 inline-block">
																	{currentFile.name}
																</div>
															</div>
														</div>
													);
												})()}
											</div>
										</div>
									) : (
										// Result Area
										<div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800/50 shadow-sm p-6 flex flex-col h-full">
											<div className="text-center mb-6">
												<div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
													<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
													</svg>
												</div>
												<h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">{t("animation_result")}</h3>
												<div className="text-green-700 dark:text-green-300 space-y-1">
													<div className="font-semibold">{animationResult.name}</div>
													<div className="text-sm">
														{(animationResult.size / 1024 / 1024).toFixed(2)} MB • {animationResult.format.toUpperCase()}
													</div>
												</div>
											</div>
											
											<div className="flex-1 flex items-center justify-center mb-6">
												<div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-green-200 dark:border-green-800/50">
													<img 
														src={animationResult.url} 
														alt="Generated Animation" 
														className="max-w-full max-h-48 mx-auto rounded-lg"
													/>
												</div>
											</div>
											
											<div className="flex justify-center gap-3">
												<Button 
													onClick={handleDownload}
													size="sm"
													className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
												>
													<Download className="w-4 h-4 mr-2" />
													{t("download")}
												</Button>
												<Button 
													variant="outline" 
													size="sm"
													onClick={clearResult}
													className="bg-white dark:bg-slate-800 border-green-300 dark:border-green-700"
												>
													{t("clear_result")}
												</Button>
											</div>
										</div>
									)
								) : (
									// Empty State
									<div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-12 flex flex-col items-center justify-center text-center h-full">
										<div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-6">
											<svg className="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
											</svg>
										</div>
										<h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-3">
											{t("animation_preview")}
										</h3>
										<p className="text-slate-500 dark:text-slate-500 max-w-xs">
											{t("preview_instruction")}
										</p>
									</div>
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
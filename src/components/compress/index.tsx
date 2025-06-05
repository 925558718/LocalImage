"use client";
import ffm_ins from "@/lib/ffmpeg";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from 'next-intl';
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
} from "@/components/shadcn";
import Advanced from "./components/Advanced";
import { DropzoneWithPreview } from "./components/DropzoneWithPreview";
import EzoicAd from "@/components/AdSense";
import { Loader2, Upload } from "lucide-react";

// 导入FFMPEG类用于静态方法调用
import { FFMPEG } from "@/lib/ffmpeg";

export default function Compress() {
	const [loading, setLoading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [currentFileName, setCurrentFileName] = useState("");
	const t = useTranslations();
	const { isLoading: ffmpegLoading, isReady: ffmpegReady, error: ffmpegError } = useFFmpeg();
	const [downloadList, setDownloadList] = useState<
		{ 
			url: string; 
			name: string; 
			originalSize: number; 
			compressedSize: number;
			processingTime?: number; // 压缩所用时间(毫秒)
			format?: string;
			quality?: number;
			blob?: Blob; // 添加 blob 数据存储
		}[]
	>([]);
	// Track file selection state
	const [files, setFiles] = useState<File[]>([]);
	
	// 单个文件进度状态
	const [fileProgress, setFileProgress] = useState<{[key: string]: {isProcessing: boolean, progress: number}}>({});
	
	// 处理新文件添加
	const handleFilesSelected = (newFiles: File[]) => {
		console.log(`[文件选择] 接收到 ${newFiles.length} 个新文件:`, newFiles.map(f => f.name));
		console.log('[文件选择] 当前已有文件数量:', files.length);
		
		setFiles(prevFiles => {
			const updatedFiles = [...prevFiles, ...newFiles];
			console.log(`[文件选择] 更新后总文件数量: ${updatedFiles.length}`);
			
			return updatedFiles;
		});
	};
	
	// 处理删除单个文件
	const handleRemoveFile = (index: number) => {
		setFiles(prevFiles => prevFiles.filter((_, idx) => idx !== index));
	};
	
	// 清空已选择的文件
	const handleClearFiles = () => {
		setFiles([]);
	};

	// 格式和高级配置
	const [format, setFormat] = useState("webp");
	const [advanced, setAdvanced] = useState({ width: "", height: "", quality: 85 });
	
	// 组件挂载时自动加载FFmpeg - 现在由useFFmpeg hook处理
	useEffect(() => {
		return () => {
			// 清理FFmpeg内存和实例池
			if (ffm_ins) {
				ffm_ins.cleanupMemory().catch(error => {
					console.warn('组件卸载时清理FFmpeg内存失败:', error);
				});
			}
			FFMPEG.clearInstancePool().catch(error => {
				console.warn('组件卸载时清理实例池失败:', error);
			});
		};
	}, []); // 空依赖数组，只在挂载和卸载时执行
	
	// 单独处理downloadList变化时的清理 - 确保URL被及时释放
	useEffect(() => {
		return () => {
			// 当downloadList即将发生变化时，清理旧的URL
			downloadList.forEach(item => {
				if (item.url) {
					URL.revokeObjectURL(item.url);
				}
			});
		};
	}, [downloadList]);
	
	// 清空已压缩的文件列表
	const handleClearDownloadList = async () => {
		// 释放所有已创建的blob URL以防止内存泄漏
		downloadList.forEach(item => {
			URL.revokeObjectURL(item.url);
		});
		setDownloadList([]);
		
		// 清理FFmpeg内存和实例池
		try {
			if (ffm_ins) {
				await ffm_ins.cleanupMemory();
			}
			await FFMPEG.clearInstancePool();
		} catch (error) {
			console.warn('清理FFmpeg内存失败:', error);
		}
	};

	// 处理压缩
	async function handleCompress() {
		if (files.length === 0) return;
		
		// 如果FFmpeg还在加载中，不执行
		if (ffmpegLoading) {
			console.log('[按钮点击] FFmpeg正在加载中，忽略点击');
			return;
		}
		
		// 如果FFmpeg未准备好，提示用户
		if (!ffmpegReady) {
			console.log('[按钮点击] FFmpeg未准备好，提示用户');
			alert('FFmpeg正在加载中，请稍等...');
			return;
		}

		// 如果有错误，提示用户
		if (ffmpegError) {
			alert(`FFmpeg加载失败: ${ffmpegError}`);
			return;
		}
		
		console.log('[压缩流程] 开始压缩流程');
		setLoading(true);
		setProgress(0);
		setCurrentFileName("");
		setDownloadList([]);
		setFileProgress({}); // 重置文件进度
		
		// 开始处理前先清理内存，确保从干净状态开始
		try {
			if (ffm_ins) {
				await ffm_ins.cleanupMemory();
			}
		} catch (error) {
			console.warn('开始压缩前清理FFmpeg内存失败:', error);
		}
		
		try {
			// 提前显示准备状态
			setCurrentFileName("正在准备文件...");
			setProgress(5);
			
			// 并行读取所有文件 - 大幅提升性能
			console.log('[性能优化] 开始并行读取文件...');
			const startTime = performance.now();
			
			const fileData: { data: ArrayBuffer; name: string; originalSize: number }[] = await Promise.all(
				files.map(async (file) => {
					// 初始化文件进度状态
					setFileProgress(prev => ({
						...prev,
						[file.name]: { isProcessing: true, progress: 0 }
					}));
					
					const arrayBuffer = await file.arrayBuffer();
					return {
						data: arrayBuffer,
						name: file.name,
						originalSize: file.size
					};
				})
			);
			
			const readTime = performance.now() - startTime;
			console.log(`[性能优化] 文件读取完成，耗时: ${readTime.toFixed(1)}ms`);
			
			setCurrentFileName("开始压缩文件...");
			setProgress(15);
			
			// 确保FFmpeg已加载
			if (ffm_ins) {
				await ffm_ins.load();
			}

			// 使用串行压缩模式 - 稳定且内存高效
			const results = await FFMPEG.convertImagesSerial({
				files: fileData,
				format,
				quality: advanced.quality,
				width: advanced.width ? Number(advanced.width) : undefined,
				height: advanced.height ? Number(advanced.height) : undefined,
				onProgress: (completed: number, total: number) => {
					// 将压缩进度映射到15%-95%的范围
					const compressionProgress = (completed / total) * 80; // 80% for compression
					const totalProgress = 15 + compressionProgress; // Start from 15%
					setProgress(Math.round(totalProgress));
					
					// 更新当前处理的文件进度
					if (completed < total) {
						const currentFileIndex = completed;
						const currentFileName = fileData[currentFileIndex]?.name;
						if (currentFileName) {
							setFileProgress(prev => ({
								...prev,
								[currentFileName]: { isProcessing: true, progress: 50 }
							}));
						}
					}
				},
				onFileComplete: (result: {
					url: string;
					name: string;
					originalSize: number;
					compressedSize: number;
					processingTime: number;
					format: string;
					quality: number;
				}) => {
					setCurrentFileName(result.name);
					
					// 更新文件完成状态
					setFileProgress(prev => ({
						...prev,
						[result.name]: { isProcessing: false, progress: 100 }
					}));
					
					// 实时更新结果列表
					setDownloadList(prev => {
						const newList = [...prev, result];
						
						// 异步获取并缓存 blob 数据以优化下载性能
						setTimeout(async () => {
							try {
								if (result.url && result.url.startsWith('blob:')) {
									const response = await fetch(result.url);
									if (response.ok) {
										const blob = await response.blob();
										if (blob && blob.size > 0) {
											// 更新列表中对应项目的 blob 数据
											setDownloadList(currentList => 
												currentList.map(item => 
													item.url === result.url && item.name === result.name
														? { ...item, blob }
														: item
												)
											);
											console.log(`[blob缓存] 成功缓存: ${result.name} (${blob.size} bytes)`);
										}
									}
								}
							} catch (error) {
								console.warn(`[blob缓存] 缓存失败: ${result.name}`, error);
							}
						}, 0); // 使用 setTimeout 避免阻塞 UI 更新
						
						return newList;
					});
				}
			});

			// 完成所有文件处理
			setProgress(100);
			setCurrentFileName("");
			
		} catch (e) {
			console.error("压缩失败", e);
			// 压缩失败时清除进度状态
			setFileProgress({});
			// 压缩失败时也清理FFmpeg内存和实例池
			try {
				if (ffm_ins) {
					await ffm_ins.cleanupMemory();
				}
				await FFMPEG.clearInstancePool();
			} catch (cleanupError) {
				console.warn('清理FFmpeg内存失败:', cleanupError);
			}
		} finally {
			setLoading(false);
			setProgress(0);
			setCurrentFileName("");
			// 一段时间后清除文件进度状态
			setTimeout(() => {
				setFileProgress({});
			}, 3000);
		}
	}

	return (
		<div className="w-full max-w-6xl mx-auto">
			{/* 玻璃效果容器 */}
			<div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-slate-700/20 shadow-xl relative">
				{/* Loading 状态指示器 - 绝对定位在容器外部顶部 */}
				{(ffmpegLoading || !ffmpegReady || loading) && (
					<div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm rounded-2xl p-3 border border-blue-200/50 dark:border-blue-700/30 shadow-lg">
						<div className="flex items-center gap-3">
							<Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
							<span className="text-blue-700 dark:text-blue-300 font-medium text-sm">
								{ffmpegLoading || !ffmpegReady ? '正在加载FFMPEG核心...' : t("compressing_btn")}
							</span>
						</div>
					</div>
				)}

				{/* 操作栏 */}
				<div className="flex gap-4 justify-center mb-8 flex-wrap">
					{/* 格式选择器 */}
					<div className="flex items-center gap-3 px-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-slate-700/30">
						<div className="flex items-center gap-2">
							<svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							<span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("output_format")}</span>
						</div>
						<Select value={format} onValueChange={setFormat}>
							<SelectTrigger className="w-24 h-8 bg-white/70 dark:bg-slate-800/70 border-white/40 dark:border-slate-600/40">
								<SelectValue placeholder="Format" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="webp">.webp</SelectItem>
								<SelectItem value="png">.png</SelectItem>
								<SelectItem value="jpg">.jpg</SelectItem>
							</SelectContent>
						</Select>
					</div>
					
					<Advanced onChange={setAdvanced} />
					
					<Button 
						onClick={handleCompress} 
						disabled={loading || ffmpegLoading || !ffmpegReady || files.length === 0}
						className="px-8 h-[50px] w-48 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
						<div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/50 dark:to-slate-700/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/50 dark:border-slate-600/30">
							<div className="flex justify-between items-center mb-4">
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
									<span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
										{t("processing_progress")}
									</span>
								</div>
								<span className="text-lg font-bold text-blue-600 dark:text-blue-400">
									{progress}%
								</span>
							</div>
							
							<Progress value={progress} className="w-full h-3 mb-4" />
							
							{currentFileName && (
								<div className="text-center">
									<div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
										<span className="font-medium">{t("current_file")}:</span>
									</div>
									<div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-slate-700 dark:text-slate-300 border border-white/30 dark:border-slate-600/30">
										{currentFileName}
									</div>
								</div>
							)}
							
							{files.length > 1 && (
								<div className="text-center mt-3 text-sm text-slate-600 dark:text-slate-400">
									{Math.floor(progress / 100 * files.length)} / {files.length} {t("files_selected")}
								</div>
							)}
							
							{files.length > 3 && (
								<div className="mt-4 p-4 bg-amber-50/80 dark:bg-amber-900/20 backdrop-blur-sm rounded-xl border border-amber-200/50 dark:border-amber-700/30">
									<div className="text-sm text-amber-800 dark:text-amber-200">
										<div className="flex items-center gap-2 mb-2">
											<span>💡</span>
											<span className="font-medium">{t("performance_tips")}</span>
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
				<div className="mb-8">
					<DropzoneWithPreview
						onFilesSelected={handleFilesSelected}
						files={files}
						onRemoveFile={handleRemoveFile}
						onClearAllFiles={handleClearFiles}
					/>
				</div>
				
				{/* 压缩结果区域 */}
				{downloadList.length > 0 && (
					<div className="space-y-6">
						{/* 结果区域标题 */}
						<div className="flex justify-between items-center">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
									<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
									{t('compressed_files')} ({downloadList.length})
								</h3>
							</div>
							<Button 
								variant="outline"
								size="sm"
								onClick={handleClearDownloadList}
								className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
							>
								<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
								{t('clear_all')}
							</Button>
						</div>
						
						{/* 总体统计信息 */}
						{downloadList.length > 0 && (
							<div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-sm rounded-2xl p-6 border border-green-200/50 dark:border-green-700/30">
								<h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
									</svg>
									{t('overall_stats')}
								</h4>
								<CompressItem 
									isOverallStats={true}
									name={t('all_files')}
									url=""
									originalSize={downloadList.reduce((sum, item) => sum + item.originalSize, 0)}
									compressedSize={downloadList.reduce((sum, item) => sum + item.compressedSize, 0)}
									processingTime={downloadList.reduce((sum, item) => sum + (item.processingTime || 0), 0)}
									format={downloadList.length > 0 ? downloadList[downloadList.length - 1].format : format}
									quality={downloadList.length > 0 ? downloadList[0].quality : undefined}
									downloadItems={downloadList.map(item => ({ 
										url: item.url, 
										name: item.name, 
										blob: item.blob 
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
									<div key={item.name + item.url} className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-slate-700/30">
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

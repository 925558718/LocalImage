import ffm_ins from "@/lib/ffmpeg";
import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/hooks/useI18n";
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

// 导入FFMPEG类用于静态方法调用
import { FFMPEG } from "@/lib/ffmpeg";

function ImageTrans() {
	const [loading, setLoading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [currentFileName, setCurrentFileName] = useState("");
	const { t } = useI18n();
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
			
			// 文件选择后预热FFmpeg实例
			if (updatedFiles.length > 0 && ffm_ins) {
				console.log('[性能优化] 开始预热FFmpeg实例...');
				ffm_ins.load().catch(error => {
					console.warn('[性能优化] FFmpeg预热失败:', error);
				});
			}
			
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
	
	// 组件卸载时清理内存
	useEffect(() => {
		// 组件挂载时预热FFmpeg实例
		if (ffm_ins) {
			console.log('[性能优化] 组件挂载时预热FFmpeg实例...');
			ffm_ins.load().catch(error => {
				console.warn('[性能优化] 组件挂载时FFmpeg预热失败:', error);
			});
		}
		
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
		<div className="min-w-[700px]">
			<div className="flex flex-col gap-4 min-w-[700px]">
				{/* 操作栏 - 放在最上方并居中 */}
				<div className="flex gap-2 justify-center w-full min-w-[700px]">
					<Select value={format} onValueChange={setFormat}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Format" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="webp">.webp</SelectItem>
							<SelectItem value="png">.png</SelectItem>
							<SelectItem value="jpg">.jpg</SelectItem>
						</SelectContent>
					</Select>
					<Advanced onChange={setAdvanced} />
					<Button onClick={handleCompress} disabled={loading || files.length === 0}>
						{loading ? t("compressing_btn") : t("compress_btn")}
					</Button>
				</div>

				{/* 进度条 */}
				{loading && (
					<div className="w-full max-w-lg mx-auto space-y-3 p-4 bg-muted/30 rounded-lg border">
						<div className="flex justify-between items-center text-sm font-medium">
							<span>{t("processing_progress")}</span>
							<span className="text-primary">{progress}%</span>
						</div>
						<Progress value={progress} className="w-full h-2" />
						{currentFileName && (
							<div className="text-sm text-muted-foreground text-center">
								<span className="font-medium">{t("current_file")}:</span>
								<div className="truncate mt-1 text-xs bg-background px-2 py-1 rounded">
									{currentFileName}
								</div>
							</div>
						)}
						<div className="text-xs text-muted-foreground text-center">
							{files.length > 1 && (
								<span>
									{Math.floor(progress / 100 * files.length)} / {files.length} {t("files_selected")}
								</span>
							)}
						</div>
						{files.length > 3 && (
							<div className="text-xs text-amber-600 text-center mt-2 p-2 bg-amber-50 rounded">
								💡 处理多个大图片可能需要更多内存。如遇到内存不足错误，建议：
								<br />• 分批处理，每次选择3-5个文件
								<br />• 先压缩大文件，再处理小文件
								<br />• 关闭其他占用内存的浏览器标签页
							</div>
						)}
					</div>
				)}

				{/* 左侧上传区域 */}
				<div className="space-y-4 min-w-[300px]">
					{/* 合并的拖拽上传和预览区域 */}
					<DropzoneWithPreview
						onFilesSelected={handleFilesSelected}
						files={files}
						onRemoveFile={handleRemoveFile}
						onClearAllFiles={handleClearFiles}
					/>

					{/* 注意: 文件输入框已移到 DropzoneWithPreview 组件内部 */}
				</div>
				
				{/* 压缩结果 */}
				{downloadList.length > 0 && (
					<div className="mt-4 space-y-4 min-w-[700px]">
						<div className="flex justify-between items-center mb-2">
							<h3 className="text-base font-medium">{t('compressed_files')} ({downloadList.length})</h3>
							<Button 
								variant="destructive"
								size="sm"
								onClick={handleClearDownloadList}
							>
								{t('clear_all')}
							</Button>
						</div>
						
						{/* 总体压缩统计信息 - 对于任何数量的文件都显示 */}
						{downloadList.length > 0 && (
							<div className="bg-muted/50 p-3 rounded-md mb-2">
								<h4 className="text-sm font-medium mb-2">{t('overall_stats')}</h4>
								<CompressItem 
									isOverallStats={true}
									name={t('all_files')}
									url=""
									originalSize={downloadList.reduce((sum, item) => sum + item.originalSize, 0)}
									compressedSize={downloadList.reduce((sum, item) => sum + item.compressedSize, 0)}
									// 计算所有文件的总处理时间
									processingTime={downloadList.reduce((sum, item) => sum + (item.processingTime || 0), 0)}
									format={downloadList.length > 0 ? downloadList[downloadList.length - 1].format : format}
									// 使用已压缩文件的实际质量值，而不是当前滑动条的值
									quality={downloadList.length > 0 ? downloadList[0].quality : undefined}
									// 传递下载列表
									downloadItems={downloadList.map(item => ({ 
										url: item.url, 
										name: item.name, 
										blob: item.blob 
									}))}
									key="overall-stats"
								/>
							</div>
						)}
						
						
						{/* 单个文件压缩项 */}
						<div className="space-y-2">
							{downloadList.map((item) => {
								const currentProgress = fileProgress[item.name];
								return (
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
										key={item.name + item.url}
									/>
								);
							})}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default ImageTrans;

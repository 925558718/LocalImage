import { Button } from "@/components/shadcn/button";
import { useTranslations } from 'next-intl';
import { Download } from "lucide-react";
import { Progress } from "@/components/shadcn";
import JSZip from "jszip";

interface CompressItemProps {
  url: string;
  name: string;
  originalSize: number;
  compressedSize: number;
  isOverallStats?: boolean; // 是否为总体统计数据
  processingTime?: number;  // 压缩处理时间(毫秒)
  format?: string;          // 压缩格式
  quality?: number;         // 压缩质量
  downloadItems?: { url: string; name: string; blob?: Blob }[]; // 总体统计时的下载列表
  isProcessing?: boolean;   // 是否正在处理
  progress?: number;        // 处理进度(0-100)
  blob?: Blob;              // 添加blob数据支持
}

function CompressItem({ 
	url, 
	name, 
	originalSize, 
	compressedSize, 
	isOverallStats = false, 
	processingTime, 
	format, 
	quality,
	downloadItems = [],
	isProcessing = false,
	progress = 0,
	blob
}: CompressItemProps) {
	const t = useTranslations();
	
	// 格式化文件大小
	const formatFileSize = (bytes: number): string => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};
	
	// 计算压缩率
	const compressionRatio = originalSize > 0 ? ((originalSize - compressedSize) / originalSize * 100).toFixed(1) : '0';
	
	// 确定压缩率显示的颜色
	const getRatioColor = (ratio: number): string => {
		if (ratio < 0) return 'text-destructive'; // 如果体积变大了
		if (ratio < 20) return 'text-amber-500'; // 压缩率较低
		if (ratio < 50) return 'text-lime-500';  // 中等压缩率
		return 'text-emerald-500';               // 高压缩率
	};
	
	const ratioColor = getRatioColor(parseFloat(compressionRatio));
	
	// 批量下载功能
	const handleDownloadAll = async () => {
		try {
			const zip = new JSZip();
			
			// 验证是否有有效的项目
			if (downloadItems.length === 0) {
				console.warn(t('no_valid_files_download'));
				return;
			}
			
			console.log(`${t('batch_download_started')}: ${downloadItems.length}`);
			
			// 串行处理每个文件以避免并发导致的问题
			let successCount = 0;
			for (let i = 0; i < downloadItems.length; i++) {
				const item = downloadItems[i];
				try {
					// 验证项目数据
					if (!item.name) {
						console.warn(`${t('skipping_invalid_item')}: 缺少文件名`);
						continue;
					}
					
					let blob: Blob;
					
					// 优先使用存储的blob数据
					if (item.blob) {
						blob = item.blob;
						console.log(`${t('using_cached_blob')}: ${item.name} (${blob.size} bytes)`);
					} else if (item.url && item.url.startsWith('blob:')) {
						// 如果没有缓存的blob，尝试从URL获取
						console.log(`${t('fetching_blob_from_url')}: ${item.name}`);
						
						const response = await fetch(item.url, {
							method: 'GET',
							headers: {
								'Cache-Control': 'no-cache'
							}
						});
						
						if (!response.ok) {
							throw new Error(`HTTP ${response.status}: ${response.statusText}`);
						}
						
						blob = await response.blob();
					} else {
						console.warn(`${t('skipping_invalid_url')}: ${item.name} - ${item.url || 'undefined'}`);
						continue;
					}
					
					// 验证blob
					if (!blob || blob.size === 0) {
						console.warn(`${t('file_empty_skip')}: ${item.name}`);
						continue;
					}
					
					// 清理文件名中的非法字符
					const cleanName = item.name.replace(/[<>:"/\\|?*]/g, '_');
					zip.file(cleanName, blob);
					successCount++;
					console.log(`${t('file_added_to_zip')}: ${cleanName} (${blob.size} bytes)`);
					
				} catch (error) {
					console.error(`${t('process_file_failed')} ${item.name}:`, error);
					// 继续处理下一个文件而不是整体失败
					continue;
				}
			}
			
			// 检查是否有文件被成功添加到zip
			if (successCount === 0) {
				console.error(t('no_valid_files_download'));
				alert(t('no_valid_files_download_alert'));
				return;
			}
			
			console.log(`${t('generating_zip')}: ${successCount}`);
			
			// 生成 zip 文件并下载
			const content = await zip.generateAsync({ 
				type: "blob",
				compression: "DEFLATE",
				compressionOptions: {
					level: 6
				}
			});
			
			// 创建下载链接
			const downloadUrl = URL.createObjectURL(content);
			const a = document.createElement("a");
			a.href = downloadUrl;
			a.download = `compressed_images_${new Date().getTime()}.zip`;
			
			// 添加到DOM，触发下载，然后清理
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			
			// 延迟清理URL以确保下载完成
			setTimeout(() => {
				URL.revokeObjectURL(downloadUrl);
			}, 1000);
			
			console.log(`${t('batch_download_completed')} - ${successCount}/${downloadItems.length} ${t('files_downloaded')}`);
			
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error(`${t('batch_download_failed')}:`, error);
			alert(`${t('batch_download_failed')}: ${errorMessage}`);
		}
	};
	
	// 格式化处理时间
	const formatProcessingTime = (ms?: number): string => {
		if (ms === undefined) return t('unknown_time');
		
		// 如果小于1秒，显示毫秒
		if (ms < 1000) {
			return `${Math.round(ms)} ${t('milliseconds')}`;
		}
		
		// 如果大于等于1秒，显示秒和毫秒
		const seconds = Math.floor(ms / 1000);
		const remainingMs = Math.round(ms % 1000);
		
		if (seconds < 60) {
			return `${seconds}.${remainingMs.toString().padStart(3, '0')} ${t('seconds')}`;
		}
		
		// 如果大于等于1分钟，显示分钟和秒
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')} ${t('minutes')}`;
	};
	
	// 根据是否为总体统计选择不同的显示样式
	if (isOverallStats) {
		// 格式化处理时间
		const formattedProcessingTime = formatProcessingTime(processingTime);
		
		return (
			<div className="flex flex-col space-y-2">
				<div className="flex items-center justify-between bg-background p-3 rounded-md border">
					<div className="flex items-center gap-3">
						<span className="font-medium">{name}</span>
						<span className={`text-sm font-medium ${ratioColor}`}>
							{compressionRatio}% {parseFloat(compressionRatio) >= 0 ? t('saved') : t('increased')}
						</span>
					</div>
					{/* 批量下载按钮 */}
					<Button 
						onClick={handleDownloadAll} 
						disabled={downloadItems.length === 0}
						size="sm"
						className="gap-2"
					>
						<Download size={16} />
						{t('download_all')} ({downloadItems.length})
					</Button>
				</div>
				
				{/* 总体文件大小和压缩率 */}
				<div className="flex justify-between text-xs px-2">
					<span className="text-muted-foreground">
						{t('total_size')}: {formatFileSize(originalSize)} {t('arrow_symbol')} {formatFileSize(compressedSize)}
					</span>
					<span className="text-muted-foreground">
						{t('saved_size')}: {formatFileSize(originalSize - compressedSize)}
					</span>
				</div>
				
				{/* 压缩时间和设置 */}
				<div className="grid grid-cols-3 gap-2 text-xs px-2 text-muted-foreground">
					<div>
						<span className="font-medium">{t('processing_time')}:</span> {formattedProcessingTime}
					</div>
					{format && (
						<div>
							<span className="font-medium">{t('format')}:</span> {format.toUpperCase()}
						</div>
					)}
					{quality !== undefined && (
						<div>
							<span className="font-medium">{t('quality')}:</span> {quality}
						</div>
					)}
				</div>
			</div>
		);
	}
	
	// 单个文件项的显示 - 添加时间、格式和质量信息
	const formattedProcessingTime = formatProcessingTime(processingTime);
	
	// 处理下载
	const handleDownload = () => {
		try {
			let downloadUrl: string;
			
			// 优先使用存储的blob数据
			if (blob) {
				downloadUrl = URL.createObjectURL(blob);
				console.log(`${t("download_link_cached")}: ${name}`);
			} else if (url && url !== '') {
				downloadUrl = url;
				console.log(`${t("download_using_existing_url")}: ${name}`);
			} else {
				console.error(t("download_failed_no_data").replace("{name}", name));
				return;
			}
			
			// 创建临时链接进行下载
			const link = document.createElement('a');
			link.href = downloadUrl;
			link.download = name;
			
			// 添加到DOM并触发点击
			document.body.appendChild(link);
			link.click();
			
			// 清理
			document.body.removeChild(link);
			
			// 如果是从blob创建的URL，需要清理
			if (blob && downloadUrl !== url) {
				setTimeout(() => {
					URL.revokeObjectURL(downloadUrl);
				}, 1000);
			}
			
			console.log(`${t("download_started")}: ${name}`);
		} catch (error) {
			console.error(`${t("download_failed")}:`, error);
		}
	};
	
	return (
		<div className="flex flex-col space-y-1">
			<Button 
				variant="secondary" 
				className="w-full justify-between"
				onClick={handleDownload}
				disabled={isProcessing}
			>
				<span className="truncate mr-2">{name}</span>
				{isProcessing ? (
					<div className="flex items-center gap-2">
						<span className="text-xs">{progress}%</span>
						<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
					</div>
				) : (
					<Download />
				)}
			</Button>
			
			{/* 进度条 - 仅在处理时显示 */}
			{isProcessing && (
				<div className="px-2">
					<Progress value={progress} className="h-1" />
				</div>
			)}
			
			{/* 文件大小和压缩率 */}
			<div className="flex justify-between text-xs px-2">
				<span className="text-muted-foreground">
					{formatFileSize(originalSize)} {t('arrow_symbol')} {formatFileSize(compressedSize)}
				</span>
				<span className={ratioColor}>
					{compressionRatio}% {parseFloat(compressionRatio) >= 0 ? t('saved') : t('increased')}
				</span>
			</div>
			
			{/* 添加处理时间、格式和质量信息 */}
			<div className="grid grid-cols-3 gap-2 text-xs px-2 text-muted-foreground">
				{processingTime !== undefined && (
					<div>
						<span className="font-medium">{t('processing_time')}:</span> {formattedProcessingTime}
					</div>
				)}
				{format && (
					<div>
						<span className="font-medium">{t('format')}:</span> {format.toUpperCase()}
					</div>
				)}
				{quality !== undefined && (
					<div>
						<span className="font-medium">{t('quality')}:</span> {quality}
					</div>
				)}
			</div>
		</div>
	);
}

export default CompressItem;

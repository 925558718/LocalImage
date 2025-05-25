import { Button } from "@/components/shadcn/button";
import { useI18n } from "@/hooks/useI18n";
import { Download } from "lucide-react";

interface CompressItemProps {
  url: string;
  name: string;
  originalSize: number;
  compressedSize: number;
  isOverallStats?: boolean; // 是否为总体统计数据
  processingTime?: number;  // 压缩处理时间(毫秒)
  format?: string;          // 压缩格式
  quality?: number;         // 压缩质量
}

function CompressItem({ url, name, originalSize, compressedSize, isOverallStats = false, processingTime, format, quality }: CompressItemProps) {
	const { t } = useI18n();
	
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
					<span className="font-medium">{name}</span>
					<span className={`text-sm font-medium ${ratioColor}`}>
						{compressionRatio}% {parseFloat(compressionRatio) >= 0 ? t('saved') : t('increased')}
					</span>
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
	
	return (
		<div className="flex flex-col space-y-1">
			<a href={url} download={name} key={name} className="block">
				<Button variant="secondary" className="w-full justify-between">
					<span className="truncate mr-2">{name}</span>
					<Download />
				</Button>
			</a>
			
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

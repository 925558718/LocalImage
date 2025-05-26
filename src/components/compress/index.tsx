import ffm_ins from "@/lib/ffmpeg";
import { useState, useRef } from "react";
import { useI18n } from "@/hooks/useI18n";
import CompressItem from "./components/CompressItem";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Button,
} from "@/components/shadcn";
import Advanced from "./components/Advanced";
import DownloadAll from "./components/DownloadAll";
import { DropzoneWithPreview } from "./components/DropzoneWithPreview";
import EzoicAd from "@/components/AdSense";

function ImageTrans() {
	const [loading, setLoading] = useState(false);
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
		}[]
	>([]);
	// Track file selection state
	const [files, setFiles] = useState<File[]>([]);
	
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
	};

	// 格式和高级配置
	const [format, setFormat] = useState("webp");
	const [advanced, setAdvanced] = useState({ width: "", height: "", quality: 85 });
	
	// 清空已压缩的文件列表
	const handleClearDownloadList = () => {
		// 释放所有已创建的blob URL以防止内存泄漏
		downloadList.forEach(item => {
			URL.revokeObjectURL(item.url);
		});
		setDownloadList([]);
	};

	// 处理压缩
	async function handleCompress() {
		if (files.length === 0) return;
		setLoading(true);
		setDownloadList([]);
		try {
			const results: { 
				url: string; 
				name: string; 
				originalSize: number; 
				compressedSize: number;
				processingTime?: number; // 压缩所用时间(毫秒)
				format?: string;
				quality?: number;
			}[] = [];
			for (let i = 0; i < files.length; i++) {
				// 记录每个文件处理的开始时间
				const fileStartTime = performance.now();
				const file = files[i];
				const arrayBuffer = await file.arrayBuffer();
				const baseName = file.name.replace(/\.[^.]+$/, "");
				
				// 记录原始文件大小
				const originalSize = file.size;

				// 当选择 avif 时使用 webp 作为备选格式
				let actualFormat = format;
				let outputName = `${baseName}_compressed.${format}`;
				let compressedSize = 0;

				try {
					const compressed = await ffm_ins.convertImage({
						input: arrayBuffer,
						outputName,
						quality: advanced.quality,
						width: advanced.width ? Number(advanced.width) : undefined,
						height: advanced.height ? Number(advanced.height) : undefined,
					});

					const mimeMap: Record<string, string> = {
						webp: "image/webp",
						png: "image/png",
						jpg: "image/jpeg",
						jpeg: "image/jpeg",
						avif: "image/avif",
					};

					const blob = new Blob([compressed], { type: mimeMap[actualFormat] || "application/octet-stream" });
					// 记录压缩后的文件大小
					compressedSize = blob.size;
					const url = URL.createObjectURL(blob);
					// 计算当前文件的处理时间(毫秒)
					const fileProcessingTime = performance.now() - fileStartTime;
					results.push({ 
						url, 
						name: outputName, 
						originalSize, 
						compressedSize,
						processingTime: fileProcessingTime,
						format: actualFormat,
						quality: advanced.quality
					});
				} catch (error) {
					if (format === "avif") {
						// AVIF 转换失败，尝试使用 WebP 替代
						console.warn("AVIF 转换失败，使用 WebP 替代", error);
						actualFormat = "webp";
						outputName = `${baseName}_compressed.webp`;

						const compressed = await ffm_ins.convertImage({
							input: arrayBuffer,
							outputName,
							quality: advanced.quality,
							width: advanced.width ? Number(advanced.width) : undefined,
							height: advanced.height ? Number(advanced.height) : undefined,
						});

						const blob = new Blob([compressed], { type: "image/webp" });
						// 记录压缩后的文件大小
						compressedSize = blob.size;
						const url = URL.createObjectURL(blob);
						// 计算当前文件的处理时间(毫秒)
						const fileProcessingTime = performance.now() - fileStartTime;
						results.push({ 
							url, 
							name: outputName, 
							originalSize, 
							compressedSize,
							processingTime: fileProcessingTime,
							format: "webp", // 注意这里使用webp格式
							quality: advanced.quality
						});
					} else {
						// 其他格式转换失败，继续抛出异常
						throw error;
					}
				}
			}
			setDownloadList(results);
		} catch (e) {
			console.error("压缩失败", e);
		} finally {
			setLoading(false);
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
					<DownloadAll items={downloadList} />
				</div>

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
									key="overall-stats"
								/>
							</div>
						)}
						
						
						{/* 单个文件压缩项 */}
						<div className="space-y-2">
							{downloadList.map((item) => (
								<CompressItem
									name={item.name}
									url={item.url}
									originalSize={item.originalSize}
									compressedSize={item.compressedSize}
									processingTime={item.processingTime}
									format={item.format}
									quality={item.quality}
									key={item.name + item.url}
								/>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default ImageTrans;

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
			alert("至少需要2张图片来创建动画");
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
		setCurrentFileName("正在初始化...");
		stopPreview();
		
		try {
			if (!ffm_ins) {
				throw new Error('FFmpeg实例未初始化，请刷新页面重试');
			}

			// 先测试FFmpeg是否正常工作
			setCurrentFileName("正在测试FFmpeg...");
			const isFFmpegWorking = await ffm_ins.testFFmpeg();
			if (!isFFmpegWorking) {
				throw new Error('FFmpeg测试失败，请刷新页面重试');
			}
			console.log('[动画合成] FFmpeg测试通过');

			setCurrentFileName("正在合成动画...");
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
			
			setCurrentFileName("合成完成");
			setTimeout(() => {
				setCurrentFileName("");
			}, 1000);
			
		} catch (error) {
			console.error("动画合成失败:", error);
			alert(`动画合成失败: ${error instanceof Error ? error.message : '未知错误'}`);
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
		<div className="min-w-[700px]">
			<div className="flex flex-col gap-4 min-w-[700px]">
				{/* 操作栏 */}
				<div className="flex gap-2 justify-center w-full min-w-[700px]">
					<Select value={format} onValueChange={setFormat}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Format" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="webp">.webp</SelectItem>
							<SelectItem value="gif">.gif</SelectItem>
						</SelectContent>
					</Select>
					
					<Button 
						onClick={isPlaying ? stopPreview : startPreview}
						disabled={files.length < 2}
						variant="outline"
					>
						{isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
						{isPlaying ? t("stop_preview") : t("preview")}
					</Button>
					
					<Button 
						onClick={handleCreateAnimation} 
						disabled={loading || files.length < 2}
					>
						{loading ? t("creating_animation") : t("create_animation")}
					</Button>
				</div>
				
				{/* 动画设置 */}
				<div className="flex gap-4 justify-center items-center">
					<div className="flex items-center gap-2">
						<Label className="text-sm">{t("frame_rate")}:</Label>
						<div className="w-32">
							<Slider
								value={frameRate}
								onValueChange={setFrameRate}
								min={1}
								max={30}
								step={1}
							/>
						</div>
						<span className="text-sm text-muted-foreground">{frameRate[0]} fps</span>
					</div>
					
					<div className="flex items-center gap-2">
						<Label className="text-sm">{t("quality")}:</Label>
						<div className="w-32">
							<Slider
								value={quality}
								onValueChange={setQuality}
								min={10}
								max={100}
								step={5}
							/>
						</div>
						<span className="text-sm text-muted-foreground">{quality[0]}%</span>
					</div>
				</div>
				
				{/* 进度条 */}
				{loading && (
					<div className="w-full max-w-lg mx-auto space-y-3 p-4 bg-muted/30 rounded-lg border">
						<div className="flex justify-between items-center text-sm font-medium">
							<span>{currentFileName || t("creating_animation")}</span>
							<span className="text-primary">{progress}%</span>
						</div>
						<Progress value={progress} className="w-full h-2" />
						<div className="text-xs text-muted-foreground text-center">
							正在合成 {files.length} 张图片为 {format.toUpperCase()} 动画...
						</div>
					</div>
				)}
				
				{/* 主要内容区域 */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					{/* 左侧：文件上传 */}
					<div className="space-y-4">
						{/* 添加文件命名指导 */}
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
							<h4 className="text-sm font-medium text-blue-800 mb-2">📝 文件命名建议</h4>
							<div className="text-xs text-blue-700 space-y-1">
								<p>为了获得最佳动画效果，请确保文件名包含序号：</p>
								<p className="font-mono">• img_01.png, img_02.png, img_03.png</p>
								<p className="font-mono">• frame001.jpg, frame002.jpg, frame003.jpg</p>
								<p className="font-mono">• pic_1.webp, pic_2.webp, pic_3.webp</p>
								<p className="text-blue-600">✅ 支持PNG、JPG、WebP等格式混合使用</p>
								<p className="text-blue-600">✅ 系统会按文件名中的数字序列自动排序</p>
							</div>
						</div>
						
						<DropzoneWithPreview
							onFilesSelected={handleFilesSelected}
							files={files}
							onRemoveFile={handleRemoveFile}
							onClearAllFiles={handleClearFiles}
						/>
						
						{files.length > 0 && files.length < 2 && (
							<div className="text-center text-sm text-orange-600 bg-orange-50 p-3 rounded">
								至少需要2张图片才能创建动画，当前已选择 {files.length} 张
							</div>
						)}
					</div>
					
					{/* 右侧：动画预览或结果 */}
					{files.length > 0 && (
						<div className="space-y-4">
							{!animationResult ? (
								// 预览模式
								<div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
									<h3 className="text-lg font-medium mb-4">{t("animation_preview")}</h3>
									{(() => {
										const sortedFiles = getSortedFiles(files);
										const currentFile = sortedFiles[currentFrame];
										return currentFile && (
											<div className="relative">
												<img
													src={URL.createObjectURL(currentFile)}
													alt={`Frame ${currentFrame + 1}`}
													className="max-w-full max-h-64 mx-auto rounded"
												/>
												<div className="mt-2 text-sm text-muted-foreground">
													帧 {currentFrame + 1} / {sortedFiles.length}
												</div>
												<div className="mt-1 text-xs text-muted-foreground">
													当前文件: {currentFile.name}
												</div>
											</div>
										);
									})()}
								</div>
							) : (
								// 动画结果模式
								<div className="bg-muted/50 p-4 rounded-lg">
									<div className="flex items-center justify-between mb-4">
										<div>
											<h3 className="text-lg font-medium">{t('animation_result')}</h3>
											<div className="text-sm text-muted-foreground">
												{animationResult.name}
											</div>
											<div className="text-sm text-muted-foreground">
												{(animationResult.size / 1024 / 1024).toFixed(2)} MB • {animationResult.format.toUpperCase()}
											</div>
										</div>
										<div className="flex gap-2">
											<Button onClick={handleDownload}>
												<Download className="w-4 h-4 mr-2" />
												{t("download")}
											</Button>
											<Button variant="outline" onClick={clearResult}>
												清除结果
											</Button>
										</div>
									</div>
									<div className="text-center">
										<img 
											src={animationResult.url} 
											alt="Generated Animation" 
											className="max-w-full max-h-64 mx-auto rounded"
										/>
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default AnimationComposer;
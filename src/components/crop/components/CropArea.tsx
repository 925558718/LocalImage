"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/shadcn/button";
import { Crop, RotateCw } from "lucide-react";
import { toast } from "sonner";

import { OutputType } from "@/lib/fileUtils";
import { generateFFMPEGCommand } from "@/lib/strategy";
import { convertFilesToInputFileType } from "@/lib/fileUtils";
import ffm_ins from "@/lib/ffmpeg";

interface CropAreaProps {
	file: File;
	onCropComplete: (outputFile: OutputType) => void;
	isProcessing: boolean;
}

interface CropAreaType {
	x: number;
	y: number;
	width: number;
	height: number;
}

interface ImageInfo {
	naturalWidth: number;
	naturalHeight: number;
	displayWidth: number;
	displayHeight: number;
	scaleX: number;
	scaleY: number;
}

export default function CropArea({
	file,
	onCropComplete,
	isProcessing,
}: CropAreaProps) {
	const t = useTranslations();
	const imageRef = useRef<HTMLImageElement>(null);
	const [imageUrl, setImageUrl] = useState<string>("");
	const [imageInfo, setImageInfo] = useState<ImageInfo>({
		naturalWidth: 0,
		naturalHeight: 0,
		displayWidth: 0,
		displayHeight: 0,
		scaleX: 1,
		scaleY: 1,
	});
	const [cropArea, setCropArea] = useState<CropAreaType>({
		x: 0,
		y: 0,
		width: 0,
		height: 0,
	});
	const [isResizing, setIsResizing] = useState(false);
	const [resizeHandle, setResizeHandle] = useState<
		null | "tl" | "tr" | "bl" | "br"
	>(null);
	const [resizeStart, setResizeStart] = useState({
		x: 0,
		y: 0,
		crop: { x: 0, y: 0, width: 0, height: 0 },
	});
	const [isBoxDragging, setIsBoxDragging] = useState(false);
	const [boxDragStart, setBoxDragStart] = useState({
		x: 0,
		y: 0,
		crop: { x: 0, y: 0 },
	});

	// 加载图片
	useEffect(() => {
		if (file) {
			const url = URL.createObjectURL(file);
			setImageUrl(url);
			return () => URL.revokeObjectURL(url);
		}
	}, [file]);

	// 计算图片显示尺寸和缩放比例
	const calculateImageInfo = useCallback(() => {
		if (!imageRef.current) return;

		const { naturalWidth, naturalHeight } = imageRef.current;
		const containerWidth = 600;
		const containerHeight = 400;

		const scale = Math.min(
			containerWidth / naturalWidth,
			containerHeight / naturalHeight,
		);
		const displayWidth = naturalWidth * scale;
		const displayHeight = naturalHeight * scale;

		setImageInfo({
			naturalWidth,
			naturalHeight,
			displayWidth,
			displayHeight,
			scaleX: naturalWidth / displayWidth,
			scaleY: naturalHeight / displayHeight,
		});
	}, []);

	// 图片加载完成后初始化裁剪区域
	const handleImageLoad = useCallback(() => {
		if (imageRef.current) {
			calculateImageInfo();
		}
	}, [calculateImageInfo]);

	// 初始化裁剪区域
	useEffect(() => {
		if (imageInfo.displayWidth > 0 && imageInfo.displayHeight > 0) {
			// 初始化裁剪区域为图片中心的一个矩形
			const cropSize =
				Math.min(imageInfo.displayWidth, imageInfo.displayHeight) * 0.6;
			setCropArea({
				x: (imageInfo.displayWidth - cropSize) / 2,
				y: (imageInfo.displayHeight - cropSize) / 2,
				width: cropSize,
				height: cropSize,
			});
		}
	}, [imageInfo.displayWidth, imageInfo.displayHeight]);

	// 鼠标按下裁剪框手柄
	const handleResizeMouseDown = useCallback(
		(handle: "tl" | "tr" | "bl" | "br", e: React.MouseEvent) => {
			e.stopPropagation();
			const rect = (e.target as HTMLElement)
				.closest(".relative")
				?.getBoundingClientRect();
			if (!rect) return;
			setIsResizing(true);
			setResizeHandle(handle);
			setResizeStart({
				x: e.clientX,
				y: e.clientY,
				crop: { ...cropArea },
			});
		},
		[cropArea],
	);

	// 鼠标移动时缩放
	const handleResizeMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (!isResizing || !resizeHandle) return;
			const dx = e.clientX - resizeStart.x;
			const dy = e.clientY - resizeStart.y;
			let { x, y, width, height } = resizeStart.crop;

			if (resizeHandle === "tl") {
				x += dx;
				width -= dx;
				y += dy;
				height -= dy;
			}
			if (resizeHandle === "tr") {
				width += dx;
				y += dy;
				height -= dy;
			}
			if (resizeHandle === "bl") {
				x += dx;
				width -= dx;
				height += dy;
			}
			if (resizeHandle === "br") {
				width += dx;
				height += dy;
			}

			// 限制最小尺寸
			width = Math.max(32, width);
			height = Math.max(32, height);

			// 限制在图片区域内
			if (x < 0) {
				width += x;
				x = 0;
			}
			if (y < 0) {
				height += y;
				y = 0;
			}
			if (x + width > imageInfo.displayWidth) {
				width = imageInfo.displayWidth - x;
			}
			if (y + height > imageInfo.displayHeight) {
				height = imageInfo.displayHeight - y;
			}

			// 确保最小尺寸
			if (width < 32) width = 32;
			if (height < 32) height = 32;

			setCropArea({ x, y, width, height });
		},
		[
			isResizing,
			resizeHandle,
			resizeStart,
			imageInfo.displayWidth,
			imageInfo.displayHeight,
		],
	);

	// 鼠标松开
	const handleResizeMouseUp = useCallback(() => {
		setIsResizing(false);
		setResizeHandle(null);
	}, []);

	// 鼠标按下裁剪框（不在手柄上）
	const handleBoxMouseDown = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			e.preventDefault();
			if (isProcessing || isResizing) return;

			// 检查是否在裁剪框内部（不包括手柄）
			const target = e.target as HTMLElement;
			if (target.classList.contains("resize-handle")) return;

			setIsBoxDragging(true);
			setBoxDragStart({
				x: e.clientX,
				y: e.clientY,
				crop: { x: cropArea.x, y: cropArea.y },
			});
		},
		[cropArea, isProcessing, isResizing],
	);

	// 鼠标移动拖动裁剪框
	const handleBoxMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (!isBoxDragging) return;
			e.preventDefault();

			const dx = e.clientX - boxDragStart.x;
			const dy = e.clientY - boxDragStart.y;
			let newX = boxDragStart.crop.x + dx;
			let newY = boxDragStart.crop.y + dy;

			// 限制在图片区域内
			newX = Math.max(
				0,
				Math.min(newX, imageInfo.displayWidth - cropArea.width),
			);
			newY = Math.max(
				0,
				Math.min(newY, imageInfo.displayHeight - cropArea.height),
			);

			setCropArea((prev) => ({ ...prev, x: newX, y: newY }));
		},
		[
			isBoxDragging,
			boxDragStart,
			cropArea.width,
			cropArea.height,
			imageInfo.displayWidth,
			imageInfo.displayHeight,
		],
	);

	// 鼠标松开
	const handleBoxMouseUp = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		setIsBoxDragging(false);
	}, []);

	// 执行裁剪
	const handleCrop = useCallback(async () => {
		if (!imageRef.current || imageInfo.naturalWidth === 0) return;

		// 使用图片信息中的缩放比例计算实际裁剪参数
		const sourceX = cropArea.x * imageInfo.scaleX;
		const sourceY = cropArea.y * imageInfo.scaleY;
		const sourceWidth = cropArea.width * imageInfo.scaleX;
		const sourceHeight = cropArea.height * imageInfo.scaleY;

		try {
			// 转换文件为InputFileType
			const inputFiles = await convertFilesToInputFileType([file]);
			const inputFile = inputFiles[0];

			const cropOptions = {
				x: Math.round(sourceX),
				y: Math.round(sourceY),
				width: Math.round(sourceWidth),
				height: Math.round(sourceHeight),
				outputSuffixName: "cropped",
			};

			// 生成FFmpeg命令
			generateFFMPEGCommand("crop", inputFile, cropOptions);

			// 使用FFmpeg处理文件
			const results = await ffm_ins.processMultiDataToMultiData(
				inputFiles,
				(current, total) => {
					// 可以在这里更新进度
					console.log(`Processing: ${current}/${total}`);
				},
			);

			// 处理结果
			const successResults = results.filter(
				(result) => result.status === "success",
			);
			if (successResults.length > 0) {
				// 调用父组件的回调，传递OutputType
				onCropComplete(successResults[0]);
			} else {
				toast.error("裁剪失败，请重试");
			}
		} catch (error) {
			console.error("Failed to process crop:", error);
			toast.error("裁剪失败，请重试");
		}
	}, [cropArea, file, onCropComplete, imageInfo]);

	// 重置裁剪区域
	const handleReset = useCallback(() => {
		if (imageRef.current) {
			calculateImageInfo();
		}
	}, [calculateImageInfo]);

	return (
		<div className="space-y-4">
			{/* 裁剪预览区域 */}
			<div className="relative border rounded-lg overflow-hidden bg-muted/20">
				{imageUrl &&
					imageInfo.displayWidth > 0 &&
					imageInfo.displayHeight > 0 && (
						<div
							className="relative border-2 border-background"
							style={{
								width: imageInfo.displayWidth,
								height: imageInfo.displayHeight,
								margin: "0 auto",
							}}
							onMouseMove={
								isResizing
									? handleResizeMouseMove
									: isBoxDragging
										? handleBoxMouseMove
										: undefined
							}
							onMouseUp={
								isResizing
									? handleResizeMouseUp
									: isBoxDragging
										? handleBoxMouseUp
										: undefined
							}
							onMouseLeave={
								isResizing
									? handleResizeMouseUp
									: isBoxDragging
										? handleBoxMouseUp
										: undefined
							}
						>
							<img
								src={imageUrl}
								alt="Preview"
								className="w-full h-full object-contain pointer-events-none select-none"
								onLoad={handleImageLoad}
								draggable={false}
							/>
							{/* 裁剪框 */}
							<div
								className="absolute border-2 border-primary bg-primary/10 cursor-move"
								style={{
									left: cropArea.x,
									top: cropArea.y,
									width: cropArea.width,
									height: cropArea.height,
									pointerEvents: isResizing ? "none" : "auto",
								}}
								onMouseDown={handleBoxMouseDown}
							>
								{/* 四角手柄 */}
								<div
									className="absolute -top-1 -left-1 w-3 h-3 bg-primary border border-white rounded-full cursor-nwse-resize z-10 resize-handle"
									onMouseDown={(e) => handleResizeMouseDown("tl", e)}
								/>
								<div
									className="absolute -top-1 -right-1 w-3 h-3 bg-primary border border-white rounded-full cursor-nesw-resize z-10 resize-handle"
									onMouseDown={(e) => handleResizeMouseDown("tr", e)}
								/>
								<div
									className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary border border-white rounded-full cursor-nesw-resize z-10 resize-handle"
									onMouseDown={(e) => handleResizeMouseDown("bl", e)}
								/>
								<div
									className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border border-white rounded-full cursor-nwse-resize z-10 resize-handle"
									onMouseDown={(e) => handleResizeMouseDown("br", e)}
								/>
							</div>
						</div>
					)}
				{/* 隐藏的图片元素用于获取原始尺寸 */}
				{imageUrl && (
					<img
						ref={imageRef}
						src={imageUrl}
						alt="Preview"
						className="hidden"
						onLoad={handleImageLoad}
					/>
				)}
			</div>

			{/* 操作按钮 */}
			<div className="flex gap-2">
				<Button
					onClick={handleCrop}
					disabled={isProcessing || !imageUrl}
					className="flex-1"
				>
					<Crop className="w-4 h-4 mr-2" />
					{t("crop_image")}
				</Button>
				<Button onClick={handleReset} variant="outline" disabled={isProcessing}>
					<RotateCw className="w-4 h-4" />
				</Button>
			</div>

			{/* 裁剪信息 */}
			{imageUrl && imageInfo.naturalWidth > 0 && (
				<div className="text-sm text-muted-foreground">
					{t("crop_info", {
						width: Math.round(cropArea.width * imageInfo.scaleX),
						height: Math.round(cropArea.height * imageInfo.scaleY),
					})}
				</div>
			)}
		</div>
	);
}

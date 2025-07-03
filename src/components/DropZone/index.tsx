import { ImageIcon, Plus, Trash2, UploadIcon } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Label } from "@/components/shadcn/label";
import { toast } from "sonner";

interface DropzoneWithPreviewProps {
	onFilesSelected: (files: File[]) => void;
	files: File[];
	onRemoveFile: (index: number) => void;
	onClearAllFiles: () => void;
	// 新增：要禁用的文件格式数组
	disableFormats?: string[];
}

const Dropzone = React.memo(function DropzoneWithPreview({
	onFilesSelected,
	files,
	onRemoveFile,
	onClearAllFiles,
	disableFormats = [],
}: DropzoneWithPreviewProps) {
	const t = useTranslations();
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const dragCounterRef = useRef(0);

	// 检查文件是否为禁用格式
	const isDisabledFormat = useCallback(
		(file: File): boolean => {
			const format = file.name.split(".").pop()?.toLowerCase() || "";
			return disableFormats.includes(format);
		},
		[disableFormats],
	);

	// 过滤文件，移除禁用格式
	const filterFiles = useCallback(
		(files: File[]): File[] => {
			if (disableFormats.length === 0) {
				return files;
			}

			const validFiles: File[] = [];
			const rejectedFiles: File[] = [];

			for (const file of files) {
				const isDisabled = isDisabledFormat(file);
				if (isDisabled) {
					rejectedFiles.push(file);
				} else {
					validFiles.push(file);
				}
			}

			// 显示被拒绝的文件提示
			if (rejectedFiles.length > 0) {
				const fileNames = rejectedFiles.map((f) => f.name).join(", ");
				toast.error(t("unsupported_animation_format_toast", { fileNames }));
			}

			return validFiles;
		},
		[disableFormats, isDisabledFormat],
	);

	// 使用useMemo缓存文件URL，避免每次渲染时重新创建
	const fileUrls = useMemo(() => {
		return files.map((file) => ({
			file,
			url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
		}));
	}, [files]);

	// 清理blob URLs以避免内存泄漏
	useEffect(() => {
		return () => {
			for (const { url } of fileUrls) {
				if (url) {
					URL.revokeObjectURL(url);
				}
			}
		};
	}, [fileUrls]);

	// 处理点击上传
	const handleClickUpload = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	// 优化的拖拽事件处理函数
	const handleContainerDragEvents = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (e.type === "dragenter") {
				dragCounterRef.current++;
				if (dragCounterRef.current === 1) {
					setIsDragging(true);
				}
				if (e.dataTransfer) {
					e.dataTransfer.dropEffect = "copy";
				}
			} else if (e.type === "dragover") {
				if (e.dataTransfer) {
					e.dataTransfer.dropEffect = "copy";
				}
			} else if (e.type === "dragleave") {
				dragCounterRef.current--;
				if (dragCounterRef.current === 0) {
					setIsDragging(false);
				}
			} else if (e.type === "drop") {
				dragCounterRef.current = 0;
				setIsDragging(false);

				// 处理拖拽文件
				if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
					const allFiles = Array.from(e.dataTransfer.files);
					const imageFiles = allFiles.filter(
						(file) =>
							file.type.startsWith("image/") ||
							/\.(jpg|jpeg|png|gif|webp|avif|bmp|tiff)$/i.test(file.name),
					);

					if (imageFiles.length > 0) {
						const filteredFiles = filterFiles(imageFiles);
						if (filteredFiles.length > 0) {
							onFilesSelected(filteredFiles);
						}
					}
				}
			}
		},
		[onFilesSelected, filterFiles],
	);

	// 拖拽区域的渲染函数 - 移除了拖拽相关事件，因为现在在容器级别处理
	const renderDropzone = useCallback(() => {
		return (
			<button
				type="button"
				className={`flex flex-col items-center justify-center border-2 border-dashed ${isDragging ? "border-primary bg-primary/10" : "border-border"} rounded-lg p-6 cursor-pointer hover:border-primary transition-colors min-h-[250px] w-full`}
				onClick={handleClickUpload}
			>
				<div className="w-full h-full flex flex-col items-center justify-center">
					<UploadIcon className="h-12 w-12 text-muted-foreground" />
					<p className="mt-2 text-sm text-muted-foreground">
						{t("drag_drop_or_click")}
					</p>
					{disableFormats.length > 0 && (
						<p className="mt-1 text-xs text-muted-foreground">
							{t("unsupported_animation_format")}
						</p>
					)}
					{files.length > 0 && (
						<p className="mt-2 text-sm text-primary">
							{files.length}{" "}
							{files.length === 1 ? t("file_selected") : t("files_selected")}
						</p>
					)}
				</div>
			</button>
		);
	}, [isDragging, handleClickUpload, t, files.length, disableFormats]);

	// 图片预览功能已直接写在主渲染函数中

	return (
		<div
			// 为整个容器添加拖拽事件处理，无论是否有文件都可以拖拽上传
			onDragOver={handleContainerDragEvents}
			onDragEnter={handleContainerDragEvents}
			onDragLeave={handleContainerDragEvents}
			onDrop={handleContainerDragEvents}
			className={`${isDragging ? "border-2 border-dashed border-primary bg-primary/5 rounded-lg" : ""} relative`}
		>
			{/* 固定在顶部的控制按钮 */}
			{files.length > 0 && (
				<div className="sticky top-0 z-10 flex justify-between items-center bg-background/95 backdrop-blur-sm p-3 border-b rounded-t-md shadow-sm">
					<Label className="text-base font-medium">
						{t("uploaded_files")} ({files.length})
					</Label>
					<div className="flex space-x-2">
						<button
							type="button"
							onClick={handleClickUpload}
							className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium border border-border rounded-md bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
						>
							<Plus className="w-4 h-4" />
							{t("add_more")}
						</button>
						<button
							type="button"
							onClick={onClearAllFiles}
							className="inline-flex items-center px-3 py-1.5 text-sm font-medium border border-destructive rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
						>
							{t("clear_all")}
						</button>
					</div>
				</div>
			)}

			{/* 文件拖拽区域和预览区域 */}
			{files.length === 0 ? (
				renderDropzone()
			) : (
				<div className="border border-border rounded-md mt-0 flex flex-col min-h-[250px] relative">
					{/* 拖拽提示 - 半透明覆盖在预览区域上 */}
					<div
						className={`absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-[1px] pointer-events-none transition-opacity duration-200 z-20 ${isDragging ? "opacity-100" : "opacity-0"}`}
					>
						<div className="bg-background/90 p-4 rounded-lg shadow-lg text-center">
							<UploadIcon className="h-12 w-12 mx-auto text-primary" />
							<p className="mt-2 font-medium">{t("drag_drop_or_click")}</p>
						</div>
					</div>

					{/* 静态拖拽提示区域 - 不拖拽时也显示 - 始终保持在顶部 */}
					<div className="p-3 text-center text-sm text-muted-foreground border-b border-border bg-background/50 sticky top-0 z-10">
						<p>✨ {t("drag_drop_or_click")} ✨</p>
					</div>

					{/* 可滚动的图片列表区域 */}
					<div className="overflow-y-auto max-h-[250px]">
						<div className="flex flex-wrap gap-3 p-3 min-h-[220px]">
							{fileUrls.map((fileData, index) => {
								const { file, url: filePreview } = fileData;

								return (
									<div key={`${file.name}-${index}`} className="relative group">
										<div className="h-[100px] w-[100px] rounded-md overflow-hidden border border-border bg-muted flex items-center justify-center">
											{filePreview ? (
												<Image
													src={filePreview}
													alt={file.name}
													width={100}
													height={100}
													className="object-cover w-full h-full"
													unoptimized // 由于是blob URL，需要禁用优化
												/>
											) : (
												<ImageIcon className="h-12 w-12 text-muted-foreground" />
											)}
										</div>
										<button
											type="button"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												onRemoveFile(index);
											}}
											className="absolute -top-2 -right-2 bg-background text-destructive rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity p-1 z-10"
										>
											<Trash2 className="w-4 h-4" />
										</button>
										<div className="text-xs truncate mt-1" title={file.name}>
											{file.name.length > 12
												? `${file.name.substring(0, 9)}...`
												: file.name}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			)}

			{/* 隐藏的文件输入框 */}
			<input
				ref={fileInputRef}
				type="file"
				multiple
				accept={"image/*"}
				className="hidden"
				onChange={(e) => {
					// 只有当有文件被选择时才更新状态
					if (e.target.files && e.target.files.length > 0) {
						const newFiles = Array.from(e.target.files);
						const filteredFiles = filterFiles(newFiles);
						if (filteredFiles.length > 0) {
							onFilesSelected(filteredFiles);
						}

						// 清空input的value，确保可以再次上传相同的文件
						e.target.value = "";
					}
				}}
			/>
		</div>
	);
});

export default Dropzone;

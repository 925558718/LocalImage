import { UploadIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

interface DropZoneProps {
	onFilesSelected: (files: File[]) => void;
	filesCount: number;
}

export function DropZone({ onFilesSelected, filesCount }: DropZoneProps) {
	const t = useTranslations();
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// 处理点击上传
	const handleClickUpload = () => {
		fileInputRef.current?.click();
	};

	return (
		<button
			type="button"
			className={`flex flex-col items-center justify-center border-2 border-dashed ${isDragging ? "border-primary bg-primary/10" : "border-gray-300"} rounded-lg p-6 cursor-pointer hover:border-primary transition-colors min-h-[250px] w-full`}
			onDragOver={(e) => {
				e.preventDefault();
				e.stopPropagation();
				setIsDragging(true);
			}}
			onDragEnter={(e) => {
				e.preventDefault();
				e.stopPropagation();
				setIsDragging(true);
			}}
			onDragLeave={(e) => {
				e.preventDefault();
				e.stopPropagation();
				setIsDragging(false);
			}}
			onDrop={(e) => {
				e.preventDefault();
				e.stopPropagation();
				setIsDragging(false);

				// Handle dropped files
				if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
					// Filter for image files only
					const imageFiles = Array.from(e.dataTransfer.files).filter((file) =>
						file.type.startsWith("image/"),
					);
					// 传递新文件给父组件
					onFilesSelected(imageFiles);
				}
			}}
			onClick={handleClickUpload}
		>
			<input
				ref={fileInputRef}
				type="file"
				multiple
				accept="image/*"
				className="hidden"
				onChange={(e) => {
					// 只有当有文件被选择时才更新状态，防止取消上传对话框清除已有文件
					if (e.target.files && e.target.files.length > 0) {
						// 传递新文件给父组件
						const newFiles = Array.from(e.target.files);
						onFilesSelected(newFiles);
					}
				}}
			/>

			<div className="w-full h-full flex flex-col items-center justify-center">
				<UploadIcon className="h-12 w-12 text-gray-400" />
				<p className="mt-2 text-sm text-gray-600">{t("drag_drop_or_click")}</p>
				{filesCount > 0 && (
					<p className="mt-2 text-sm text-primary">
						{filesCount}{" "}
						{filesCount === 1 ? t("file_selected") : t("files_selected")}
					</p>
				)}
			</div>
		</button>
	);
}

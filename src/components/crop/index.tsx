"use client";

import { useTranslations } from "next-intl";
import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Button } from "@/components/shadcn/button";
import { toast } from "sonner";
import { Download, Upload, X } from "lucide-react";
import CropArea from "./components/CropArea";
import DropZone from "@/components/DropZone";
import PageTitle from "@/components/PageTitle";
import ResultArea from "./components/ResultArea";
import { OutputType } from "@/lib/fileUtils";

export default function CropComposer() {
	const t = useTranslations();
	const [files, setFiles] = useState<File[]>([]);
	const [croppedFiles, setCroppedFiles] = useState<OutputType[]>([]);
	const [isProcessing, setIsProcessing] = useState(false);

	const handleFilesAdded = useCallback((newFiles: File[]) => {
		setFiles(prev => [...prev, ...newFiles]);
		setCroppedFiles([]);
	}, []);

	const handleFilesRemoved = useCallback((indexes: number[]) => {
		setFiles(prev => prev.filter((_, index) => !indexes.includes(index)));
		setCroppedFiles([]);
	}, []);

	const handleCropComplete = useCallback((outputFile: OutputType) => {
		setCroppedFiles(prev => [...prev, outputFile]);
		toast.success(t("crop_complete"));
	}, [t]);



	const handleDownloadAll = useCallback(() => {
		if (croppedFiles.length === 0) {
			toast.error(t("no_valid_files_download"));
			return;
		}

		croppedFiles.forEach((outputFile, index) => {
			const link = document.createElement("a");
			link.href = outputFile.url;
			link.download = outputFile.name;
			link.click();
		});

		toast.success(t("batch_download_completed"));
	}, [croppedFiles, t]);

	const handleCancelCrop = useCallback(() => {
		setFiles([]);
		setCroppedFiles([]);
	}, []);

	return (
		<div className="w-full max-w-7xl mx-auto space-y-6">
			{/* 页面标题 */}
			<PageTitle
				title={t("crop_composer")}
				description={t("crop_composer_subtitle")}
				features={[
					{ text: t("local_processing"), color: "green" },
					{ text: t("privacy_protection"), color: "blue" },
					{ text: t("free_to_use"), color: "purple" },
				]}
			/>

			{/* 主要内容区域 */}
			{files.length === 0 ? (
				/* 文件上传区域 - 只在没有文件时显示 */
				<Card className="h-full">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Upload className="w-5 h-5" />
							{t("uploaded_files")}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<DropZone
							files={files}
							onFilesSelected={handleFilesAdded}
							onRemoveFile={(index) => handleFilesRemoved([index])}
							onClearAllFiles={() => handleFilesRemoved(files.map((_, index) => index))}
						/>
					</CardContent>
				</Card>
			) : (
				/* 裁剪预览和操作区域 - 有文件时显示 */
				<div className="space-y-6">
					{/* 裁剪预览区域 */}
					<Card className="h-full">
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle>{t("crop_preview")}</CardTitle>
								<CardDescription>{t("crop_preview_desc")}</CardDescription>
							</div>
							<Button
								onClick={handleCancelCrop}
								variant="outline"
								size="sm"
								className="flex items-center gap-2"
							>
								<X className="w-4 h-4" />
								{t("clear_files")}
							</Button>
						</CardHeader>
						<CardContent>
							<CropArea
								file={files[0]}
								onCropComplete={handleCropComplete}
								isProcessing={isProcessing}
							/>
						</CardContent>
					</Card>
				</div>
			)}

			{/* 裁剪结果展示区域 */}
			{croppedFiles.length > 0 && (
				<Card className="h-full">
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<Download className="w-5 h-5" />
								{t("crop_results")}
							</CardTitle>
							<CardDescription>{t("crop_results_desc")}</CardDescription>
						</div>
						<Button
							onClick={handleDownloadAll}
							className="flex items-center gap-2"
						>
							<Download className="w-4 h-4" />
							{t("download_all")}
						</Button>
					</CardHeader>
					<CardContent>
						<ResultArea files={croppedFiles} />
					</CardContent>
				</Card>
			)}


		</div>
	);
} 
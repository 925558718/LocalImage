"use client";

import { Download, FileImage } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { Button } from "@/components/shadcn/button";
import { OutputType } from "@/lib/fileUtils";

interface ResultAreaProps {
	files: OutputType[];
}

export default function ResultArea({ files }: ResultAreaProps) {
	const t = useTranslations();

	const handleDownload = useCallback((outputFile: OutputType) => {
		const link = document.createElement("a");
		link.href = outputFile.url;
		link.download = outputFile.name;
		link.click();
	}, []);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium">
					{files.length}{" "}
					{files.length === 1 ? t("file_selected") : t("files_selected")}
				</span>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{files.map((outputFile, index) => (
					<div
						key={`${outputFile.name}-${index}`}
						className="border rounded-lg p-4 space-y-3"
					>
						{/* 图片预览 */}
						<div className="aspect-square bg-muted/20 rounded-md overflow-hidden">
							<img
								src={outputFile.url}
								alt={outputFile.name}
								className="w-full h-full object-cover"
							/>
						</div>

						{/* 文件信息 */}
						<div className="space-y-1">
							<div className="flex items-center space-x-2">
								<FileImage className="w-4 h-4 text-muted-foreground" />
								<span className="text-sm font-medium truncate">
									{outputFile.name}
								</span>
							</div>
							<span className="text-xs text-muted-foreground">
								{(outputFile.size / 1024 / 1024).toFixed(2)} MB
							</span>
						</div>

						{/* 下载按钮 */}
						<Button
							onClick={() => handleDownload(outputFile)}
							variant="outline"
							size="sm"
							className="w-full"
						>
							<Download className="w-4 h-4 mr-2" />
							{t("download")}
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}

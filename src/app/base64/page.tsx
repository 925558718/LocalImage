"use client";

import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button, Input, Label } from "@/components/shadcn";
import { Upload, Download, Copy, Check } from "lucide-react";

function Base64Page() {
	const { t } = useI18n();
	const [mode, setMode] = useState<"toBase64" | "fromBase64">("toBase64");
	const [base64String, setBase64String] = useState("");
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [fileName, setFileName] = useState("");
	const [copied, setCopied] = useState(false);

	// 图片转Base64
	const handleImageToBase64 = (file: File) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const result = e.target?.result as string;
			setBase64String(result);
			setImagePreview(result);
			setFileName(file.name);
		};
		reader.readAsDataURL(file);
	};

	// Base64转图片
	const handleBase64ToImage = (base64: string) => {
		try {
			// 验证Base64格式
			if (!base64.startsWith("data:image/")) {
				// 如果没有data URL前缀，尝试添加
				const cleanBase64 = base64.replace(/\s/g, "");
				const withPrefix = `data:image/png;base64,${cleanBase64}`;
				setImagePreview(withPrefix);
			} else {
				setImagePreview(base64);
			}
		} catch (error) {
			console.error("Invalid Base64 string:", error);
			setImagePreview(null);
		}
	};

	// 复制Base64到剪贴板
	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(base64String);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy:", error);
		}
	};

	// 下载图片
	const downloadImage = () => {
		if (!imagePreview) return;
		
		const link = document.createElement("a");
		link.href = imagePreview;
		link.download = fileName || "converted-image.png";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// 清空所有内容
	const clearAll = () => {
		setBase64String("");
		setImagePreview(null);
		setFileName("");
		setCopied(false);
	};

	return (
		<main className="w-full h-full flex flex-col items-center min-h-[calc(100vh-4rem)] pb-[56px] pt-8">
			<div className="min-h-[20vh] flex items-center justify-center flex-col">
				<div className="text-[40px] uppercase">{t("base64_converter")}</div>
				<div className="font-OS text-[12px] opacity-60 text-center">
					{t("base64_desc")}
				</div>
			</div>

			<div className="w-full max-w-4xl mx-auto px-4 space-y-6">
				{/* 模式切换 */}
				<div className="flex justify-center space-x-2">
					<Button
						variant={mode === "toBase64" ? "default" : "outline"}
						onClick={() => {
							setMode("toBase64");
							clearAll();
						}}
					>
						{t("image_to_base64")}
					</Button>
					<Button
						variant={mode === "fromBase64" ? "default" : "outline"}
						onClick={() => {
							setMode("fromBase64");
							clearAll();
						}}
					>
						{t("base64_to_image")}
					</Button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* 左侧：输入区域 */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">
							{mode === "toBase64" ? t("upload_image") : t("input_base64")}
						</h3>

						{mode === "toBase64" ? (
							// 图片上传区域
							<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
								<input
									type="file"
									accept="image/*"
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (file) handleImageToBase64(file);
									}}
									className="hidden"
									id="image-upload"
								/>
								<label htmlFor="image-upload" className="cursor-pointer">
									<Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
									<p className="text-sm text-gray-600">
										{t("click_select_image")}
									</p>
									<p className="text-xs text-gray-500 mt-2">
										{t("supported_formats")}
									</p>
								</label>
							</div>
						) : (
							// Base64输入区域
							<div className="space-y-2">
								<Label htmlFor="base64-input">{t("base64_string")}</Label>
								<textarea
									id="base64-input"
									className="w-full h-40 p-3 border rounded-md resize-none font-mono text-sm"
									placeholder={t("paste_base64_here")}
									value={base64String}
									onChange={(e) => {
										setBase64String(e.target.value);
										if (e.target.value.trim()) {
											handleBase64ToImage(e.target.value.trim());
										} else {
											setImagePreview(null);
										}
									}}
								/>
								<Button
									onClick={() => handleBase64ToImage(base64String)}
									disabled={!base64String.trim()}
									className="w-full"
								>
									{t("convert_to_image")}
								</Button>
							</div>
						)}
					</div>

					{/* 右侧：输出区域 */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">
							{mode === "toBase64" ? t("base64_result") : t("image_preview")}
						</h3>

						{mode === "toBase64" ? (
							// Base64输出区域
							<div className="space-y-2">
								{base64String ? (
									<>
										<div className="flex justify-between items-center">
											<Label>{t("base64_string")}</Label>
											<Button
												variant="outline"
												size="sm"
												onClick={copyToClipboard}
												className="flex items-center space-x-1"
											>
												{copied ? (
													<Check className="h-4 w-4" />
												) : (
													<Copy className="h-4 w-4" />
												)}
												<span>{copied ? t("copied") : t("copy")}</span>
											</Button>
										</div>
										<textarea
											className="w-full h-40 p-3 border rounded-md resize-none font-mono text-sm"
											value={base64String}
											readOnly
										/>
										<div className="text-sm text-gray-500">
											{t("character_length")}: {base64String.length.toLocaleString()}
										</div>
									</>
								) : (
									<div className="h-40 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500">
										{t("base64_result_placeholder")}
									</div>
								)}
							</div>
						) : (
							// 图片预览区域
							<div className="space-y-2">
								{imagePreview ? (
									<>
										<div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
											<img
												src={imagePreview}
												alt="Preview"
												className="max-w-full max-h-64 mx-auto object-contain"
											/>
										</div>
										<Button
											onClick={downloadImage}
											className="w-full flex items-center space-x-2"
										>
											<Download className="h-4 w-4" />
											<span>{t("download_image")}</span>
										</Button>
									</>
								) : (
									<div className="h-40 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500">
										{t("image_preview_placeholder")}
									</div>
								)}
							</div>
						)}
					</div>
				</div>

				{/* 操作按钮 */}
				<div className="flex justify-center space-x-2">
					<Button variant="outline" onClick={clearAll}>
						{t("clear_all")}
					</Button>
				</div>

				{/* 使用说明 */}
				<div className="bg-muted/50 p-4 rounded-lg">
					<h4 className="font-medium mb-2">{t("usage_instructions")}</h4>
					<ul className="text-sm text-muted-foreground space-y-1">
						<li>• <strong>{t("image_to_base64")}：</strong> {t("usage_image_to_base64")}</li>
						<li>• <strong>{t("base64_to_image")}：</strong> {t("usage_base64_to_image")}</li>
						<li>• {t("usage_local_processing")}</li>
						<li>• {t("usage_supported_formats")}</li>
					</ul>
				</div>
			</div>
		</main>
	);
}

export default Base64Page; 
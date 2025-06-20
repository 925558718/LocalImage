import { View } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface PreviewAreaProps {
	files: File[];
	currentFrame: number;
	getSortedFiles: (files: File[]) => File[];
}

export default function PreviewArea({
	files,
	currentFrame,
	getSortedFiles,
}: PreviewAreaProps) {
	const t = useTranslations();

	if (files.length === 0) {
		return (
			<div className="bg-muted/50 rounded-xl border-2 border-dashed border-border p-12 flex flex-col items-center justify-center text-center h-full">
				<div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-6">
					<View className="w-10 h-10 text-muted-foreground" />
				</div>
				<h3 className="text-xl font-semibold text-muted-foreground mb-3">
					{t("animation_preview")}
				</h3>
				<p className="text-muted-foreground max-w-xs">
					{t("preview_instruction")}
				</p>
			</div>
		);
	}

	return (
		<div className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col h-full">
			<div className="flex items-center gap-3 mb-6">
				<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
					<View className="w-5 h-5 text-primary-foreground" />
				</div>
				<div>
					<h3 className="text-lg font-semibold text-foreground">
						{t("animation_preview")}
					</h3>
					<p className="text-sm text-muted-foreground">
						{t("realtime_preview_desc")}
					</p>
				</div>
			</div>

			<div className="flex-1 flex items-center justify-center">
				{(() => {
					const sortedFiles = getSortedFiles(files);
					const currentFile = sortedFiles[currentFrame];
					return (
						currentFile && (
							<div className="space-y-4 w-full max-w-md">
								<div className="bg-gradient-to-br from-muted/50 to-muted rounded-xl p-4 border border-border">
									<Image
										src={URL.createObjectURL(currentFile)}
										alt={`Frame ${currentFrame + 1}`}
										width={0}
										height={0}
										className="w-auto h-auto max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
										style={{
											maxWidth: "100%",
											maxHeight: "12rem",
										}}
										unoptimized // 由于是blob URL，需要禁用优化
										sizes="100vw"
									/>
								</div>
								<div className="text-center space-y-2">
									<div className="text-sm text-muted-foreground bg-muted rounded-lg px-3 py-1 inline-block">
										{currentFile.name}
									</div>
								</div>
							</div>
						)
					);
				})()}
			</div>
		</div>
	);
}

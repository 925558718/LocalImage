import { CheckCircle, Download, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/shadcn";

interface AnimationResult {
	url: string;
	name: string;
	size: number;
	format: string;
}

interface ResultAreaProps {
	result: AnimationResult | null;
	onDownload: () => void;
	onClear: () => void;
}

export default function ResultArea({
	result,
	onDownload,
	onClear,
}: ResultAreaProps) {
	const t = useTranslations();

	// 格式化文件大小
	const formatFileSize = (bytes: number): string => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};

	if (!result) return null;

	return (
		<div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 shadow-sm p-6 flex flex-col h-full">
			<div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
				<CheckCircle className="w-8 h-8 text-primary-foreground" />
			</div>

			<h3 className="text-xl font-bold text-primary mb-2">
				{t("animation_result")}
			</h3>

			<div className="text-primary/80 space-y-1">
				<p className="text-sm">
					<span className="font-medium">{t("format")}:</span>{" "}
					{result.format.toUpperCase()}
				</p>
				<p className="text-sm">
					<span className="font-medium">{t("image_size")}:</span>{" "}
					{formatFileSize(result.size)}
				</p>
				<p className="text-sm">
					<span className="font-medium">{result.name}</span>
				</p>
			</div>

			<div className="bg-card rounded-xl p-4 shadow-sm border border-primary/20 mt-4 flex-1 flex items-center justify-center">
				{["gif", "webp"].includes(result.format.toLowerCase()) ? (
					<Image
						src={result.url}
						alt={result.name}
						width={400}
						height={256}
						className="max-w-full h-64 object-contain rounded-lg"
						unoptimized
					/>
				) : (
					<video
						src={result.url}
						controls
						className="max-w-full h-64 object-contain rounded-lg"
						autoPlay
						muted
						loop
					/>
				)}
			</div>

			<div className="flex gap-3 mt-6">
				<Button
					onClick={onDownload}
					className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg"
				>
					<Download className="w-4 h-4 mr-2" />
					{t("download")}
				</Button>
				<Button
					variant="outline"
					onClick={onClear}
					className="bg-card border-primary/30"
				>
					<X className="w-4 h-4 mr-2" />
					{t("clear_result")}
				</Button>
			</div>
		</div>
	);
}

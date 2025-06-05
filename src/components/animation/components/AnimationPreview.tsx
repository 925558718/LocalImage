import { useTranslations } from 'next-intl';
import Image from "next/image";

interface AnimationPreviewProps {
	url: string;
	format: string;
	size: number;
	frameCount: number;
	frameRate: number;
}

function AnimationPreview({ url, format, size, frameCount, frameRate }: AnimationPreviewProps) {
	const t = useTranslations();

	return (
		<div className="flex flex-col items-center space-y-4 p-4 border rounded-lg bg-muted/20">
			{/* 动画预览 */}
			<div className="relative max-w-md">
				{format === "webp" ? (
					<Image
						src={url}
						alt="Animation Preview"
						width={0}
						height={0}
						className="w-auto h-auto max-w-full max-h-80 rounded border"
						style={{ maxWidth: "100%", maxHeight: "20rem" }}
						unoptimized // 由于是blob URL，需要禁用优化
						sizes="100vw"
					/>
				) : (
					<Image
						src={url}
						alt="Animation Preview"
						width={0}
						height={0}
						className="w-auto h-auto max-w-full max-h-80 rounded border"
						style={{ maxWidth: "100%", maxHeight: "20rem" }}
						unoptimized // 由于是blob URL，需要禁用优化
						sizes="100vw"
					/>
				)}
			</div>

			{/* 动画信息 */}
			<div className="grid grid-cols-2 gap-4 text-sm w-full max-w-md">
				<div className="flex justify-between">
					<span className="text-muted-foreground">{t("format")}:</span>
					<span className="font-medium">{format.toUpperCase()}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">{t("file_size")}:</span>
					<span className="font-medium">{(size / 1024 / 1024).toFixed(2)} MB</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">{t("frame_count")}:</span>
					<span className="font-medium">{frameCount}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">{t("frame_rate")}:</span>
					<span className="font-medium">{frameRate} FPS</span>
				</div>
			</div>
		</div>
	);
}

export default AnimationPreview;
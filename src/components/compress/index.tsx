import ffm_ins from "@/lib/ffmpeg";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import CompressItem from "./components/CompressItem";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Input,
	Button,
} from "@/components/shadcn";
import Advanced from "./components/Advanced";
import DownloadAll from "./components/DownloadAll";

function ImageTrans() {
	const [loading, setLoading] = useState(false);
	const { t } = useI18n();
	const [downloadList, setDownloadList] = useState<
		{ url: string; name: string }[]
	>([]);
	// 追踪文件的选择状态
	const [files, setFiles] = useState<FileList | null>(null);

	// 新增：格式和高级配置
	const [format, setFormat] = useState("webp");
	const [advanced, setAdvanced] = useState({ width: "", height: "", quality: 85 });

	async function handleCompress() {
		if (!files || files.length === 0) return;
		setLoading(true);
		setDownloadList([]);
		try {
			const results: { url: string; name: string }[] = [];
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				const arrayBuffer = await file.arrayBuffer();
				const baseName = file.name.replace(/\.[^.]+$/, "");
				
				// 当选择 avif 时使用 webp 作为备选格式
				let actualFormat = format;
				let outputName = `${baseName}_compressed.${format}`;
				
				try {
					const compressed = await ffm_ins.convertImage({
						input: arrayBuffer,
						outputName,
						quality: advanced.quality,
						width: advanced.width ? Number(advanced.width) : undefined,
						height: advanced.height ? Number(advanced.height) : undefined,
					});
					
					const mimeMap: Record<string, string> = {
						webp: "image/webp",
						png: "image/png",
						jpg: "image/jpeg",
						jpeg: "image/jpeg",
						avif: "image/avif",
					};
					
					const blob = new Blob([compressed], { type: mimeMap[actualFormat] || "application/octet-stream" });
					const url = URL.createObjectURL(blob);
					results.push({ url, name: outputName });
				} catch (error) {
					if (format === "avif") {
						// AVIF 转换失败，尝试使用 WebP 替代
						console.warn("AVIF 转换失败，使用 WebP 替代", error);
						actualFormat = "webp";
						outputName = `${baseName}_compressed.webp`;
						
						const compressed = await ffm_ins.convertImage({
							input: arrayBuffer,
							outputName,
							quality: advanced.quality,
							width: advanced.width ? Number(advanced.width) : undefined,
							height: advanced.height ? Number(advanced.height) : undefined,
						});
						
						const blob = new Blob([compressed], { type: "image/webp" });
						const url = URL.createObjectURL(blob);
						results.push({ url, name: outputName });
					} else {
						// 其他格式转换失败，继续抛出异常
						throw error;
					}
				}
			}
			setDownloadList(results);
		} catch (e) {
			console.error("压缩失败", e);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div>
			<div className="flex gap-4 flex-wrap">
				<Input type="file" accept="image/*" multiple className="w-fit" onChange={(e) => setFiles(e.target.files)}/>
				<Select value={format} onValueChange={setFormat}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Format" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="webp">.webp</SelectItem>
						<SelectItem value="png">.png</SelectItem>
						<SelectItem value="jpg">.jpg</SelectItem>
					</SelectContent>
				</Select>
				<Advanced onChange={setAdvanced} />
				<Button onClick={handleCompress} disabled={loading || !files || files.length === 0}>
					{loading ? t("compressing_btn") : t("compress_btn")}
				</Button>
				<DownloadAll items={downloadList} />
			</div>
			{downloadList.length > 0 && (
				<div className="mt-4 space-y-2">
					{downloadList.map((item) => (
						<CompressItem
							name={item.name}
							url={item.url}
							key={item.name + item.url}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export default ImageTrans;

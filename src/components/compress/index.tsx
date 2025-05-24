import ffm_ins from "@/lib/ffmpeg";
import { useRef, useState } from "react";
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
	const fileRef = useRef<HTMLInputElement>(null);
	const [loading, setLoading] = useState(false);
	const { t } = useI18n();
	const [downloadList, setDownloadList] = useState<
		{ url: string; name: string }[]
	>([]);

	// 新增：格式和高级配置
	const [format, setFormat] = useState("webp");
	const [advanced, setAdvanced] = useState({ width: "", height: "", quality: 85 });

	async function handleCompress() {
		const files = fileRef.current?.files;
		if (!files || files.length === 0) return;
		setLoading(true);
		setDownloadList([]);
		try {
			const results: { url: string; name: string }[] = [];
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				const arrayBuffer = await file.arrayBuffer();
				const baseName = file.name.replace(/\.[^.]+$/, "");
				const outputName = `${baseName}_compressed.${format}`;
				const compressed = await ffm_ins.convertImage({
					input: arrayBuffer,
					outputName,
					quality: advanced.quality,
					// width 和 height 不属于 convertImage 的已知参数，移除以修复类型错误
				});
				const mimeMap: Record<string, string> = {
					webp: "image/webp",
					png: "image/png",
					jpg: "image/jpeg",
					jpeg: "image/jpeg",
				};
				const blob = new Blob([compressed], { type: mimeMap[format] || "application/octet-stream" });
				const url = URL.createObjectURL(blob);
				results.push({ url, name: outputName });
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
			<div className="flex gap-4">
				<Input type="file" ref={fileRef} accept="image/*" multiple />
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
				<Button onClick={handleCompress} disabled={loading}>
					{loading ? t("compressing_btn") : t("compress_btn")}
				</Button>
				<DownloadAll urls={downloadList.map((item) => item.url)} />
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

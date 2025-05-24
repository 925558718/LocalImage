import ffm_ins from "@/lib/ffmpeg";
import { Button } from "../shadcn/button";
import { Input } from "../shadcn/input";
import { useRef, useState } from "react";

function ImageTrans() {
	const fileRef = useRef<HTMLInputElement>(null);
	const [loading, setLoading] = useState(false);
	const [downloadList, setDownloadList] = useState<{ url: string; name: string }[]>([]);

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
				const outputName = `${baseName}_compressed.jpg`;
				const compressed = await ffm_ins.convertImage({
					input: arrayBuffer,
					outputName: "output.jpg",
					quality: 75,
				});
				const blob = new Blob([compressed], { type: "image/jpeg" });
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
			<Input type="file" ref={fileRef} accept="image/*" multiple />
			<Button onClick={handleCompress} disabled={loading}>
				{loading ? "压缩中..." : "compress"}
			</Button>
			{downloadList.length > 0 && (
				<div className="mt-4 space-y-2">
					{downloadList.map((item) => (
						<a href={item.url} download={item.name} key={item.name} className="block">
							<Button variant="secondary">下载 {item.name}</Button>
						</a>
					))}
				</div>
			)}
		</div>
	);
}

export default ImageTrans;

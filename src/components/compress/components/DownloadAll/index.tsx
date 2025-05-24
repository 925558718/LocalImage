import { Button } from "@/components/shadcn";
import JSZip from "jszip";

function DownloadAll({ urls }: { urls: string[] }) {
	async function handleDownloadAll() {
		const zip = new JSZip();
		// 并发下载所有图片并添加到 zip
		await Promise.all(
			urls.map(async (url, idx) => {
				const res = await fetch(url);
				const blob = await res.blob();
				// 取文件名或用序号
				const name = url.split("/").pop() || `image${idx + 1}.jpg`;
				zip.file(name, blob);
			}),
		);
		// 生成 zip 文件并下载
		const content = await zip.generateAsync({ type: "blob" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(content);
		a.download = "images.zip";
		a.click();
		URL.revokeObjectURL(a.href);
	}

	return (
		<Button onClick={handleDownloadAll} disabled={urls.length === 0}>
			Download All
		</Button>
	);
}

export default DownloadAll;

import { Button } from "@/components/shadcn";
import JSZip from "jszip";

interface DownloadItem {
	url: string;
	name: string;
}

function DownloadAll({ items }: { items: DownloadItem[] }) {
	async function handleDownloadAll() {
		const zip = new JSZip();
		// 并发下载所有图片并添加到 zip
		await Promise.all(
			items.map(async (item, idx) => {
				const res = await fetch(item.url);
				const blob = await res.blob();
				// 使用传入的文件名，确保扩展名正确
				zip.file(item.name, blob);
			}),
		);
		// 生成 zip 文件并下载
		const content = await zip.generateAsync({ type: "blob" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(content);
		a.download = "compressed_images.zip";
		a.click();
		URL.revokeObjectURL(a.href);
	}

	return (
		<Button onClick={handleDownloadAll} disabled={items.length === 0}>
			Download All
		</Button>
	);
}

export default DownloadAll;

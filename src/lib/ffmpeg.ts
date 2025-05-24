import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { isBrowser } from "./utils";
const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

class FFMPEG {
	private ffmpeg: FFmpeg | null = null;
	private isLoaded = false;
	private loadingPromise: Promise<void> | null = null;

	constructor() {
		if (!isBrowser()) {
			return;
		}
		console.log("test")
		this.ffmpeg = new FFmpeg();
		this.ffmpeg.on("log", ({ message }: { message: string }) => {
			console.log("[ffmpeg]", message);
		});
	}

	async load() {
		if (this.isLoaded) return;
		if (this.loadingPromise) return this.loadingPromise as Promise<void>;
		if (!this.ffmpeg) throw new Error("ffmpeg 未初始化");
		this.loadingPromise = (async () => {
			await (this.ffmpeg as FFmpeg).load({
				coreURL: await toBlobURL(
					`${baseURL}/ffmpeg-core.js`,
					"text/javascript",
				),
				wasmURL: await toBlobURL(
					`${baseURL}/ffmpeg-core.wasm`,
					"application/wasm",
				),
			});
			this.isLoaded = true;
		})();
		return this.loadingPromise;
	}

	/**
	 * 图片格式转换和压缩
	 * @param input 图片的URL、Uint8Array或ArrayBuffer
	 * @param outputName 输出文件名（如 output.jpg、output.webp）
	 * @param quality 压缩质量（0-100，默认75，webp/jpg有效）
	 */
	async convertImage({
		input,
		outputName,
		quality = 75,
	}: {
		input: string | Uint8Array | ArrayBuffer;
		outputName: string;
		quality?: number;
	}): Promise<Uint8Array> {
		await this.load();
		// 自动判断输入格式
		const ext = outputName.split(".").pop()?.toLowerCase() || "jpg";
		let inputFileName = `input_image.${ext}`;
		if (
			typeof input === "string" &&
			(input.endsWith(".png") ||
				input.endsWith(".jpg") ||
				input.endsWith(".jpeg") ||
				input.endsWith(".webp"))
		) {
			inputFileName = `input_image.${input.split(".").pop()}`;
		} else if (typeof input === "string") {
			inputFileName = "input_image.jpg";
		}
		// 写入输入文件
		let fileData: Uint8Array;
		if (
			typeof input === "string" &&
			(input.startsWith("http://") || input.startsWith("https://"))
		) {
			fileData = await fetchFile(input);
		} else {
			fileData =
				input instanceof Uint8Array
					? input
					: new Uint8Array(input as ArrayBuffer);
		}
		if (!this.ffmpeg) throw new Error("ffmpeg 未初始化");
		await this.ffmpeg.writeFile(inputFileName, fileData);

		// 构建参数
		const args = ["-i", inputFileName];
		if (ext === "jpg" || ext === "jpeg") {
			args.push("-q:v", String(Math.round((100 - quality) / 2.5))); // 0(高质量)-31(低质量)
		} else if (ext === "webp") {
			args.push("-qscale", String(quality)); // 0-100
		}
		args.push(outputName);

		await this.ffmpeg.exec(args);
		return (await this.ffmpeg.readFile(outputName)) as Uint8Array;
	}
}

const ffm_ins = new FFMPEG();

export default ffm_ins;

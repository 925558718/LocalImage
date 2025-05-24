import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { isBrowser } from "./utils";

class FFMPEG {
	private ffmpeg: FFmpeg | null = null;
	private isLoaded = false;
	private loadingPromise: Promise<void> | null = null;

	constructor() {
		if (!isBrowser()) {
			return;
		}
		this.ffmpeg = new FFmpeg();
		this.ffmpeg.on("log", ({ message }: { message: string }) => {
			console.log("[ffmpeg]", message);
		});
	}

	async load() {
		if (this.isLoaded) return;
		if (this.loadingPromise) return this.loadingPromise as Promise<void>;
		if (!this.ffmpeg) throw new Error("ffmpeg dones't exist");
		this.loadingPromise = (async () => {
			await (this.ffmpeg as FFmpeg).load({
				coreURL: await toBlobURL(
					"/js/ffmpeg-core.js",
					"text/javascript",
				),
				wasmURL: await toBlobURL(
					"https://static.limgx.com/ffmpeg-core.wasm",
					"application/wasm",
				),
			});
			this.isLoaded = true;
		})();
		return this.loadingPromise;
	}

	/**
	 * 图片格式转换和压缩，支持分辨率调整和avif格式
	 * @param input 图片的URL、Uint8Array或ArrayBuffer
	 * @param outputName 输出文件名（如 output.jpg、output.webp、output.avif）
	 * @param quality 压缩质量（0-100，默认75，webp/jpg/avif有效）
	 * @param width 可选，输出宽度
	 * @param height 可选，输出高度
	 */
	async convertImage({
		input,
		outputName,
		quality = 75,
		width,
		height,
	}: {
		input: string | Uint8Array | ArrayBuffer;
		outputName: string;
		quality?: number;
		width?: number;
		height?: number;
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
				input.endsWith(".webp") ||
				input.endsWith(".avif"))
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
		// 分辨率缩放
		if (width || height) {
			let scaleArg = "scale=";
			scaleArg += width ? `${width}:` : "-1:";
			scaleArg += height ? `${height}` : "-1";
			args.push("-vf", scaleArg);
		}
		if (ext === "jpg" || ext === "jpeg") {
			args.push("-q:v", String(Math.round((100 - quality) / 2.5))); // 0(高质量)-31(低质量)
		} else if (ext === "webp") {
			args.push("-qscale", String(quality)); // 0-100
		} else if (ext === "avif") {
			args.push("-qscale", String(quality)); // avif同样支持qscale
		}
		args.push(outputName);

		await this.ffmpeg.exec(args);
		return (await this.ffmpeg.readFile(outputName)) as Uint8Array;
	}
}

const ffm_ins = new FFMPEG();

export default ffm_ins;

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { isBrowser } from "./utils";

// 支持的图片格式
export type ImageFormat = 'png' | 'jpg' | 'jpeg' | 'webp' | 'avif';

// 格式转换映射表
export const FORMAT_CONVERSION_MAP: Record<ImageFormat, ImageFormat[]> = {
	png: ['jpg', 'webp', 'avif'],
	jpg: ['png', 'webp', 'avif'],
	jpeg: ['png', 'webp', 'avif'],
	webp: ['png', 'jpg', 'avif'],
	avif: ['png', 'jpg', 'webp']
};

// 转换策略接口
interface ConversionStrategy {
	getArgs(inputFileName: string, outputName: string, quality: number, width?: number, height?: number): string[];
}

// 默认转换策略
class DefaultConversionStrategy implements ConversionStrategy {
	getArgs(inputFileName: string, outputName: string, quality: number, width?: number, height?: number): string[] {
		const args = ['-i', inputFileName];
		
		// 分辨率缩放
		if (width || height) {
			let scaleArg = 'scale=';
			scaleArg += width ? `${width}:` : '-1:';
			scaleArg += height ? `${height}` : '-1';
			args.push('-vf', scaleArg);
		}
		
		args.push(outputName);
		return args;
	}
}

// JPEG转换策略
class JpegConversionStrategy implements ConversionStrategy {
	getArgs(inputFileName: string, outputName: string, quality: number, width?: number, height?: number): string[] {
		const args = ['-i', inputFileName];
		
		if (width || height) {
			let scaleArg = 'scale=';
			scaleArg += width ? `${width}:` : '-1:';
			scaleArg += height ? `${height}` : '-1';
			args.push('-vf', scaleArg);
		}
		
		args.push('-q:v', String(Math.round((100 - quality) / 2.5))); // 0(高质量)-31(低质量)
		args.push(outputName);
		return args;
	}
}

// WebP转换策略
class WebPConversionStrategy implements ConversionStrategy {
	getArgs(inputFileName: string, outputName: string, quality: number, width?: number, height?: number): string[] {
		const args = ['-i', inputFileName];
		
		if (width || height) {
			let scaleArg = 'scale=';
			scaleArg += width ? `${width}:` : '-1:';
			scaleArg += height ? `${height}` : '-1';
			args.push('-vf', scaleArg);
		}
		
		args.push('-qscale', String(quality)); // 0-100
		args.push(outputName);
		return args;
	}
}

// AVIF转换策略
class AvifConversionStrategy implements ConversionStrategy {
	getArgs(inputFileName: string, outputName: string, quality: number, width?: number, height?: number): string[] {
		const args = ['-i', inputFileName];
		
		if (width || height) {
			let scaleArg = 'scale=';
			scaleArg += width ? `${width}:` : '-1:';
			scaleArg += height ? `${height}` : '-1';
			args.push('-vf', scaleArg);
		}
		
		args.push('-c:v', 'libaom-av1');
		args.push('-strict', 'experimental');
		args.push('-crf', String(Math.round((100 - quality) * 0.63))); // 将quality转换为crf值(0-63)
		args.push('-b:v', '0'); // 使用CRF而非比特率
		args.push(outputName);
		return args;
	}
}

// 策略工厂
class ConversionStrategyFactory {
	private static strategies: Record<string, ConversionStrategy> = {
		jpg: new JpegConversionStrategy(),
		jpeg: new JpegConversionStrategy(),
		webp: new WebPConversionStrategy(),
		avif: new AvifConversionStrategy(),
		png: new DefaultConversionStrategy()
	};

	static getStrategy(format: string): ConversionStrategy {
		return this.strategies[format] || new DefaultConversionStrategy();
	}

	static canConvert(sourceFormat: string, targetFormat: string): boolean {
		return FORMAT_CONVERSION_MAP[sourceFormat as ImageFormat]?.includes(targetFormat as ImageFormat) || false;
	}
}

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
		
		// 获取源格式，确保是有效的字符串
		const sourceExt = (typeof input === "string" && input.includes(".") 
			? input.split(".").pop()?.toLowerCase() 
			: "jpg") as ImageFormat;
		
		// 获取目标格式，确保是有效的字符串
		const targetExt = (outputName.split(".").pop()?.toLowerCase() || "jpg") as ImageFormat;
		
		// 验证格式转换是否支持
		if (!ConversionStrategyFactory.canConvert(sourceExt, targetExt)) {
			throw new Error(`不支持从 ${sourceExt} 转换到 ${targetExt}`);
		}
		
		// 自动判断输入格式
		let inputFileName = `input_image.${sourceExt}`;
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

		// 使用策略模式获取转换参数
		const strategy = ConversionStrategyFactory.getStrategy(targetExt);
		const args = strategy.getArgs(inputFileName, outputName, quality, width, height);

		await this.ffmpeg.exec(args);
		return (await this.ffmpeg.readFile(outputName)) as Uint8Array;
	}
}

const ffm_ins = new FFMPEG();

export default ffm_ins;

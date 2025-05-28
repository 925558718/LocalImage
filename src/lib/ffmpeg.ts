import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { isBrowser } from "./utils";

// 扩展Window接口以包含gc方法
declare global {
	interface Window {
		gc?: () => void;
	}
}

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
		
		// 明确指定使用libwebp编码器，而不是libwebp_anim
		args.push('-c:v', 'libwebp');
		args.push('-quality', String(quality)); // 使用-quality参数而不是-qscale
		args.push('-lossless', '0'); // 确保使用有损压缩
		args.push('-method', '6'); // 使用最佳压缩方法
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
	// 并行处理的FFmpeg实例池
	private static instancePool: FFMPEG[] = [];
	private static readonly MAX_CONCURRENT = 2; // 减少最大并发数以节省内存
	private static creatingInstances = 0; // 正在创建的实例数
	private static currentConcurrent = 1; // 当前实际并发数，动态调整

	constructor() {
		if (!isBrowser()) {
			return;
		}
		this.ffmpeg = new FFmpeg();
		this.ffmpeg.on("log", ({ message }: { message: string }) => {
			console.log("[ffmpeg]", message);
		});
	}

	/**
	 * 动态调整并发数
	 */
	private static adjustConcurrency(success: boolean): void {
		if (success && this.currentConcurrent < this.MAX_CONCURRENT) {
			this.currentConcurrent = Math.min(this.currentConcurrent + 1, this.MAX_CONCURRENT);
			console.log(`[ffmpeg] 提升并发数到: ${this.currentConcurrent}`);
		} else if (!success && this.currentConcurrent > 1) {
			this.currentConcurrent = Math.max(this.currentConcurrent - 1, 1);
			console.log(`[ffmpeg] 降低并发数到: ${this.currentConcurrent}`);
		}
	}

	/**
	 * 获取一个可用的FFmpeg实例
	 */
	static async getAvailableInstance(): Promise<FFMPEG> {
		// 强制垃圾回收以释放内存
		if (window.gc) {
			window.gc();
		}
		
		// 如果池中有可用实例，直接返回
		if (this.instancePool.length > 0) {
			const instance = this.instancePool.pop()!;
			// 清理实例内存后再返回
			await instance.cleanupMemory();
			return instance;
		}
		
		// 限制同时创建的实例数量（使用动态并发数）
		if (this.creatingInstances >= this.currentConcurrent) {
			// 等待其他实例创建完成
			await new Promise(resolve => setTimeout(resolve, 500)); // 增加等待时间
			return this.getAvailableInstance();
		}
		
		// 创建新实例
		this.creatingInstances++;
		try {
			// 清理所有现有实例以释放内存
			await this.clearInstancePool();
			
			// 再次强制垃圾回收
			if (window.gc) {
				window.gc();
			}
			
			// 等待一段时间让内存释放
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			const instance = new FFMPEG();
			await instance.load();
			this.adjustConcurrency(true); // 成功创建实例
			return instance;
		} catch (error) {
			console.error('创建FFmpeg实例失败:', error);
			this.adjustConcurrency(false); // 创建失败，降低并发数
			
			// 如果是内存相关错误，强制使用单实例模式
			if (error instanceof Error && (
				error.message.includes('memory') || 
				error.message.includes('Memory') ||
				error.message.includes('WebAssembly')
			)) {
				this.currentConcurrent = 1;
				console.warn('[ffmpeg] 检测到内存不足，强制切换到单实例模式');
				
				// 尝试清理并重试一次
				await this.clearInstancePool();
				if (window.gc) {
					window.gc();
				}
				await new Promise(resolve => setTimeout(resolve, 2000));
			}
			
			throw new Error(`FFmpeg实例创建失败: ${error}`);
		} finally {
			this.creatingInstances--;
		}
	}

	/**
	 * 将实例返回到池中
	 */
	static returnInstance(instance: FFMPEG): void {
		if (this.instancePool.length < this.MAX_CONCURRENT) {
			// 清理实例内存后返回池中
			instance.cleanupMemory().catch(console.warn);
			this.instancePool.push(instance);
		}
	}

	/**
	 * 清理实例池
	 */
	static async clearInstancePool(): Promise<void> {
		const instances = [...this.instancePool];
		this.instancePool = [];
		
		// 清理所有实例
		await Promise.all(instances.map(instance => 
			instance.cleanupMemory().catch(console.warn)
		));
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
	 * 清理FFmpeg内存中的临时文件
	 * 在批量处理或处理大文件后调用，防止内存泄漏
	 */
	async cleanupMemory(): Promise<void> {
		if (!this.ffmpeg || !this.isLoaded) return;
		
		try {
			// 获取当前文件系统中的所有文件
			const files = await this.ffmpeg.listDir('/');
			
			// 定义系统目录和文件，这些不应该被删除
			const systemPaths = new Set([
				'tmp', 'home', 'dev', 'proc', 'sys', 'etc', 'bin', 'usr', 'var',
				'.', '..', 'ffmpeg-core.js', 'ffmpeg-core.wasm'
			]);
			
			// 只删除我们创建的临时文件 - 批量删除以提高性能
			const filesToDelete = files.filter(file => 
				file.name && 
				!systemPaths.has(file.name) && 
				!file.name.endsWith('/') && 
				(file.name.includes('input_image') || 
				 file.name.includes('_compressed') || 
				 file.name.includes('frame_') || 
				 file.name.includes('palette') ||
				 file.name.match(/\.(png|jpg|jpeg|webp|avif|gif)$/i))
			);
			
			// 批量删除文件，减少日志输出
			if (filesToDelete.length > 0) {
				console.log(`[ffmpeg] 清理 ${filesToDelete.length} 个临时文件...`);
				
				await Promise.all(
					filesToDelete.map(async (file) => {
						try {
							await this.ffmpeg!.deleteFile(file.name);
						} catch (error) {
							// 静默忽略删除失败的文件，避免过多警告信息
						}
					})
				);
				
				console.log('[ffmpeg] 内存清理完成');
			}
		} catch (error) {
			console.warn('[ffmpeg] 内存清理失败:', error);
		}
	}

	/**
	 * 重置FFmpeg实例
	 * 在遇到严重错误或需要完全清理时使用
	 */
	async reset(): Promise<void> {
		try {
			await this.cleanupMemory();
		} catch (error) {
			console.warn('[ffmpeg] 重置时清理内存失败:', error);
		}
		
		// 重新创建FFmpeg实例
		if (isBrowser()) {
			this.ffmpeg = new FFmpeg();
			this.ffmpeg.on("log", ({ message }: { message: string }) => {
				console.log("[ffmpeg]", message);
			});
			this.isLoaded = false;
			this.loadingPromise = null;
		}
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
		} else if (typeof input === "string") {
			// 字符串类型但不是URL，当作文件路径处理
			fileData = await fetchFile(input);
		} else {
			// 检查ArrayBuffer是否已被分离
			if (input instanceof ArrayBuffer) {
				if (input.byteLength === 0) {
					throw new Error("ArrayBuffer已被分离，无法处理");
				}
				fileData = new Uint8Array(input);
			} else {
				fileData = input instanceof Uint8Array ? input : new Uint8Array(input);
			}
		}
		if (!this.ffmpeg) throw new Error("ffmpeg 未初始化");
		await this.ffmpeg.writeFile(inputFileName, fileData);

		// 使用策略模式获取转换参数
		const strategy = ConversionStrategyFactory.getStrategy(targetExt);
		const args = strategy.getArgs(inputFileName, outputName, quality, width, height);

		await this.ffmpeg.exec(args);
		const result = (await this.ffmpeg.readFile(outputName)) as Uint8Array;
		
		// 清理临时文件，防止内存泄漏
		try {
			// 只删除我们明确创建的文件
			if (inputFileName && inputFileName !== outputName) {
				await this.ffmpeg.deleteFile(inputFileName);
			}
			if (outputName) {
				await this.ffmpeg.deleteFile(outputName);
			}
		} catch (error) {
			console.warn('[ffmpeg] 清理临时文件失败:', error);
		}
		
		// 验证压缩结果
		if (!result || result.length === 0) {
			throw new Error(`压缩失败：压缩结果为空`);
		}
		
		return result;
	}

	/**
	 * 创建GIF动画
	 * @param framePattern 帧文件模式，如 "frame_%03d.png"
	 * @param outputName 输出文件名
	 * @param frameRate 帧率
	 * @param loop 循环次数，0为无限循环
	 */
	async createGifAnimation({
		framePattern,
		outputName,
		frameRate = 10,
		loop = 0
	}: {
		framePattern: string;
		outputName: string;
		frameRate?: number;
		loop?: number;
	}): Promise<Uint8Array> {
		await this.load();
		if (!this.ffmpeg) throw new Error("ffmpeg 未初始化");

		const args = [
			'-framerate', frameRate.toString(),
			'-i', framePattern,
			'-vf', 'palettegen=reserve_transparent=1',
			'palette.png'
		];

		// 生成调色板
		await this.ffmpeg.exec(args);

		// 创建GIF
		const gifArgs = [
			'-framerate', frameRate.toString(),
			'-i', framePattern,
			'-i', 'palette.png',
			'-lavfi', 'paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle',
			'-loop', loop.toString(),
			outputName
		];

		await this.ffmpeg.exec(gifArgs);
		const result = (await this.ffmpeg.readFile(outputName)) as Uint8Array;
		
		// 清理临时文件
		try {
			// 只删除我们明确创建的文件
			await this.ffmpeg.deleteFile('palette.png');
			await this.ffmpeg.deleteFile(outputName);
		} catch (error) {
			console.warn('[ffmpeg] GIF创建后清理临时文件失败:', error);
		}
		
		return result;
	}

	/**
	 * 创建WebP动画
	 * @param framePattern 帧文件模式，如 "frame_%03d.png"
	 * @param outputName 输出文件名
	 * @param frameRate 帧率
	 * @param quality 质量
	 * @param loop 循环次数，0为无限循环
	 */
	async createWebPAnimation({
		framePattern,
		outputName,
		frameRate = 10,
		quality = 80,
		loop = 0
	}: {
		framePattern: string;
		outputName: string;
		frameRate?: number;
		quality?: number;
		loop?: number;
	}): Promise<Uint8Array> {
		await this.load();
		if (!this.ffmpeg) throw new Error("ffmpeg 未初始化");

		const args = [
			'-framerate', frameRate.toString(),
			'-i', framePattern,
			'-c:v', 'libwebp',
			'-quality', quality.toString(),
			'-lossless', '0',
			'-loop', loop.toString(),
			outputName
		];

		await this.ffmpeg.exec(args);
		const result = (await this.ffmpeg.readFile(outputName)) as Uint8Array;
		
		// 清理临时文件
		try {
			// 只删除我们明确创建的文件
			await this.ffmpeg.deleteFile(outputName);
		} catch (error) {
			console.warn('[ffmpeg] WebP动画创建后清理临时文件失败:', error);
		}
		
		return result;
	}

	/**
	 * 从多个图片创建动画
	 * @param images 图片文件数组
	 * @param outputName 输出文件名
	 * @param frameRate 帧率，默认10fps
	 * @param quality 质量，默认75
	 */
	async createAnimation({
		images,
		outputName,
		frameRate = 10,
		quality = 75,
	}: {
		images: File[];
		outputName: string;
		frameRate?: number;
		quality?: number;
	}): Promise<Uint8Array> {
		await this.load();
		
		if (!this.ffmpeg) throw new Error("ffmpeg 未初始化");
		if (images.length === 0) throw new Error("至少需要一张图片");
		
		// 按文件名排序 - 提取文件名中的数字进行自然排序
		const sortedImages = [...images].sort((a, b) => {
			// 提取文件名中的数字部分
			const extractNumbers = (filename: string): number[] => {
				const numbers = filename.match(/\d+/g);
				return numbers ? numbers.map(num => parseInt(num, 10)) : [];
			};
			
			const aNumbers = extractNumbers(a.name);
			const bNumbers = extractNumbers(b.name);
			
			// 按数字序列比较
			for (let i = 0; i < Math.max(aNumbers.length, bNumbers.length); i++) {
				const aNum = aNumbers[i] || 0;
				const bNum = bNumbers[i] || 0;
				if (aNum !== bNum) {
					return aNum - bNum;
				}
			}
			
			// 如果数字相同，按字符串排序
			return a.name.localeCompare(b.name);
		});
		
		console.log('[动画合成] 文件排序结果:', sortedImages.map(f => f.name));
		
		// 定义变量用于清理
		const fileExtensions: string[] = [];
		let inputPattern: string = ""; // 声明在这里确保finally块能访问
		
		try {
			// 写入所有图片文件（使用排序后的顺序，保持原始格式）
			for (let i = 0; i < sortedImages.length; i++) {
				const file = sortedImages[i];
				const arrayBuffer = await file.arrayBuffer();
				const fileData = new Uint8Array(arrayBuffer);
				
				// 获取原始文件扩展名
				const originalExt = file.name.split('.').pop()?.toLowerCase() || 'png';
				const fileName = `frame_${String(i).padStart(3, '0')}.${originalExt}`;
				fileExtensions.push(originalExt);
				
				await this.ffmpeg.writeFile(fileName, fileData);
				console.log(`[动画合成] 写入帧文件: ${fileName} (${file.name}), 格式: ${originalExt}, 大小: ${fileData.length} bytes`);
			}
			
			console.log(`[动画合成] 所有帧文件写入完成，共 ${sortedImages.length} 帧`);
			console.log(`[动画合成] 文件格式分布:`, fileExtensions);
			
			// 验证写入的文件
			const writtenFiles = await this.ffmpeg.listDir('/');
			const frameFiles = writtenFiles.filter(f => f.name.startsWith('frame_')).sort();
			console.log(`[动画合成] 已写入的帧文件:`, frameFiles.map(f => f.name));
			
			// 获取输出格式
			const ext = outputName.split(".").pop()?.toLowerCase() || "webp";
			
			console.log(`[动画合成] 开始合成 ${sortedImages.length} 张图片为 ${ext.toUpperCase()} 动画`);
			console.log(`[动画合成] 帧率: ${frameRate}fps, 质量: ${quality}`);
			
			// 检查输入文件格式是否一致
			const uniqueExts = [...new Set(fileExtensions)];
			console.log(`[动画合成] 检测到 ${uniqueExts.length} 种文件格式: ${uniqueExts.join(', ')}`);
			
			// 如果格式不一致，需要统一转换为PNG
			if (uniqueExts.length > 1) {
				console.log(`[动画合成] 格式不一致，将所有文件转换为PNG格式`);
				
				for (let i = 0; i < sortedImages.length; i++) {
					const originalFileName = `frame_${String(i).padStart(3, '0')}.${fileExtensions[i]}`;
					const pngFileName = `frame_${String(i).padStart(3, '0')}.png`;
					
					// 如果不是PNG格式，则转换
					if (fileExtensions[i] !== 'png') {
						try {
							await this.ffmpeg.exec([
								'-i', originalFileName,
								pngFileName
							]);
							
							// 删除原始文件
							await this.ffmpeg.deleteFile(originalFileName);
							console.log(`[动画合成] 转换 ${originalFileName} -> ${pngFileName}`);
						} catch (error) {
							console.warn(`[动画合成] 转换文件 ${originalFileName} 失败:`, error);
						}
					}
				}
				
				// 更新输入模式为PNG
				inputPattern = "frame_%03d.png";
				console.log(`[动画合成] 格式统一完成，使用模式: ${inputPattern}`);
			} else {
				// 格式一致
				inputPattern = `frame_%03d.${uniqueExts[0]}`;
				console.log(`[动画合成] 格式一致，使用模式: ${inputPattern}`);
			}
			
			console.log(`[动画合成] 使用输入模式: ${inputPattern}`);
			
			if (ext === "webp") {
				// WebP 动画 - 使用传统序列模式（FFmpeg.wasm不支持glob）
				const args = [
					"-framerate", String(frameRate),
					"-i", inputPattern.includes('*') ? "frame_%03d.png" : inputPattern,
					"-c:v", "libwebp",
					"-quality", String(quality),
					"-lossless", "0",
					"-loop", "0",
					"-fps_mode", "cfr", // 替代已弃用的-vsync
					"-r", String(frameRate), // 明确指定输出帧率
					"-an", // 移除音频流
					outputName
				];
				
				console.log(`[动画合成] WebP命令: ffmpeg ${args.join(' ')}`);
				
				try {
					await this.ffmpeg.exec(args);
				} catch (error) {
					console.warn(`[动画合成] 序列模式失败，尝试简化方法:`, error);
					
					// 备用方法：最简化的WebP动画
					const simpleArgs = [
						"-framerate", String(frameRate),
						"-i", "frame_%03d.*", // 使用通配符匹配任何扩展名
						"-c:v", "libwebp",
						"-quality", String(quality),
						"-lossless", "0",
						"-loop", "0",
						outputName
					];
					
					console.log(`[动画合成] WebP简化命令: ffmpeg ${simpleArgs.join(' ')}`);
					await this.ffmpeg.exec(simpleArgs);
				}
			} else if (ext === "gif") {
				// 先生成调色板 - 使用传统序列模式
				const paletteArgs = [
					"-framerate", String(frameRate),
					"-i", inputPattern.includes('*') ? "frame_%03d.png" : inputPattern,
					"-vf", "palettegen",
					"palette.png"
				];
				
				console.log(`[动画合成] GIF调色板命令: ffmpeg ${paletteArgs.join(' ')}`);
				
				try {
					await this.ffmpeg.exec(paletteArgs);
				} catch (error) {
					console.warn(`[动画合成] GIF调色板失败，尝试通配符模式:`, error);
					
					// 备用调色板生成
					const fallbackPaletteArgs = [
						"-framerate", String(frameRate),
						"-i", "frame_%03d.*",
						"-vf", "palettegen",
						"palette.png"
					];
					
					console.log(`[动画合成] GIF调色板备用命令: ffmpeg ${fallbackPaletteArgs.join(' ')}`);
					await this.ffmpeg.exec(fallbackPaletteArgs);
				}
				
				// 生成 GIF - 使用基础滤镜
				const gifArgs = [
					"-framerate", String(frameRate),
					"-i", inputPattern.includes('*') ? "frame_%03d.png" : inputPattern,
					"-i", "palette.png",
					"-lavfi", "paletteuse",
					"-r", String(frameRate), // 明确指定输出帧率
					"-loop", "0",
					outputName
				];
				
				console.log(`[动画合成] GIF生成命令: ffmpeg ${gifArgs.join(' ')}`);
				
				try {
					await this.ffmpeg.exec(gifArgs);
				} catch (error) {
					console.warn(`[动画合成] GIF标准方法失败，尝试最简化方法:`, error);
					
					// 最简化的GIF生成方法
					const simpleGifArgs = [
						"-framerate", String(frameRate),
						"-i", "frame_%03d.*",
						"-vf", `fps=${frameRate}`,
						"-loop", "0",
						outputName
					];
					
					console.log(`[动画合成] GIF最简化命令: ffmpeg ${simpleGifArgs.join(' ')}`);
					await this.ffmpeg.exec(simpleGifArgs);
				}
			} else {
				throw new Error("仅支持WebP和GIF格式");
			}
			
			return (await this.ffmpeg.readFile(outputName)) as Uint8Array;
		} catch (error) {
			console.error("动画创建失败:", error);
			throw error;
		} finally {
			// 清理我们创建的临时文件
			try {
				// 删除帧文件 - 根据最终格式决定
				const finalPattern = inputPattern.includes('png') ? 'png' : fileExtensions;
				
				for (let i = 0; i < sortedImages.length; i++) {
					// 如果进行了格式转换，清理PNG文件；否则清理原始格式文件
					const fileName = typeof finalPattern === 'string' 
						? `frame_${String(i).padStart(3, '0')}.png`
						: `frame_${String(i).padStart(3, '0')}.${fileExtensions[i]}`;
					
					try {
						await this.ffmpeg.deleteFile(fileName);
					} catch (e) {
						// 忽略单个文件删除失败
					}
				}
				
				// 删除输出文件
				try {
					await this.ffmpeg.deleteFile(outputName);
				} catch (e) {
					// 忽略输出文件删除失败
				}
				
				// 如果是GIF，还要删除调色板文件
				const ext = outputName.split(".").pop()?.toLowerCase();
				if (ext === "gif") {
					try {
						await this.ffmpeg.deleteFile("palette.png");
					} catch (e) {
						// 忽略调色板文件删除失败
					}
				}
				
				console.log('[ffmpeg] 动画创建后临时文件清理完成');
			} catch (cleanupError) {
				console.warn('[ffmpeg] 动画创建后清理临时文件失败:', cleanupError);
			}
		}
	}

	/**
	 * 纯串行压缩多个图片 - 避免内存问题的安全模式
	 */
	static async convertImagesSerial({
		files,
		format,
		quality = 75,
		width,
		height,
		onProgress,
		onFileComplete
	}: {
		files: { data: ArrayBuffer; name: string; originalSize: number }[];
		format: string;
		quality?: number;
		width?: number;
		height?: number;
		onProgress?: (completed: number, total: number) => void;
		onFileComplete?: (result: {
			url: string;
			name: string;
			originalSize: number;
			compressedSize: number;
			processingTime: number;
			format: string;
			quality: number;
		}) => void;
	}): Promise<{
		url: string;
		name: string;
		originalSize: number;
		compressedSize: number;
		processingTime: number;
		format: string;
		quality: number;
	}[]> {
		const results: {
			url: string;
			name: string;
			originalSize: number;
			compressedSize: number;
			processingTime: number;
			format: string;
			quality: number;
		}[] = [];
		
		// 使用单一实例进行串行处理
		let instance: FFMPEG | null = null;
		
		try {
			console.log('[ffmpeg] 开始串行处理模式 - 稳定且内存高效');
			
			// 清理实例池和强制垃圾回收
			await this.clearInstancePool();
			if (window.gc) {
				window.gc();
			}
			// 减少延迟，从1000ms改为200ms
			await new Promise(resolve => setTimeout(resolve, 200));
			
			// 创建单一实例
			instance = new FFMPEG();
			await instance.load();
			
			console.log('[ffmpeg] 开始串行处理模式');
			
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				const startTime = performance.now();
				
				try {
					const baseName = file.name.replace(/\.[^.]+$/, "");
					// 清理文件名中的非法字符
					const cleanBaseName = baseName.replace(/[<>:"/\\|?*]/g, '_');
					const outputName = `${cleanBaseName}_compressed.${format}`;
					
					// 处理单个文件
					let compressed: Uint8Array;
					let actualFormat = format;
					
					try {
						compressed = await instance.convertImage({
							input: file.data,
							outputName,
							quality,
							width,
							height,
						});
						
						// 验证压缩结果
						if (!compressed || compressed.length === 0) {
							throw new Error(`压缩失败：${file.name} 压缩结果为空`);
						}
					} catch (error) {
						if (format === "avif") {
							console.warn("AVIF 转换失败，使用 WebP 替代", error);
							actualFormat = "webp";
							const webpOutputName = `${cleanBaseName}_compressed.webp`;
							
							compressed = await instance.convertImage({
								input: file.data,
								outputName: webpOutputName,
								quality,
								width,
								height,
							});
						} else {
							throw error;
						}
					}

					const mimeMap: Record<string, string> = {
						webp: "image/webp",
						png: "image/png",
						jpg: "image/jpeg",
						jpeg: "image/jpeg",
						avif: "image/avif",
					};

					const blob = new Blob([compressed], { 
						type: mimeMap[actualFormat] || "application/octet-stream" 
					});
					
					// 验证Blob是否正确创建
					if (blob.size === 0) {
						console.error(`[ffmpeg] 警告: 压缩后的Blob大小为0，文件: ${file.name}`);
						throw new Error(`压缩失败：生成的文件大小为0`);
					}
					
					// 创建Blob URL并验证
					let blobUrl: string;
					try {
						blobUrl = URL.createObjectURL(blob);
						console.log(`[ffmpeg] 创建Blob URL成功: ${blobUrl.substring(0, 50)}...`);
					} catch (error) {
						console.error(`[ffmpeg] 创建Blob URL失败:`, error);
						throw new Error(`下载链接创建失败`);
					}
					
					const result = {
						url: blobUrl,
						name: outputName,
						originalSize: file.originalSize,
						compressedSize: blob.size,
						processingTime: performance.now() - startTime,
						format: actualFormat,
						quality
					};

					console.log(`[ffmpeg] 文件处理完成: ${file.name}, 原始: ${(result.originalSize / 1024).toFixed(1)} KB, 压缩后: ${(result.compressedSize / 1024).toFixed(1)} KB, 压缩率: ${((result.originalSize - result.compressedSize) / result.originalSize * 100).toFixed(1)}%`);

					results.push(result);
					onFileComplete?.(result);
					
					// 更新进度
					const completed = i + 1;
					onProgress?.(completed, files.length);
					
					// 优化内存清理策略：只在处理大量文件时才清理，且减少频率
					if (files.length > 5 && (i + 1) % 5 === 0) {
						await instance.cleanupMemory();
						if (window.gc) {
							window.gc();
							// 减少垃圾回收后的等待时间
							await new Promise(resolve => setTimeout(resolve, 100));
						}
					}
					
				} catch (error) {
					console.error(`串行处理文件 ${file.name} 失败:`, error);
					throw error;
				}
			}
			
			return results;
			
		} finally {
			// 清理实例
			if (instance) {
				await instance.cleanupMemory();
			}
			
			// 最终垃圾回收
			if (window.gc) {
				window.gc();
			}
		}
	}

	/**
	 * 并行压缩多个图片 - 智能切换到串行模式
	 */
	static async convertImagesParallel({
		files,
		format,
		quality = 75,
		width,
		height,
		onProgress,
		onFileComplete
	}: {
		files: { data: ArrayBuffer; name: string; originalSize: number }[];
		format: string;
		quality?: number;
		width?: number;
		height?: number;
		onProgress?: (completed: number, total: number) => void;
		onFileComplete?: (result: {
			url: string;
			name: string;
			originalSize: number;
			compressedSize: number;
			processingTime: number;
			format: string;
			quality: number;
		}) => void;
	}): Promise<{
		url: string;
		name: string;
		originalSize: number;
		compressedSize: number;
		processingTime: number;
		format: string;
		quality: number;
	}[]> {
		try {
			// 先尝试并行处理（仅在内存足够时）
			console.log('[ffmpeg] 尝试并行处理模式');
			return await this.convertImagesSerial({ // 直接使用串行模式以避免内存问题
				files,
				format,
				quality,
				width,
				height,
				onProgress,
				onFileComplete
			});
		} catch (error) {
			console.warn('[ffmpeg] 并行处理失败，切换到串行处理:', error);
			
			// 切换到纯串行处理
			return await this.convertImagesSerial({
				files,
				format,
				quality,
				width,
				height,
				onProgress,
				onFileComplete
			});
		}
	}
}

const ffm_ins = new FFMPEG();

export default ffm_ins;
export { FFMPEG };

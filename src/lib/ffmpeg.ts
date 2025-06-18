import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { isBrowser } from "./utils";
import {
	AnimationStrategyFactory,
	GifAnimationStrategy,
	WebPAnimationStrategy,
} from "./animations";
import { ConversionStrategyFactory, ImageFormat } from "./conversions";

// 注意：原来这里有window.gc的声明，但实际上这是非标准API，已移除

class FFMPEG {
	private ffmpeg: FFmpeg | null = null;
	private isLoaded = false;
	private loadingPromise: Promise<void> | null = null;
	private _processCount = 0;
	private _processedBytes = 0; // 跟踪处理的文件大小总字节数

	constructor() {
		if (!isBrowser()) {
			return;
		}
		this.ffmpeg = new FFmpeg();
		// this.ffmpeg.on("log", ({ message }: { message: string }) => {
		// 	console.log("[ffmpeg]", message);
		// });
	}

	async load() {
		if (this.isLoaded) return;
		if (this.loadingPromise) return this.loadingPromise as Promise<void>;
		if (!this.ffmpeg) throw new Error("ffmpeg dones't exist");
		this.loadingPromise = (async () => {
			await (this.ffmpeg as FFmpeg).load({
				coreURL: await toBlobURL(
					"https://static.limgx.com/ffmpeg-core.js",
					"text/javascript",
				),
				wasmURL: await toBlobURL(
					"https://static.limgx.com/ffmpeg-core-12.10.wasm",
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
			const files = await this.ffmpeg.listDir("/");

			// 定义系统目录和文件，这些不应该被删除
			const systemPaths = new Set([
				"tmp",
				"home",
				"dev",
				"proc",
				"sys",
				"etc",
				"bin",
				"usr",
				"var",
				".",
				"..",
				"ffmpeg-core.js",
				"ffmpeg-core.wasm",
			]);

			// 只删除我们创建的临时文件 - 批量删除以提高性能
			const filesToDelete = files.filter(
				(file) =>
					file?.name &&
					!systemPaths.has(file.name) &&
					!file.name.endsWith("/") &&
					(file.name.includes("input_image") ||
						file.name.includes("_compressed") ||
						file.name.includes("frame_") ||
						file.name.includes("palette") ||
						file.name.match(/\.(png|jpg|jpeg|webp|avif|gif)$/i)),
			);

			// 批量删除文件，减少日志输出
			if (filesToDelete.length > 0) {
				// 串行删除文件，避免并发删除导致的FS错误
				for (const file of filesToDelete) {
					try {
						await this.ffmpeg.deleteFile(file.name);
					} catch (error) {
						// 静默忽略删除失败的文件，避免过多警告信息
						console.debug(`[ffmpeg] 删除文件 ${file.name} 失败:`, error);
					}
				}
				console.log("[ffmpeg] 内存清理完成");
			}

			// 定期重置实例 - 检查是否已经处理了大量图片
			const shouldResetInstance = this._shouldResetInstance();
			if (shouldResetInstance) {
				console.log("[ffmpeg] 检测到处理了大量图片，重置实例以释放内存");
				await this.reset();
				return;
			}
		} catch (error) {
			console.warn("[ffmpeg] 内存清理失败:", error);
			this.isLoaded = false;
			this.loadingPromise = null;
			await this.reset();
		}
	}

	// 判断是否应该重置实例 - 根据处理的文件大小来决定
	private _shouldResetInstance(): boolean {
		// 每处理一张图片，增加计数（保留原有计数逻辑作为备用）
		this._processCount++;

		// 基于处理的文件总大小的阈值 (100MB)
		const resetThresholdBytes = 100 * 1024 * 1024;

		// 当处理超过阈值大小的文件时，重置实例
		if (this._processedBytes >= resetThresholdBytes) {
			console.log(
				`[ffmpeg] 已处理 ${Math.round(this._processedBytes / (1024 * 1024))} MB 数据，重置实例以释放内存`,
			);
			this._processCount = 0; // 重置计数器
			this._processedBytes = 0; // 重置字节计数器
			return true;
		}

		return false;
	}

	/**
	 * 重置FFmpeg实例
	 * 在遇到严重错误或需要完全清理时使用
	 */
	async reset(): Promise<void> {
		try {
			// 尝试最后清理一次
			if (this.ffmpeg && this.isLoaded) {
				try {
					const files = await this.ffmpeg.listDir("/");
					for (const file of files) {
						if (
							file?.name &&
							!file.name.endsWith("/") &&
							file.name !== "." &&
							file.name !== ".."
						) {
							try {
								await this.ffmpeg.deleteFile(file.name);
							} catch (e) {
								// 忽略错误
							}
						}
					}
				} catch (e) {
					// 忽略错误
				}
			}
		} catch (error) {
			console.warn("[ffmpeg] 重置时清理内存失败:", error);
		} finally {
			// 重新创建FFmpeg实例
			if (isBrowser()) {
				this.ffmpeg = new FFmpeg();
				this.isLoaded = false;
				this.loadingPromise = null;
				this._processCount = 0; // 重置处理计数
				this._processedBytes = 0; // 重置处理的字节数

				console.log("[ffmpeg] 实例已完全重置");
			}
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
		const sourceExt = (
			typeof input === "string" && input.includes(".")
				? input.split(".").pop()?.toLowerCase()
				: "jpg"
		) as ImageFormat;

		// 获取目标格式，确保是有效的字符串
		const targetExt = (outputName.split(".").pop()?.toLowerCase() ||
			"jpg") as ImageFormat;

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

		try {
			// 使用策略模式获取转换参数
			const strategy = ConversionStrategyFactory.getStrategy(targetExt);
			const args = strategy.getArgs(
				inputFileName,
				outputName,
				quality,
				width,
				height,
			);

			await this.ffmpeg.exec(args);
			const result = (await this.ffmpeg.readFile(outputName)) as Uint8Array;

			// 验证压缩结果
			if (!result || result.length === 0) {
				throw new Error("压缩失败：压缩结果为空");
			}

			return result;
		} finally {
			// 更新处理计数
			this._processCount++;

			// 累加处理的文件大小
			this._processedBytes += fileData.length;

			// 清理临时文件，防止内存泄漏
			try {
				// 只删除我们明确创建的文件
				if (inputFileName && inputFileName !== outputName) {
					await this.ffmpeg.deleteFile(inputFileName);
				}
				if (outputName) {
					await this.ffmpeg.deleteFile(outputName);
				}

				// 每处理3个文件后，给浏览器一点时间进行自动垃圾回收
				if (this._processCount % 3 === 0) {
					await new Promise((resolve) => setTimeout(resolve, 50));
				}
			} catch (error) {
				console.warn("[ffmpeg] 清理临时文件失败:", error);
			}
		}
	}

	/**
	 * 创建GIF动画
	 * @param framePattern 帧文件模式，如 "frame_%03d.png"
	 * @param outputName 输出文件名
	 * @param frameRate 帧率
	 * @param loop 循环次数，0为无限循环
	 * @deprecated 请使用 createAnimation 方法代替
	 */
	async createGifAnimation({
		framePattern,
		outputName,
		frameRate = 10,
		loop = 0,
	}: {
		framePattern: string;
		outputName: string;
		frameRate?: number;
		loop?: number;
	}): Promise<Uint8Array> {
		console.warn(
			"createGifAnimation 方法已弃用，请使用 createAnimation 方法代替",
		);
		await this.load();
		if (!this.ffmpeg) throw new Error("ffmpeg 未初始化");

		const strategy = new GifAnimationStrategy();
		const result = await strategy.createAnimation(this.ffmpeg, {
			inputPattern: framePattern,
			outputName,
			frameRate,
			quality: 75, // GIF不使用质量参数，但需要传递
		});

		// 清理临时文件
		try {
			// 只删除我们明确创建的文件
			await this.ffmpeg.deleteFile("palette.png");
			await this.ffmpeg.deleteFile(outputName);
		} catch (error) {
			console.warn("[ffmpeg] GIF创建后清理临时文件失败:", error);
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
	 * @deprecated 请使用 createAnimation 方法代替
	 */
	async createWebPAnimation({
		framePattern,
		outputName,
		frameRate = 10,
		quality = 80,
		loop = 0,
	}: {
		framePattern: string;
		outputName: string;
		frameRate?: number;
		quality?: number;
		loop?: number;
	}): Promise<Uint8Array> {
		console.warn(
			"createWebPAnimation 方法已弃用，请使用 createAnimation 方法代替",
		);
		await this.load();
		if (!this.ffmpeg) throw new Error("ffmpeg 未初始化");

		const strategy = new WebPAnimationStrategy();
		const result = await strategy.createAnimation(this.ffmpeg, {
			inputPattern: framePattern,
			outputName,
			frameRate,
			quality,
		});

		// 清理临时文件
		try {
			// 只删除我们明确创建的文件
			await this.ffmpeg.deleteFile(outputName);
		} catch (error) {
			console.warn("[ffmpeg] WebP动画创建后清理临时文件失败:", error);
		}

		return result;
	}

	/**
	 * 从多个图片创建动画 - 统一入口
	 * @param images 图片文件数组
	 * @param outputName 输出文件名
	 * @param frameRate 帧率，默认10fps
	 * @param quality 质量，默认75
	 * @param videoCodec 视频编解码器，默认为libx264（MP4）或libvpx-vp9（WebM）
	 * @param format 输出格式（webp/gif/mp4/webm）
	 */
	async createAnimation({
		images,
		outputName,
		frameRate = 10,
		quality = 75,
		videoCodec,
		format,
	}: {
		images: File[];
		outputName: string;
		frameRate?: number;
		quality?: number;
		videoCodec?: string;
		format?: string;
	}): Promise<Uint8Array> {
		await this.load();

		if (!this.ffmpeg) throw new Error("ffmpeg 未初始化");
		if (images.length === 0) throw new Error("至少需要一张图片");

		// 获取输出格式，优先使用指定的format，其次从输出文件名中提取
		const outputFormat =
			format?.toLowerCase() ||
			outputName.split(".").pop()?.toLowerCase() ||
			"webp";

		// 验证格式支持
		if (!["webp", "gif", "mp4"].includes(outputFormat)) {
			throw new Error("不支持的格式。支持: WebP, GIF, MP4");
		}

		// 先清理文件系统，确保干净的环境
		try {
			await this.cleanupMemory();
		} catch (error) {
			console.warn("[动画合成] 预清理失败，继续执行:", error);
		}

		// 按文件名排序 - 提取文件名中的数字进行自然排序
		const sortedImages = [...images].sort((a, b) => {
			// 提取文件名中的数字部分
			const extractNumbers = (filename: string): number[] => {
				const numbers = filename.match(/\d+/g);
				return numbers ? numbers.map((num) => Number.parseInt(num, 10)) : [];
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

		console.log(
			"[动画合成] 文件排序结果:",
			sortedImages.map((f) => f.name),
		);

		// 定义变量用于清理
		const fileExtensions: string[] = [];
		const createdFiles: string[] = []; // 跟踪创建的文件
		let inputPattern = "";

		try {
			// 写入所有图片文件（使用排序后的顺序，保持原始格式）
			for (let i = 0; i < sortedImages.length; i++) {
				const file = sortedImages[i];

				try {
					const arrayBuffer = await file.arrayBuffer();
					const fileData = new Uint8Array(arrayBuffer);

					// 验证文件数据
					if (!fileData || fileData.length === 0) {
						throw new Error(`文件 ${file.name} 数据为空`);
					}

					// 获取原始文件扩展名
					const originalExt =
						file.name.split(".").pop()?.toLowerCase() || "png";
					const fileName = `frame_${String(i).padStart(3, "0")}.${originalExt}`;
					fileExtensions.push(originalExt);

					// 检查文件是否已存在，如果存在则先删除
					try {
						const existingFiles = await this.ffmpeg.listDir("/");
						const fileExists = existingFiles.some((f) => f.name === fileName);
						if (fileExists) {
							await this.ffmpeg.deleteFile(fileName);
							console.log(`[动画合成] 删除已存在的文件: ${fileName}`);
						}
					} catch (error) {
						// 忽略检查/删除失败
					}

					await this.ffmpeg.writeFile(fileName, fileData);
					createdFiles.push(fileName);
					console.log(
						`[动画合成] 写入帧文件: ${fileName} (${file.name}), 格式: ${originalExt}, 大小: ${fileData.length} bytes`,
					);
				} catch (error) {
					console.error(`[动画合成] 处理文件 ${file.name} 失败:`, error);
					throw new Error(
						`文件 ${file.name} 处理失败: ${error instanceof Error ? error.message : "未知错误"}`,
					);
				}
			}

			console.log(
				`[动画合成] 所有帧文件写入完成，共 ${sortedImages.length} 帧`,
			);
			console.log("[动画合成] 文件格式分布:", fileExtensions);

			// 验证写入的文件
			try {
				const writtenFiles = await this.ffmpeg.listDir("/");
				const frameFiles = writtenFiles
					.filter((f) => f?.name.startsWith("frame_"))
					.sort();
				console.log(
					"[动画合成] 已写入的帧文件:",
					frameFiles.map((f) => f.name),
				);

				if (frameFiles.length !== sortedImages.length) {
					throw new Error(
						`文件写入不完整：期望 ${sortedImages.length} 个文件，实际 ${frameFiles.length} 个`,
					);
				}
			} catch (error) {
				console.warn("[动画合成] 文件验证失败:", error);
			}

			// 确保质量在有效范围内 (1-100)
			quality = Math.max(1, Math.min(100, quality || 75));

			console.log(
				`[动画合成] 开始合成 ${sortedImages.length} 张图片为 ${outputFormat.toUpperCase()} 动画`,
			);
			console.log(`[动画合成] 帧率: ${frameRate}fps, 质量: ${quality}`);
			if (videoCodec) {
				console.log(`[动画合成] 视频编解码器: ${videoCodec}`);
			}

			// 检查输入文件格式是否一致
			const uniqueExts = [...new Set(fileExtensions)];
			console.log(
				`[动画合成] 检测到 ${uniqueExts.length} 种文件格式: ${uniqueExts.join(", ")}`,
			);

			// 如果格式不一致，需要统一转换为PNG
			if (uniqueExts.length > 1) {
				console.log("[动画合成] 格式不一致，将所有文件转换为PNG格式");

				for (let i = 0; i < sortedImages.length; i++) {
					const originalFileName = `frame_${String(i).padStart(3, "0")}.${fileExtensions[i]}`;
					const pngFileName = `frame_${String(i).padStart(3, "0")}.png`;

					// 如果不是PNG格式，则转换
					if (fileExtensions[i] !== "png") {
						try {
							await this.ffmpeg.exec([
								"-i",
								originalFileName,
								"-y", // 覆盖输出文件
								pngFileName,
							]);

							// 删除原始文件
							await this.ffmpeg.deleteFile(originalFileName);
							// 更新创建文件列表
							const index = createdFiles.indexOf(originalFileName);
							if (index > -1) {
								createdFiles[index] = pngFileName;
							}
							console.log(
								`[动画合成] 转换 ${originalFileName} -> ${pngFileName}`,
							);
						} catch (error) {
							console.warn(
								`[动画合成] 转换文件 ${originalFileName} 失败:`,
								error,
							);
							throw new Error(
								`格式转换失败: ${error instanceof Error ? error.message : "未知错误"}`,
							);
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

			// 确保输出文件不存在
			try {
				const existingFiles = await this.ffmpeg.listDir("/");
				const outputExists = existingFiles.some(
					(f) => f && f.name === outputName,
				);
				if (outputExists) {
					await this.ffmpeg.deleteFile(outputName);
					console.log(`[动画合成] 删除已存在的输出文件: ${outputName}`);
				}
			} catch (error) {
				// 忽略检查/删除失败
			}

			// 使用策略模式创建动画
			const strategy = AnimationStrategyFactory.getStrategy(outputFormat);
			const result = await strategy.createAnimation(this.ffmpeg, {
				inputPattern,
				outputName,
				frameRate,
				quality,
				videoCodec,
			});

			// 验证输出文件是否生成（最终检查）
			try {
				const outputFiles = await this.ffmpeg.listDir("/");
				const outputExists = outputFiles.some(
					(f) => f && f.name === outputName,
				);
				console.log(
					`[动画合成] 最终文件检查: ${outputExists ? "成功" : "失败"}`,
				);

				if (!outputExists) {
					// 列出当前所有文件用于调试
					console.error(
						"[动画合成] 当前文件系统内容:",
						outputFiles
							.map((f) => (f?.name ? f.name : "未知文件"))
							.filter(Boolean),
					);
					throw new Error(`输出文件 ${outputName} 未生成 - 所有方法都失败了`);
				}
			} catch (error) {
				console.error("[动画合成] 输出文件验证失败:", error);
				throw new Error(
					`动画合成失败：${error instanceof Error ? error.message : "输出文件未生成"}`,
				);
			}

			// 验证结果
			if (!result || result.length === 0) {
				throw new Error("动画合成失败：输出文件为空");
			}

			console.log(
				`[动画合成] 成功生成动画，大小: ${(result.length / 1024).toFixed(1)} KB`,
			);
			return result;
		} catch (error) {
			console.error("动画创建失败:", error);
			throw error;
		} finally {
			// 清理我们创建的临时文件
			try {
				console.log(`[动画合成] 开始清理 ${createdFiles.length} 个临时文件...`);

				// 清理所有创建的文件
				for (const fileName of createdFiles) {
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
				if (outputFormat === "gif") {
					try {
						await this.ffmpeg.deleteFile("palette.png");
					} catch (e) {
						// 忽略调色板文件删除失败
					}
				}

				console.log("[ffmpeg] 动画创建后临时文件清理完成");
			} catch (cleanupError) {
				console.warn("[ffmpeg] 动画创建后清理临时文件失败:", cleanupError);
			}
		}
	}

	/**
	 * 串行压缩多个图片 - 稳定且内存高效
	 */
	static async convertImagesSerial({
		files,
		format,
		quality = 75,
		width,
		height,
		onProgress,
		onFileComplete,
		processedCount = 0, // 添加一个参数来跟踪已处理的文件数，不受实例重置影响
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
		processedCount?: number; // 已处理的文件数，用于保持进度准确
	}): Promise<
		{
			url: string;
			name: string;
			originalSize: number;
			compressedSize: number;
			processingTime: number;
			format: string;
			quality: number;
		}[]
	> {
		const results: {
			url: string;
			name: string;
			originalSize: number;
			compressedSize: number;
			processingTime: number;
			format: string;
			quality: number;
		}[] = [];

		try {
			console.log("[ffmpeg] 开始串行处理模式 - 稳定且内存高效");

			// 使用主实例进行处理

			const instance = ffm_ins;
			await instance?.reset();
			if (!instance) {
				throw new Error("FFmpeg实例未初始化，请确保在浏览器环境中运行");
			}
			await instance.load();

			// 跟踪本次处理的文件总大小
			let bytesProcessedSinceReset = 0;
			// 设置重置阈值为100MB
			const resetThresholdBytes = 100 * 1024 * 1024;

			console.log(
				`[ffmpeg] 设置实例重置阈值: 处理 ${Math.round(resetThresholdBytes / (1024 * 1024))} MB 数据后重置`,
			);

			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				const startTime = performance.now();

				try {
					// 检查是否需要重置实例 - 基于处理的文件大小
					if (bytesProcessedSinceReset >= resetThresholdBytes) {
						console.log(
							`[ffmpeg] 已处理 ${Math.round(bytesProcessedSinceReset / (1024 * 1024))} MB 数据，重置实例以释放内存`,
						);
						await instance.reset();
						await instance.load(); // 重新加载
						bytesProcessedSinceReset = 0; // 重置字节计数器
					}

					const baseName = file.name.replace(/\.[^.]+$/, "");
					// 清理文件名中的非法字符
					const cleanBaseName = baseName.replace(/[<>:"/\\|?*]/g, "_");
					const outputName = `${cleanBaseName}_compressed.${format}`;

					// 处理单个文件
					const compressed: Uint8Array = await instance.convertImage({
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

					const mimeMap: Record<string, string> = {
						webp: "image/webp",
						png: "image/png",
						jpg: "image/jpeg",
						jpeg: "image/jpeg",
						avif: "image/avif",
					};

					const blob = new Blob([compressed], {
						type: mimeMap[format] || "application/octet-stream",
					});

					// 验证Blob是否正确创建
					if (blob.size === 0) {
						console.error(
							`[ffmpeg] 警告: 压缩后的Blob大小为0，文件: ${file.name}`,
						);
						throw new Error("压缩失败：生成的文件大小为0");
					}

					// 创建Blob URL并验证
					let blobUrl: string;
					try {
						blobUrl = URL.createObjectURL(blob);
						console.log(
							`[ffmpeg] 创建Blob URL成功: ${blobUrl.substring(0, 50)}...`,
						);
					} catch (error) {
						console.error("[ffmpeg] 创建Blob URL失败:", error);
						throw new Error("下载链接创建失败");
					}

					const result = {
						url: blobUrl,
						name: outputName,
						originalSize: file.originalSize,
						compressedSize: blob.size,
						processingTime: performance.now() - startTime,
						format,
						quality,
					};

					console.log(
						`[ffmpeg] 文件处理完成: ${file.name}, 原始: ${(result.originalSize / 1024).toFixed(1)} KB, 压缩后: ${(result.compressedSize / 1024).toFixed(1)} KB, 压缩率: ${(((result.originalSize - result.compressedSize) / result.originalSize) * 100).toFixed(1)}%`,
					);

					results.push(result);
					onFileComplete?.(result);

					// 更新进度 - 使用全局计数来确保进度准确，即使实例被重置
					const completed = i + 1;
					const totalCompleted = processedCount + completed;
					onProgress?.(totalCompleted, files.length + processedCount);

					// 累加处理的文件大小
					bytesProcessedSinceReset += file.data.byteLength;

					// 每次处理完一个文件后清理内存，不管文件大小
					await instance.cleanupMemory();

					// 减少ArrayBuffer的引用，帮助垃圾回收
					// @ts-ignore
					file.data = null;

					// 增加每个文件处理后的短暂延迟，给浏览器喘息的机会
					if (i < files.length - 1) {
						await new Promise((resolve) => setTimeout(resolve, 50));
					}
				} catch (error) {
					console.error(`串行处理文件 ${file.name} 失败:`, error);

					// 尝试重置实例并继续处理其他文件
					try {
						console.warn("[ffmpeg] 处理文件失败，重置实例后继续...");
						await instance.reset();
						await instance.load();
						bytesProcessedSinceReset = 0;

						// 如果是最后一个文件，则抛出错误，否则继续处理
						if (i === files.length - 1) {
							throw error;
						}
					} catch (resetError) {
						console.error("[ffmpeg] 重置实例失败，中断处理:", resetError);
						throw error;
					}
				}
			}

			return results;
		} finally {
			// 调用清理方法
			try {
				const instance = ffm_ins;
				if (instance) {
					await instance.cleanupMemory();
				}
			} catch (e) {
				console.warn("[ffmpeg] 最终清理失败:", e);
			}
		}
	}
}

// 只在浏览器环境中创建实例，避免在Node.js测试环境中报错
const ffm_ins = isBrowser() && !process.env.VITEST ? new FFMPEG() : null;

export default ffm_ins;
export { FFMPEG };

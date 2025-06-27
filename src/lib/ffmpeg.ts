import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { AnimationStrategyFactory } from "./strategy/animations";
import { isBrowser } from "./utils";
import { InputFileType, OutputType } from "./fileUtils";
import "./strategy/conversions";
import "./strategy/upscale";
import { toast } from "sonner";

export type FFMPEGOptions = {
	quality?: number;
	width?: number;
	height?: number;
	frameRate?: number;
	videoCodec?: string;
	format?: string;
	outputSuffixName?: string;
};

// Note: Originally there was a window.gc declaration here, but this is a non-standard API and has been removed

class FFMPEG {
	private ffmpeg: FFmpeg | null = null;
	private isLoaded = false;
	private loadingPromise: Promise<void> | null = null;
	private _processCount = 0;
	private _processedBytes = 0; // Track total bytes of processed files

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
		if (!this.ffmpeg) throw new Error("ffmpeg doesn't exist");
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
	 * Reset FFmpeg instance
	 * Use when encountering serious errors or need complete cleanup
	 */
	async reset(): Promise<void> {
		try {
			// Try to clean up one last time
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
							} catch (_) {
								// Ignore errors
							}
						}
					}
				} catch (_) {
					// Ignore errors
				}
			}
		} catch (_) {
		} finally {
			// Recreate FFmpeg instance
			if (isBrowser()) {
				this.ffmpeg = new FFmpeg();
				this.isLoaded = false;
				this.loadingPromise = null;
				this._processCount = 0; // Reset process count
				this._processedBytes = 0; // Reset processed bytes
			}
		}
	}

	/**
	 * Create animation from multiple images - unified entry point
	 * @param images Array of image files
	 * @param outputName Output filename
	 * @param frameRate Frame rate, default 10fps
	 * @param quality Quality, default 75
	 * @param videoCodec Video codec, default libx264 (MP4) or libvpx-vp9 (WebM)
	 * @param format Output format (webp/gif/mp4/webm)
	 */
	async processMultiDataToSingleData({
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

		if (!this.ffmpeg) throw new Error("ffmpeg not initialized");
		if (images.length === 0) throw new Error("At least one image is required");

		// Get output format
		const outputFormat = format?.toLowerCase() || "webp";

		// Validate format support
		if (!["webp", "gif", "mp4"].includes(outputFormat)) {
			throw new Error("Unsupported format. Supported: WebP, GIF, MP4");
		}

		// Sort images by filename (natural sort)
		const sortedImages = [...images].sort((a, b) => {
			const extractNumbers = (filename: string): number[] => {
				const numbers = filename.match(/\d+/g);
				return numbers ? numbers.map((num) => Number.parseInt(num, 10)) : [];
			};

			const aNumbers = extractNumbers(a.name);
			const bNumbers = extractNumbers(b.name);

			for (let i = 0; i < Math.max(aNumbers.length, bNumbers.length); i++) {
				const aNum = aNumbers[i] || 0;
				const bNum = bNumbers[i] || 0;
				if (aNum !== bNum) return aNum - bNum;
			}

			return a.name.localeCompare(b.name);
		});

		const createdFiles: string[] = [];

		try {
			// Write all image files
			for (let i = 0; i < sortedImages.length; i++) {
				const file = sortedImages[i];
				const arrayBuffer = await file.arrayBuffer();
				const fileData = new Uint8Array(arrayBuffer);

				if (!fileData || fileData.length === 0) {
					throw new Error(`File ${file.name} data is empty`);
				}

				const originalExt = file.name.split(".").pop()?.toLowerCase() || "png";
				const fileName = `frame_${String(i).padStart(3, "0")}.${originalExt}`;

				// Clean up existing file if any
				try {
					const existingFiles = await this.ffmpeg.listDir("/");
					if (existingFiles.some((f) => f.name === fileName)) {
						await this.ffmpeg.deleteFile(fileName);
					}
				} catch (_) {
					// Ignore cleanup errors
				}

				await this.ffmpeg.writeFile(fileName, fileData);
				createdFiles.push(fileName);
			}

			// Ensure quality is within valid range
			quality = Math.max(1, Math.min(100, quality || 75));

			// Check if formats are consistent, convert to PNG if not
			const fileExtensions = createdFiles.map(
				(f) => f.split(".").pop() || "png",
			);
			const uniqueExts = [...new Set(fileExtensions)];

			if (uniqueExts.length > 1) {
				// Convert all to PNG for consistency
				for (let i = 0; i < createdFiles.length; i++) {
					const originalFileName = createdFiles[i];
					const pngFileName = `frame_${String(i).padStart(3, "0")}.png`;

					if (fileExtensions[i] !== "png") {
						await this.ffmpeg.exec(["-i", originalFileName, "-y", pngFileName]);
						await this.ffmpeg.deleteFile(originalFileName);
						createdFiles[i] = pngFileName;
					}
				}
			}

			// Clean up existing output file
			try {
				const existingFiles = await this.ffmpeg.listDir("/");
				if (existingFiles.some((f) => f && f.name === outputName)) {
					await this.ffmpeg.deleteFile(outputName);
				}
			} catch (_) {
				// Ignore cleanup errors
			}

			// Create animation using strategy pattern
			const strategy = AnimationStrategyFactory.getStrategy(outputFormat);
			const inputPattern =
				uniqueExts.length > 1
					? "frame_%03d.png"
					: `frame_%03d.${uniqueExts[0]}`;

			const result = await strategy.createAnimation(this.ffmpeg, {
				inputPattern,
				outputName,
				frameRate,
				quality,
				videoCodec,
			});

			// Validate result
			if (!result || result.length === 0) {
				throw new Error("Animation creation failed: output file is empty");
			}

			return result;
		} finally {
			// Clean up all temporary files
			try {
				for (const fileName of createdFiles) {
					try {
						await this.ffmpeg.deleteFile(fileName);
					} catch (_) {
						// Ignore individual file deletion failures
					}
				}

				// Delete output file
				try {
					await this.ffmpeg.deleteFile(outputName);
				} catch (_) {
					// Ignore output file deletion failures
				}

				// Delete palette file for GIF
				if (outputFormat === "gif") {
					try {
						await this.ffmpeg.deleteFile("palette.png");
					} catch (_) {
						// Ignore palette file deletion failures
					}
				}
			} catch (_) {
				// Ignore cleanup errors
			}
		}
	}

	async processMultiDataToMultiData(
		input: InputFileType[],
		callback?: (current: number, total: number) => void,
	): Promise<OutputType[]> {
		await this.load();

		if (!this.ffmpeg) throw new Error("ffmpeg not initialized");
		if (input.length === 0) throw new Error("No files to process");

		const results: OutputType[] = [];
		let processedCount = 0;

		try {
			await this.reset();
			await this.load();

			for (const file of input) {
				const startTime = performance.now();

				try {
					// 检查是否标记为不能处理，如果是则跳过
					if (file.cannotDo) {
						toast.error(`unsupported conversion: ${file.name}`);
						processedCount++;
						callback?.(processedCount, input.length);
						continue;
					}

					// 重置实例（如果需要）
					if (this._processedBytes >= 100 * 1024 * 1024) {
						// 100MB
						await this.reset();
						await this.load();
					}

					// 检查是否有ffmpeg命令
					if (!file.ffmpeg_command) {
						throw new Error(`File ${file.name} does not have ffmpeg_command`);
					}

					if (!file.buffer) {
						// 如果没有buffer，从原始文件读取
						const arrayBuffer = await file.originalFile.arrayBuffer();
						file.buffer = new Uint8Array(arrayBuffer);
					}
					await this.ffmpeg.writeFile(file.inputName, file.buffer);

					// 处理ffmpeg命令参数数组 - 替换占位符

					// 执行ffmpeg命令
					console.info(file.ffmpeg_command.join(" "));
					await this.ffmpeg.exec(file.ffmpeg_command);
					const outputData = (await this.ffmpeg.readFile(
						file.outputName,
					)) as Uint8Array;
					if (!outputData || outputData.length === 0) {
						throw new Error(
							`Processing failed: output file ${file.outputName} is empty`,
						);
					}

					// 创建结果对象
					const blob = new Blob([outputData]);
					const url = URL.createObjectURL(blob);

					const result: OutputType = {
						name: file.outputName,
						url,
						size: blob.size,
						width: file.width || 0,
						height: file.height || 0,
						processingTime: performance.now() - startTime,
						status: "success",
					};

					results.push(result);
					processedCount++;

					callback?.(processedCount, input.length);

					// 更新计数器
					this._processCount++;
					this._processedBytes += file.buffer.byteLength;

					// 清理临时文件
					try {
						await this.ffmpeg.deleteFile(file.inputName);
						await this.ffmpeg.deleteFile(file.outputName);
					} catch (error) {
						console.warn("Failed to clean up temporary files:", error);
					}

					// 给浏览器一些时间进行垃圾回收
					if (this._processCount % 3 === 0) {
						await new Promise((resolve) => setTimeout(resolve, 50));
					}
				} catch (error) {
					console.error(`Processing failed for file ${file.name}:`, error);

					// 继续处理其他文件，但记录错误
					const errorResult: OutputType = {
						name: file.name,
						url: "",
						size: 0,
						width: 0,
						height: 0,
						processingTime: performance.now() - startTime,
						status: "error",
					};
					results.push(errorResult);

					// 重置实例以避免状态污染
					try {
						await this.reset();
						await this.load();
					} catch (resetError) {
						console.error("Failed to reset ffmpeg instance:", resetError);
						throw error; // 如果重置失败，则抛出原始错误
					}
				}
			}

			return results;
		} catch (error) {
			console.error("Processing failed:", error);
			throw error;
		}
	}

	async processSingleDataToMultiData(
		input: InputFileType,
	): Promise<OutputType[]> {
		await this.load();

		if (!this.ffmpeg) throw new Error("ffmpeg not initialized");
		if (!input) throw new Error("No input file");
		return [];
	}
}
const ffm_ins = new FFMPEG();

export default ffm_ins;
export { FFMPEG };

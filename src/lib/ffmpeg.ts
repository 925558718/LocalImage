import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { getType, isBrowser } from "./utils";
import { AnimationStrategyFactory } from "./animations";
import { ConversionStrategyFactory } from "./conversions";
import { CompressionResult, FileInput } from "./types";
import { ImageFormatType } from "./conversions/ConversionStrategy";
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
							} catch (e) {
								// Ignore errors
							}
						}
					}
				} catch (e) {
					// Ignore errors
				}
			}
		} catch (error) {
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
	 * Convert and compress images - supports single and batch processing
	 * @param input Array of files to process
	 * @param format Output format (e.g., 'jpg', 'png', 'webp')
	 * @param outputName Custom output filename (optional, defaults to source filename)
	 * @param quality Compression quality (0-100, default 75)
	 * @param width Optional output width
	 * @param height Optional output height
	 * @param onProgress Progress callback for batch processing
	 * @param onFileComplete File completion callback for batch processing
	 */
	async convertImages({
		input,
		format,
		outputName,
		quality = 75,
		width,
		height,
		onProgress,
		onFileComplete,
	}: {
		input: FileInput[];
		format: string;
		outputName?: string;
		quality?: number;
		width?: number;
		height?: number;
		onProgress?: (completed: number, total: number) => void;
		onFileComplete?: (result: CompressionResult) => void;
	}): Promise<CompressionResult[]> {
		await this.load();

		if (!this.ffmpeg) throw new Error("ffmpeg not initialized");
		if (input.length === 0) throw new Error("No files to process");

		const results: CompressionResult[] = [];
		let totalCompleted = 0; // Track total completed files across resets

		try {
			await this.reset();
			await this.load();

			for (let i = 0; i < input.length; i++) {
				const file = input[i];
				const startTime = performance.now();

				try {
					// Reset instance if needed based on processed bytes
					if (this._processedBytes >= 100 * 1024 * 1024) { // 100MB
						await this.reset();
						await this.load();
					}

					// Generate output filename
					const baseName = file.name.replace(/\.[^.]+$/, "");
					const cleanBaseName = baseName.replace(/[<>:"/\\|?*]/g, "_");
					
					// Use custom output name or default to source filename
					const finalOutputName = outputName || `${cleanBaseName}_compressed`;
					const sourceExt = getType(file.name);
					const targetExt = format.toLowerCase() as ImageFormatType;
					const singleOutputName = `${finalOutputName}.${targetExt}`;

					// Process single file
					if (!ConversionStrategyFactory.canConvert(sourceExt, targetExt)) {
						throw new Error(`unsupported format: ${sourceExt} -> ${targetExt}`);
					}

					const inputFileName = `input_image.${sourceExt}`;
					const fileData = new Uint8Array(file.data);
					
					await this.ffmpeg.writeFile(inputFileName, fileData);

					try {
						const strategy = ConversionStrategyFactory.getStrategy(targetExt);
						const args = strategy.getArgs(inputFileName, singleOutputName, quality, width, height);
						console.log("[ffmpeg] args", args);

						await this.ffmpeg.exec(args);
						const compressed = (await this.ffmpeg.readFile(singleOutputName)) as Uint8Array;

						if (!compressed || compressed.length === 0) {
							throw new Error("Compression failed: compression result is empty");
						}

						// Create result
						const blob = new Blob([compressed], { type: `image/${targetExt}` });
						if (blob.size === 0) {
							throw new Error("Compression failed: generated file size is 0");
						}

						const blobUrl = URL.createObjectURL(blob);
						const result: CompressionResult = {
							url: blobUrl,
							name: singleOutputName,
							originalSize: file.originalSize,
							compressedSize: blob.size,
							processingTime: performance.now() - startTime,
							format: targetExt,
							quality,
						};

						results.push(result);
						onFileComplete?.(result);

						// Update progress with correct total completed count
						totalCompleted++;
						onProgress?.(totalCompleted, input.length);

						// Update instance counters
						this._processCount++;
						this._processedBytes += file.data.byteLength;
						
						// Reduce ArrayBuffer reference to help garbage collection
						// @ts-ignore
						file.data = null;

						// Give browser time for automatic garbage collection every 3 files
						if (this._processCount % 3 === 0) {
							await new Promise((resolve) => setTimeout(resolve, 50));
						}

					} finally {
						// Clean up temporary files
						try {
							if (inputFileName && inputFileName !== singleOutputName) {
								await this.ffmpeg.deleteFile(inputFileName);
							}
							if (singleOutputName) {
								await this.ffmpeg.deleteFile(singleOutputName);
							}
						} catch (error) {
							// Ignore cleanup errors
						}
					}

					// Brief delay for browser
					if (i < input.length - 1) {
						await new Promise((resolve) => setTimeout(resolve, 50));
					}
				} catch (error) {
					// Reset instance and continue or throw
					try {
						await this.reset();
						await this.load();

						if (i === input.length - 1) {
							throw error;
						}
					} catch (resetError) {
						throw error;
					}
				}
			}

			return results;
		} finally {
			// Cleanup handled by individual file processing
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
				} catch (error) {
					// Ignore cleanup errors
				}

				await this.ffmpeg.writeFile(fileName, fileData);
				createdFiles.push(fileName);
			}

			// Ensure quality is within valid range
			quality = Math.max(1, Math.min(100, quality || 75));

			// Check if formats are consistent, convert to PNG if not
			const fileExtensions = createdFiles.map(f => f.split('.').pop() || 'png');
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
			} catch (error) {
				// Ignore cleanup errors
			}

			// Create animation using strategy pattern
			const strategy = AnimationStrategyFactory.getStrategy(outputFormat);
			const inputPattern = uniqueExts.length > 1 ? "frame_%03d.png" : `frame_%03d.${uniqueExts[0]}`;
			
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
					} catch (e) {
						// Ignore individual file deletion failures
					}
				}

				// Delete output file
				try {
					await this.ffmpeg.deleteFile(outputName);
				} catch (e) {
					// Ignore output file deletion failures
				}

				// Delete palette file for GIF
				if (outputFormat === "gif") {
					try {
						await this.ffmpeg.deleteFile("palette.png");
					} catch (e) {
						// Ignore palette file deletion failures
					}
				}
			} catch (cleanupError) {
				// Ignore cleanup errors
			}
		}
	}

}

// Only create instance in browser environment to avoid errors in Node.js test environment
const ffm_ins = isBrowser() && !process.env.VITEST ? new FFMPEG() : null;

export default ffm_ins;
export { FFMPEG };

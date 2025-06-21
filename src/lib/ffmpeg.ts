import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { getType, isBrowser } from "./utils";
import { AnimationStrategyFactory } from "./animations";
import { ConversionStrategyFactory } from "./conversions";
import { CompressionResult, FileInput } from "./types";
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
	 * Image format conversion and compression, supports resolution adjustment and avif format
	 * @param input Image URL, Uint8Array or ArrayBuffer
	 * @param outputName Output filename (e.g., output.jpg, output.webp, output.avif)
	 * @param quality Compression quality (0-100, default 75, effective for webp/jpg/avif)
	 * @param width Optional output width
	 * @param height Optional output height
	 */
	async convertImage({
		input,
		outputName,
		quality = 75,
		width,
		height,
	}: {
		input: FileInput;
		outputName: string;
		quality?: number;
		width?: number;
		height?: number;
	}): Promise<Uint8Array> {
		await this.load();
		// Get source format, ensure it's a valid string
		const sourceExt = getType(input.name);

		// Get target format, ensure it's a valid string
		const targetExt = getType(outputName);

		// Validate format conversion support
		if (!ConversionStrategyFactory.canConvert(sourceExt, targetExt)) {
			throw new Error(`unsupported format: ${sourceExt} -> ${targetExt}`);
		}

		// Auto-detect input format
		const inputFileName = `input_image.${sourceExt}`;

		// Write input file
		const fileData = new Uint8Array(input.data);
		if (!this.ffmpeg) throw new Error("ffmpeg not initialized");
		await this.ffmpeg.writeFile(inputFileName, fileData);

		try {
			// Use strategy pattern to get conversion parameters
			const strategy = ConversionStrategyFactory.getStrategy(targetExt);
			const args = strategy.getArgs(
				inputFileName,
				outputName,
				quality,
				width,
				height,
			);
			console.log("[ffmpeg] args", args);

			await this.ffmpeg.exec(args);
			const result = (await this.ffmpeg.readFile(outputName)) as Uint8Array;

			// Validate compression result
			if (!result || result.length === 0) {
				throw new Error("Compression failed: compression result is empty");
			}

			return result;
		} finally {
			// Update process count
			this._processCount++;

			// Accumulate processed file size
			this._processedBytes += fileData.length;

			// Clean up temporary files to prevent memory leaks
			try {
				// Only delete files we explicitly created
				if (inputFileName && inputFileName !== outputName) {
					await this.ffmpeg.deleteFile(inputFileName);
				}
				if (outputName) {
					await this.ffmpeg.deleteFile(outputName);
				}

				// Give browser time for automatic garbage collection every 3 files
				if (this._processCount % 3 === 0) {
					await new Promise((resolve) => setTimeout(resolve, 50));
				}
			} catch (error) {
				// Ignore cleanup errors
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

		// Get output format, prioritize specified format, then extract from output filename
		const outputFormat = format?.toLowerCase() || "webp";

		// Validate format support
		if (!["webp", "gif", "mp4"].includes(outputFormat)) {
			throw new Error("Unsupported format. Supported: WebP, GIF, MP4");
		}

		// Sort by filename - extract numbers from filename for natural sorting
		const sortedImages = [...images].sort((a, b) => {
			// Extract numeric parts from filename
			const extractNumbers = (filename: string): number[] => {
				const numbers = filename.match(/\d+/g);
				return numbers ? numbers.map((num) => Number.parseInt(num, 10)) : [];
			};

			const aNumbers = extractNumbers(a.name);
			const bNumbers = extractNumbers(b.name);

			// Compare by numeric sequence
			for (let i = 0; i < Math.max(aNumbers.length, bNumbers.length); i++) {
				const aNum = aNumbers[i] || 0;
				const bNum = bNumbers[i] || 0;
				if (aNum !== bNum) {
					return aNum - bNum;
				}
			}

			// If numbers are the same, sort by string
			return a.name.localeCompare(b.name);
		});

		// Define variables for cleanup
		const fileExtensions: string[] = [];
		const createdFiles: string[] = []; // Track created files
		let inputPattern = "";

		try {
			// Write all image files (using sorted order, maintaining original format)
			for (let i = 0; i < sortedImages.length; i++) {
				const file = sortedImages[i];

				try {
					const arrayBuffer = await file.arrayBuffer();
					const fileData = new Uint8Array(arrayBuffer);

					// Validate file data
					if (!fileData || fileData.length === 0) {
						throw new Error(`File ${file.name} data is empty`);
					}

					// Get original file extension
					const originalExt =
						file.name.split(".").pop()?.toLowerCase() || "png";
					const fileName = `frame_${String(i).padStart(3, "0")}.${originalExt}`;
					fileExtensions.push(originalExt);

					// Check if file already exists, delete if it does
					try {
						const existingFiles = await this.ffmpeg.listDir("/");
						const fileExists = existingFiles.some((f) => f.name === fileName);
						if (fileExists) {
							await this.ffmpeg.deleteFile(fileName);
						}
					} catch (error) {
						// Ignore check/delete failures
					}

					await this.ffmpeg.writeFile(fileName, fileData);
					createdFiles.push(fileName);
				} catch (error) {
					throw new Error(
						`File ${file.name} processing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
					);
				}
			}

			// Validate written files
			try {
				const writtenFiles = await this.ffmpeg.listDir("/");
				const frameFiles = writtenFiles
					.filter((f) => f?.name.startsWith("frame_"))
					.sort();

				if (frameFiles.length !== sortedImages.length) {
					throw new Error(
						`File writing incomplete: expected ${sortedImages.length} files, actual ${frameFiles.length}`,
					);
				}
			} catch (error) {
				// Ignore validation errors
			}

			// Ensure quality is within valid range (1-100)
			quality = Math.max(1, Math.min(100, quality || 75));

			// Check if input file formats are consistent
			const uniqueExts = [...new Set(fileExtensions)];

			// If formats are inconsistent, need to convert all to PNG
			if (uniqueExts.length > 1) {
				for (let i = 0; i < sortedImages.length; i++) {
					const originalFileName = `frame_${String(i).padStart(3, "0")}.${fileExtensions[i]}`;
					const pngFileName = `frame_${String(i).padStart(3, "0")}.png`;

					// Convert if not PNG format
					if (fileExtensions[i] !== "png") {
						try {
							await this.ffmpeg.exec([
								"-i",
								originalFileName,
								"-y", // Overwrite output file
								pngFileName,
							]);

							// Delete original file
							await this.ffmpeg.deleteFile(originalFileName);
							// Update created files list
							const index = createdFiles.indexOf(originalFileName);
							if (index > -1) {
								createdFiles[index] = pngFileName;
							}
						} catch (error) {
							throw new Error(
								`Format conversion failed: ${error instanceof Error ? error.message : "Unknown error"}`,
							);
						}
					}
				}

				// Update input pattern to PNG
				inputPattern = "frame_%03d.png";
			} else {
				// Consistent format
				inputPattern = `frame_%03d.${uniqueExts[0]}`;
			}

			// Ensure output file doesn't exist
			try {
				const existingFiles = await this.ffmpeg.listDir("/");
				const outputExists = existingFiles.some(
					(f) => f && f.name === outputName,
				);
				if (outputExists) {
					await this.ffmpeg.deleteFile(outputName);
				}
			} catch (error) {
				// Ignore check/delete failures
			}

			// Use strategy pattern to create animation
			const strategy = AnimationStrategyFactory.getStrategy(outputFormat);
			const result = await strategy.createAnimation(this.ffmpeg, {
				inputPattern,
				outputName,
				frameRate,
				quality,
				videoCodec,
			});

			// Validate output file generation (final check)
			try {
				const outputFiles = await this.ffmpeg.listDir("/");
				const outputExists = outputFiles.some(
					(f) => f && f.name === outputName,
				);

				if (!outputExists) {
					throw new Error(`Output file ${outputName} not generated - all methods failed`);
				}
			} catch (error) {
				throw new Error(
					`Animation creation failed: ${error instanceof Error ? error.message : "Output file not generated"}`,
				);
			}

			// Validate result
			if (!result || result.length === 0) {
				throw new Error("Animation creation failed: output file is empty");
			}

			return result;
		} catch (error) {
			throw error;
		} finally {
			// Clean up temporary files we created
			try {
				// Clean up all created files
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

				// If GIF, also delete palette file
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

	/**
	 * Serial compression of multiple images - stable and memory efficient
	 */
	static async convertImagesSerial({
		files,
		format,
		quality = 75,
		width,
		height,
		onProgress,
		onFileComplete,
		processedCount = 0, // Add parameter to track processed files, unaffected by instance reset
	}: {
		files: FileInput[];
		format: string;
		quality?: number;
		width?: number;
		height?: number;
		onProgress?: (completed: number, total: number) => void;
		onFileComplete?: (result: CompressionResult) => void;
		processedCount?: number; // Number of processed files, for maintaining accurate progress
	}): Promise<CompressionResult[]> {
		const results: CompressionResult[] = [];

		try {
			const instance = ffm_ins;
			await instance?.reset();
			if (!instance) {
				throw new Error("FFmpeg instance not initialized, please ensure running in browser environment");
			}
			await instance.load();

			// Track total file size processed since reset
			let bytesProcessedSinceReset = 0;
			// Set reset threshold to 100MB
			const resetThresholdBytes = 100 * 1024 * 1024;

			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				const startTime = performance.now();

				try {
					// Check if instance reset is needed - based on processed file size
					if (bytesProcessedSinceReset >= resetThresholdBytes) {
						await instance.reset();
						await instance.load(); // Reload
						bytesProcessedSinceReset = 0; // Reset byte counter
					}

					const baseName = file.name.replace(/\.[^.]+$/, "");
					// Clean illegal characters from filename
					const cleanBaseName = baseName.replace(/[<>:"/\\|?*]/g, "_");
					const outputName = `${cleanBaseName}_compressed.${format}`;

					// Process single file
					const compressed: Uint8Array = await instance.convertImage({
						input: file,
						outputName,
						quality,
						width,
						height,
					});

					// Validate compression result
					if (!compressed || compressed.length === 0) {
						throw new Error(`Compression failed: ${file.name} compression result is empty`);
					}
					const blob = new Blob([compressed], {
						type: `image/${format}`,
					});

					// Validate Blob creation
					if (blob.size === 0) {
						throw new Error("Compression failed: generated file size is 0");
					}

					// Create Blob URL and validate
					let blobUrl: string;
					try {
						blobUrl = URL.createObjectURL(blob);
					} catch (error) {
						throw new Error("Download link creation failed");
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

					results.push(result);
					onFileComplete?.(result);

					// Update progress - use global count to ensure accurate progress even if instance is reset
					const completed = i + 1;
					const totalCompleted = processedCount + completed;
					onProgress?.(totalCompleted, files.length + processedCount);

					// Accumulate processed file size
					bytesProcessedSinceReset += file.data.byteLength;

					// Reduce ArrayBuffer reference to help garbage collection
					// @ts-ignore
					file.data = null;

					// Add brief delay after each file processing to give browser breathing room
					if (i < files.length - 1) {
						await new Promise((resolve) => setTimeout(resolve, 50));
					}
				} catch (error) {
					// Try to reset instance and continue processing other files
					try {
						await instance.reset();
						await instance.load();
						bytesProcessedSinceReset = 0;

						// If it's the last file, throw error, otherwise continue processing
						if (i === files.length - 1) {
							throw error;
						}
					} catch (resetError) {
						throw error;
					}
				}
			}

			return results;
		} finally {
		}
	}
}

// Only create instance in browser environment to avoid errors in Node.js test environment
const ffm_ins = isBrowser() && !process.env.VITEST ? new FFMPEG() : null;

export default ffm_ins;
export { FFMPEG };

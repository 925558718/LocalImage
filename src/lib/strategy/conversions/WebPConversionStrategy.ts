import { ConvertStrategy, ConvertOptions } from "../index";
import { InputFileType } from "../../fileUtils";
import { checkFormatConversion, ImageFormatType } from "./ConversionStrategy";

/**
 * WebP转换策略
 * 处理WebP格式的图像转换与压缩
 */
export class WebPConversionStrategy implements ConvertStrategy {
	/**
	 * 判断是否可以处理给定的输入和选项
	 * @param input 输入文件信息
	 * @param options 转换选项
	 * @returns 是否能够处理
	 */
	match(input: InputFileType, options: ConvertOptions): boolean {
		// 只有输出格式为webp时才使用此策略
		if (options.format?.toLowerCase() !== "webp") {
			return false;
		}

		// 使用checkFormatConversion检查格式转换并设置cannotDo标记
		return checkFormatConversion(input, options.format as ImageFormatType);
	}

	/**
	 * 生成FFmpeg转换命令
	 * @param input 输入文件信息
	 * @param options 转换选项
	 * @returns FFmpeg命令参数数组
	 */
	generateFFMPEGCommand(
		input: InputFileType,
		options: ConvertOptions,
	): string[] {
		const args: string[] = [];
		// 生成输入文件名和输出文件名
		const inputFileName = `${input.name}.${input.format || "tmp"}`;
		const outputFileName = `${input.name}_${options.outputSuffixName || "output"}.webp`;
		input.outputName = outputFileName;

		// 输入文件
		args.push("-i", inputFileName);

		const isGif = input.format?.toLowerCase() === "gif";

		// 分辨率缩放
		if (options.width || options.height) {
			let scaleArg = "scale=";
			scaleArg += options.width ? `${options.width}:` : "-1:";
			scaleArg += options.height ? `${options.height}` : "-1";
			args.push("-vf", scaleArg);
		}

		// 对于GIF使用libwebp_anim编码器，其他使用libwebp
		args.push("-c:v", isGif ? "libwebp_anim" : "libwebp");

		// WebP质量控制（直接使用0-100的质量值）
		if (options.compressionLevel !== undefined) {
			args.push("-quality", String(options.compressionLevel));
		}

		// 确保使用有损压缩
		args.push("-lossless", "0");

		// 使用最佳压缩方法
		args.push("-method", "6");

		// 输出文件
		args.push(outputFileName);
		return args;
	}
}

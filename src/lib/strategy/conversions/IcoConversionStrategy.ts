import { ConvertStrategy, ConvertOptions } from "../index";
import { InputFileType } from "../../fileUtils";
import { checkFormatConversion, ImageFormatType } from "./ConversionStrategy";

/**
 * ICO转换策略 - 专门用于ICO格式的转换
 * ICO文件通常用于图标，支持多种尺寸和位深度
 *
 * FFmpeg参数说明：
 * - -c:v png: 使用PNG编码器，ICO支持PNG格式
 * - -pix_fmt rgba: 32位RGBA格式，支持透明度
 * - -frames:v 1: 确保输出为单帧（ICO不支持动画）
 * - -compression_level: PNG压缩级别（1-9，数字越小压缩率越高）
 */
export class IcoConversionStrategy implements ConvertStrategy {
	/**
	 * 判断是否可以处理给定的输入和选项
	 * @param input 输入文件信息
	 * @param options 转换选项
	 * @returns 是否能够处理
	 */
	match(input: InputFileType, options: ConvertOptions): boolean {
		// 只有输出格式为ico时才使用此策略
		if (options.format?.toLowerCase() !== "ico") {
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
		const outputFileName = `${input.name}_${options.outputSuffixName || "output"}.ico`;
		input.outputName = outputFileName;
		
		// 输入文件
		args.push("-i", inputFileName);

		// ICO文件通常需要特定的尺寸，如果没有指定，使用常见的图标尺寸
		if (options.width || options.height) {
			let scaleArg = "scale=";
			scaleArg += options.width ? `${options.width}:` : "-1:";
			scaleArg += options.height ? `${options.height}` : "-1";
			args.push("-vf", scaleArg);
		} else {
			// 默认使用32x32尺寸，这是最常见的图标尺寸
			// 也可以考虑16x16, 48x48等常见图标尺寸
			args.push("-vf", "scale=32:32");
		}

		// ICO格式的特殊参数
		// - 使用PNG编码器，因为ICO支持PNG格式
		args.push("-c:v", "png");

		// 设置位深度为32位（支持透明度）
		args.push("-pix_fmt", "rgba");

		// 对于ICO文件，质量参数主要用于PNG压缩级别
		// ICO文件通常不需要很高的压缩，保持较好的质量
		// 压缩级别范围：1-9，1为最高压缩率，9为最低压缩率
		if (options.compressionLevel !== undefined) {
			const compressionLevel = Math.max(1, Math.round(6 - (options.compressionLevel / 100) * 5));
			args.push("-compression_level", compressionLevel.toString());
		}

		// 确保输出为单帧（ICO不支持动画）
		args.push("-frames:v", "1");

		// 输出文件
		args.push(outputFileName);
		
		return args;
	}
}

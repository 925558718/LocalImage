import { InputFileType } from "../../fileUtils";
import { ConvertOptions, ConvertStrategy } from "../index";
import { checkFormatConversion, ImageFormatType } from "./ConversionStrategy";

/**
 * PNG转换策略 - 主要用于PNG格式的转换
 * 不应用特殊的压缩参数，仅处理缩放
 */
export class PngConversionStrategy implements ConvertStrategy {
	/**
	 * 判断是否可以处理给定的输入和选项
	 * @param input 输入文件信息
	 * @param options 转换选项
	 * @returns 是否能够处理
	 */
	match(input: InputFileType, options: ConvertOptions): boolean {
		// 只有输出格式为png时才使用此策略
		if (options.format?.toLowerCase() !== "png") {
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
		const outputFileName = `${input.name}_${options.outputSuffixName || "output"}.png`;
		input.outputName = outputFileName;

		// 输入文件
		args.push("-i", inputFileName);

		// 分辨率缩放
		if (options.width || options.height) {
			let scaleArg = "scale=";
			scaleArg += options.width ? `${options.width}:` : "-1:";
			scaleArg += options.height ? `${options.height}` : "-1";
			args.push("-vf", scaleArg);
		}

		// PNG压缩级别设置
		if (options.compressionLevel !== undefined) {
			const compressionLevel = Math.round(
				4 + ((100 - options.compressionLevel) / 100) * 5,
			);
			args.push("-compression_level", compressionLevel.toString());
		}

		// 输出文件
		args.push(outputFileName);

		return args;
	}
}

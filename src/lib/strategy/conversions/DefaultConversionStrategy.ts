import { ConvertStrategy, ConvertOptions } from "../index";
import { InputFileType } from "../../fileUtils";
import { checkFormatConversion, ImageFormatType } from "./ConversionStrategy";

/**
 * 默认图片转换策略
 * 使用FFmpeg进行图片格式转换和质量设置
 */
export class DefaultConversionStrategy implements ConvertStrategy {
	/**
	 * 判断是否可以处理给定的输入和选项
	 * @param input 输入文件信息
	 * @param options 转换选项
	 * @returns 是否能够处理
	 */
	match(input: InputFileType, options: ConvertOptions): boolean {
		// 使用checkFormatConversion检查格式转换并设置cannotDo标记
		return true;
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
		const outputFormat = options.format;
		const outputFileName = `${input.name}_${options.outputSuffixName || "output"}.${outputFormat}`;
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

		// 质量设置
		if (options.compressionLevel !== undefined) {
			const qualityParam = this.getQuality(options.compressionLevel);
			const [paramName, paramValue] = qualityParam.split(" ");
			args.push(paramName, paramValue);
		}

		// 输出文件
		args.push(outputFileName);

		return args;
	}

	/**
	 * 获取质量参数
	 * @param quality 质量值(0-100)
	 * @returns 格式化的质量参数字符串 "参数名 参数值"
	 */
	private getQuality(quality: number): string {
		return `-q:v ${Math.round((100 - quality) * 0.19 + 12)}`;
	}
}

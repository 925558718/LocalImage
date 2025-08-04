import { InputFileType } from "../../fileUtils";
import { UpscaleOptions, UpscaleStrategy } from "../index";

/**
 * 默认图片放大策略
 * 使用FFmpeg的scale滤镜进行图片放大处理
 */
export class DefaultUpscaleStrategy implements UpscaleStrategy {
	/**
	 * 判断是否可以处理给定的输入和选项
	 * @param input 输入文件信息
	 * @param options 放大选项
	 * @returns 是否能够处理
	 */
	match(input: InputFileType, options: UpscaleOptions): boolean {
		return true;
	}

	/**
	 * 生成FFmpeg放大命令
	 * @param input 输入文件信息
	 * @param options 放大选项
	 * @returns FFmpeg命令参数数组
	 */
	generateFFMPEGCommand(
		input: InputFileType,
		options: UpscaleOptions,
	): string[] {
		const args: string[] = [];
		console.log("input", input);
		// 生成输入文件名和输出文件名
		const inputFileName = `${input.name}.${input.format || "tmp"}`;
		const outputFileName = `${input.name}_${options.outputSuffixName || "upscaled"}.${input.format || "tmp"}`;
		input.outputName = outputFileName;
		// 输入文件
		args.push("-i", inputFileName);

		// 构建scale滤镜参数
		let scaleFilter = "scale=";
		// 强制拉伸到指定尺寸
		const scaleFactor = options.scaleFactor || 2;
		const width = input.width || 1920;
		const height = input.height || 1080;
		scaleFilter += `${scaleFactor * width}:${scaleFactor * height}`;

		// 添加放大算法
		const algorithm = options.algorithm || "lanczos";
		scaleFilter += `:flags=${algorithm}`;

		args.push("-vf", scaleFilter);
		// 输出文件
		args.push(outputFileName);

		return args;
	}
}

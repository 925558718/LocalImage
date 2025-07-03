import { InputFileType } from "../../fileUtils";
import { CropOptions, CropStrategy } from "../index";

/**
 * 默认图片裁剪策略
 * 使用FFmpeg的crop滤镜进行图片裁剪处理
 */
export class DefaultCropStrategy implements CropStrategy {
	/**
	 * 判断是否可以处理给定的输入和选项
	 * @param input 输入文件信息
	 * @param options 裁剪选项
	 * @returns 是否能够处理
	 */
	match(input: InputFileType, options: CropOptions): boolean {
		// 只处理静态图片，动图由AnimatedCropStrategy处理
		return input.isAnimated !== true;
	}

	/**
	 * 生成FFmpeg裁剪命令
	 * @param input 输入文件信息
	 * @param options 裁剪选项
	 * @returns FFmpeg命令参数数组
	 */
	generateFFMPEGCommand(input: InputFileType, options: CropOptions): string[] {
		const args: string[] = [];
		console.log("处理静态图片裁剪:", input);

		// 生成输入文件名和输出文件名
		const inputFileName = `${input.name}.${input.format || "tmp"}`;
		const outputFileName = `${input.name}_${options.outputSuffixName || "cropped"}.${input.format || "tmp"}`;
		input.outputName = outputFileName;

		// 输入文件
		args.push("-i", inputFileName);

		// 构建crop滤镜参数
		const { x, y, width, height } = options;
		const cropFilter = `crop=${width}:${height}:${x}:${y}`;
		args.push("-vf", cropFilter);

		// 输出文件
		args.push(outputFileName);

		return args;
	}
}

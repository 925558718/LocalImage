import { ConversionStrategy } from "./ConversionStrategy";

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
export class IcoConversionStrategy implements ConversionStrategy {
	getArgs(inputFileName: string, outputName: string, quality: number, width?: number, height?: number): string[] {
		const args = ['-i', inputFileName];

		// ICO文件通常需要特定的尺寸，如果没有指定，使用常见的图标尺寸
		if (width || height) {
			let scaleArg = 'scale=';
			scaleArg += width ? `${width}:` : '-1:';
			scaleArg += height ? `${height}` : '-1';
			args.push('-vf', scaleArg);
		} else {
			// 默认使用32x32尺寸，这是最常见的图标尺寸
			// 也可以考虑16x16, 48x48等常见图标尺寸
			args.push('-vf', 'scale=32:32');
		}

		// ICO格式的特殊参数
		// - 使用PNG编码器，因为ICO支持PNG格式
		args.push('-c:v', 'png');
		
		// 设置位深度为32位（支持透明度）
		args.push('-pix_fmt', 'rgba');
		
		// 对于ICO文件，质量参数主要用于PNG压缩级别
		// ICO文件通常不需要很高的压缩，保持较好的质量
		// 压缩级别范围：1-9，1为最高压缩率，9为最低压缩率
		const compressionLevel = Math.max(1, Math.round(6 - (quality / 100) * 5));
		args.push('-compression_level', compressionLevel.toString());

		// 确保输出为单帧（ICO不支持动画）
		args.push('-frames:v', '1');

		args.push(outputName);
		return args;
	}

	/**
	 * 测试方法：生成示例FFmpeg命令
	 * 用于验证参数生成是否正确
	 */
	static getExampleCommand(): string {
		const instance = new IcoConversionStrategy();
		const args = instance.getArgs('input.png', 'output.ico', 85, 32, 32);
		return `ffmpeg ${args.join(' ')}`;
	}
} 
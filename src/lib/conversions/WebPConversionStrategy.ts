import { ConversionStrategy } from "./ConversionStrategy";

/**
 * WebP转换策略
 * 处理WebP格式的图像转换与压缩
 */
export class WebPConversionStrategy implements ConversionStrategy {
	getArgs(inputFileName: string, outputName: string, quality: number, width?: number, height?: number): string[] {
		const args = ['-i', inputFileName];
		const isGif = inputFileName.toLowerCase().endsWith('.gif');
		
		// 分辨率缩放
		if (width || height) {
			let scaleArg = 'scale=';
			scaleArg += width ? `${width}:` : '-1:';
			scaleArg += height ? `${height}` : '-1';
			args.push('-vf', scaleArg);
		}
		
		// 对于GIF使用libwebp_anim编码器，其他使用libwebp
		args.push('-c:v', isGif ? 'libwebp_anim' : 'libwebp');
		
		// WebP质量控制（直接使用0-100的质量值）
		args.push('-quality', String(quality));
		
		// 确保使用有损压缩
		args.push('-lossless', '0');
		
		// 使用最佳压缩方法
		args.push('-method', '6');
		
		args.push(outputName);
		return args;
	}
} 
/**
 * 图像转换策略接口
 * 定义了所有图像转换策略必须实现的方法
 */
export interface ConversionStrategy {
	/**
	 * 获取FFmpeg转换参数
	 * @param inputFileName 输入文件名
	 * @param outputName 输出文件名
	 * @param quality 质量（0-100）
	 * @param width 可选的输出宽度
	 * @param height 可选的输出高度
	 * @returns FFmpeg命令行参数数组
	 */
	getArgs(inputFileName: string, outputName: string, quality: number, width?: number, height?: number): string[];
}

// 导出支持的图片格式类型
export type ImageFormat = 'png' | 'jpg' | 'jpeg' | 'webp' | 'avif';

// 格式转换映射表
export const FORMAT_CONVERSION_MAP: Record<ImageFormat, ImageFormat[]> = {
	png: ['png', 'jpg', 'webp', 'avif'],
	jpg: ['jpg', 'png', 'webp', 'avif'],
	jpeg: ['jpeg', 'png', 'webp', 'avif'],
	webp: ['webp', 'png', 'jpg', 'avif'],
	avif: ['avif', 'png', 'jpg', 'webp']
}; 
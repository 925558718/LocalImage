import { ConversionStrategy, FORMAT_CONVERSION_MAP, ImageFormat } from "./ConversionStrategy";
import { DefaultConversionStrategy } from "./DefaultConversionStrategy";
import { JpegConversionStrategy } from "./JpegConversionStrategy";
import { WebPConversionStrategy } from "./WebPConversionStrategy";
import { AvifConversionStrategy } from "./AvifConversionStrategy";

/**
 * 图像转换策略工厂
 * 根据输出格式创建相应的转换策略实例
 */
export class ConversionStrategyFactory {
	private static strategies: Record<string, ConversionStrategy> = {
		jpg: new JpegConversionStrategy(),
		jpeg: new JpegConversionStrategy(),
		webp: new WebPConversionStrategy(),
		avif: new AvifConversionStrategy(),
		png: new DefaultConversionStrategy()
	};

	/**
	 * 获取适合指定格式的转换策略
	 * @param format 输出格式 (png/jpg/jpeg/webp/avif)
	 * @returns 对应的转换策略实现
	 */
	static getStrategy(format: string): ConversionStrategy {
		return this.strategies[format.toLowerCase()] || new DefaultConversionStrategy();
	}

	/**
	 * 检查是否支持从一种格式转换到另一种格式
	 * @param sourceFormat 源格式
	 * @param targetFormat 目标格式
	 * @returns 是否支持转换
	 */
	static canConvert(sourceFormat: string, targetFormat: string): boolean {
		return FORMAT_CONVERSION_MAP[sourceFormat as ImageFormat]?.includes(targetFormat as ImageFormat) || false;
	}
} 
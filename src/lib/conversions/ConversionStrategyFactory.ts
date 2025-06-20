import { ConversionStrategy, FORMAT_CONVERSION_MAP, ImageFormat } from "./ConversionStrategy";
import { DefaultConversionStrategy } from "./DefaultConversionStrategy";
import { WebPConversionStrategy } from "./WebPConversionStrategy";
import { AvifConversionStrategy } from "./AvifConversionStrategy";

/**
 * 图像转换策略工厂
 * 根据输出格式创建相应的转换策略实例
 */
// 使用命名空间和函数替代静态类
export namespace ConversionStrategyFactory {
	const strategies: Record<string, ConversionStrategy> = {
		webp: new WebPConversionStrategy(),
		avif: new AvifConversionStrategy(),
		default: new DefaultConversionStrategy()
	};

	/**
	 * 获取适合指定格式的转换策略
	 * @param format 输出格式 (png/jpg/jpeg/webp/avif)
	 * @returns 对应的转换策略实现
	 */
	export function getStrategy(format: string): ConversionStrategy {
		return strategies[format.toLowerCase()] || strategies.default;
	}

	/**
	 * 检查是否支持从一种格式转换到另一种格式
	 * @param sourceFormat 源格式
	 * @param targetFormat 目标格式
	 * @returns 是否支持转换
	 */
	export function canConvert(sourceFormat: string, targetFormat: string): boolean {
		return FORMAT_CONVERSION_MAP[sourceFormat as ImageFormat]?.includes(targetFormat as ImageFormat) || false;
	}
}
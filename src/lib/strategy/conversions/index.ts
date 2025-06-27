import { registerConvertStrategy } from "../index";
import { DefaultConversionStrategy } from "./DefaultConversionStrategy";
import { IcoConversionStrategy } from "./IcoConversionStrategy";
import { PngConversionStrategy } from "./PngConversionStrategy";
import { WebPConversionStrategy } from "./WebPConversionStrategy";

// 注册所有转换策略
registerConvertStrategy(new IcoConversionStrategy());
registerConvertStrategy(new PngConversionStrategy());
registerConvertStrategy(new WebPConversionStrategy());
registerConvertStrategy(new DefaultConversionStrategy());

// 导出策略类以供其他地方使用
export { DefaultConversionStrategy } from "./DefaultConversionStrategy";
export { IcoConversionStrategy } from "./IcoConversionStrategy";
export { PngConversionStrategy } from "./PngConversionStrategy";
export { WebPConversionStrategy } from "./WebPConversionStrategy";
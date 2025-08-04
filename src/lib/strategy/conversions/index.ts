import { ConvertStrategy } from "../index";
import { DefaultConversionStrategy } from "./DefaultConversionStrategy";
import { IcoConversionStrategy } from "./IcoConversionStrategy";
import { PngConversionStrategy } from "./PngConversionStrategy";
import { WebPConversionStrategy } from "./WebPConversionStrategy";

const conversionStrategyPool: ConvertStrategy[] = [
	new IcoConversionStrategy(),
	new PngConversionStrategy(),
	new WebPConversionStrategy(),
	new DefaultConversionStrategy(),
];

export default conversionStrategyPool;

import { ConvertStrategy } from "../index";
import { DefaultConversionStrategy } from "./DefaultConversionStrategy";
import { IcoConversionStrategy } from "./IcoConversionStrategy";
import { PngConversionStrategy } from "./PngConversionStrategy";
import { WebPConversionStrategy } from "./WebPConversionStrategy";

const conversionStrategyPool: ConvertStrategy[] = [
	new DefaultConversionStrategy(),
	new IcoConversionStrategy(),
	new PngConversionStrategy(),
	new WebPConversionStrategy(),
];

export default conversionStrategyPool;

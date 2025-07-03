import { CropStrategy } from "../index";
import { DefaultCropStrategy } from "./DefaultCropStrategy";

// 导出类型和函数
export type { CropStrategy, CropOptions } from "../index";

// 裁剪策略池 - 动图策略优先，然后是默认策略
const cropStrategyPool: CropStrategy[] = [
	new DefaultCropStrategy()
];

export default cropStrategyPool;
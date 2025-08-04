import { UpscaleStrategy } from "../index";
import { DefaultUpscaleStrategy } from "./DefaultUpscaleStrategy";

const upscaleStrategyPool: UpscaleStrategy[] = [new DefaultUpscaleStrategy()];
export default upscaleStrategyPool;

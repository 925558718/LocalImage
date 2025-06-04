import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { 
  ffmpegLoadingAtom, 
  ffmpegReadyAtom, 
  ffmpegErrorAtom, 
  loadFFmpegAtom,
  resetFFmpegAtom 
} from '@/store/ffmpeg';

interface UseFFmpegReturn {
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  load: () => Promise<void>;
  reset: () => void;
}

export function useFFmpeg(): UseFFmpegReturn {
  const [isLoading] = useAtom(ffmpegLoadingAtom);
  const [isReady] = useAtom(ffmpegReadyAtom);
  const [error] = useAtom(ffmpegErrorAtom);
  const [, loadFFmpeg] = useAtom(loadFFmpegAtom);
  const [, resetFFmpeg] = useAtom(resetFFmpegAtom);

  // 组件挂载时自动开始加载（如果还没有加载过）
  useEffect(() => {
    loadFFmpeg();
  }, [loadFFmpeg]);

  return {
    isLoading,
    isReady,
    error,
    load: loadFFmpeg,
    reset: resetFFmpeg
  };
} 
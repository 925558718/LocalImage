import { useTranslations } from "next-intl";
import Image from "next/image";

interface PreviewAreaProps {
  files: File[];
  currentFrame: number;
  getSortedFiles: (files: File[]) => File[];
}

export default function PreviewArea({ files, currentFrame, getSortedFiles }: PreviewAreaProps) {
  const t = useTranslations();
  
  if (files.length === 0) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-12 flex flex-col items-center justify-center text-center h-full">
        <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-slate-400 dark:text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-3">
          {t("animation_preview")}
        </h3>
        <p className="text-slate-500 dark:text-slate-500 max-w-xs">
          {t("preview_instruction")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {t("animation_preview")}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("realtime_preview_desc")}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {(() => {
          const sortedFiles = getSortedFiles(files);
          const currentFile = sortedFiles[currentFrame];
          return (
            currentFile && (
              <div className="space-y-4 w-full max-w-md">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                  <Image
                    src={URL.createObjectURL(currentFile)}
                    alt={`Frame ${currentFrame + 1}`}
                    width={0}
                    height={0}
                    className="w-auto h-auto max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "12rem",
                    }}
                    unoptimized // 由于是blob URL，需要禁用优化
                    sizes="100vw"
                  />
                </div>
                <div className="text-center space-y-2">
                  <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-1 inline-block">
                    {currentFile.name}
                  </div>
                </div>
              </div>
            )
          );
        })()}
      </div>
    </div>
  );
} 
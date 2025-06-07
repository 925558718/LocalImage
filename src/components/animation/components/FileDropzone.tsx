import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ChevronUp, ImageIcon, Trash2, Info } from "lucide-react";
import { Button } from "@/components/shadcn";

interface FileDropzoneProps {
  files: File[];
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (file: File) => void;
  onClearFiles: () => void;
  getSortedFiles: (files: File[]) => File[];
}

export default function FileDropzone({ 
  files, 
  onAddFiles, 
  onRemoveFile, 
  onClearFiles,
  getSortedFiles
}: FileDropzoneProps) {
  const t = useTranslations();
  
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const imageFiles = acceptedFiles.filter(
        (file) => file.type.startsWith("image/")
      );
      if (imageFiles.length > 0) {
        onAddFiles(imageFiles);
      }
    },
    [onAddFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"],
    },
  });

  // 没有文件时显示的拖拽区域（包含文件命名建议）
  const renderEmptyDropzone = () => (
    <div
      {...getRootProps()}
      className={`bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed p-6 flex flex-col items-center justify-center text-center h-full ${
        isDragActive
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-slate-300 dark:border-slate-600"
      } transition-colors`}
    >
      <input {...getInputProps()} />
      <div className="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-4">
        <ImageIcon className="w-8 h-8 text-slate-500 dark:text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
        {isDragActive
          ? t("drop_files_here")
          : t("drag_or_click_upload")}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-xs">
        {t("supported_formats")}: PNG, JPG, WebP, GIF
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="bg-white dark:bg-slate-800 mb-6"
      >
        {t("select_files")}
      </Button>
      
      {/* 文件命名建议 */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-yellow-200/50 dark:border-yellow-800/50 max-w-md w-full mt-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              {t("file_naming_suggestion")}
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
              {t("naming_tip_intro")}
            </p>
            <div className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
              <div>✓ img_01.png, img_02.png, img_03.png</div>
              <div>✓ frame001.jpg, frame002.jpg, frame003.jpg</div>
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 font-medium">
              ✅ {t("format_support")} • {t("auto_sort")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 有文件时显示文件列表
  const renderFilesList = () => (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t("uploaded_files")} ({files.length})
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="bg-white dark:bg-slate-800"
            onClick={(e) => {
              e.stopPropagation();
              const fileInput = document.createElement("input");
              fileInput.type = "file";
              fileInput.multiple = true;
              fileInput.accept = "image/*";
              fileInput.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files && files.length > 0) {
                  onAddFiles(Array.from(files));
                }
              };
              fileInput.click();
            }}
          >
            {t("add_more")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClearFiles();
            }}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {t("clear_all")}
          </Button>
        </div>
      </div>

      <div 
        {...getRootProps()} 
        className="cursor-pointer flex-1 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <input {...getInputProps()} />
        
        <div className={`flex-1 overflow-y-auto ${isDragActive ? "bg-blue-50 dark:bg-blue-900/20" : ""} max-h-[400px]`}>
          {getSortedFiles(files).map((file, index) => (
            <div
              key={`${file.name}-${file.lastModified}`}
              className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 flex items-center justify-between"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-3 overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-1">
                    {file.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Move file up in order
                      const newFiles = [...files];
                      const fileA = newFiles[index];
                      const fileB = newFiles[index - 1];
                      
                      // Since we're working with sorted files, we need to
                      // update a property like name to change the sort order
                      const newFileA = new File([fileA], fileA.name.replace(/^(\d+)/, (m) => `${parseInt(m) - 1}`), {
                        type: fileA.type,
                        lastModified: fileA.lastModified,
                      });
                      
                      onRemoveFile(fileA);
                      onAddFiles([newFileA]);
                    }}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(file);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {/* 空文件列表时显示的上传提示 */}
          {files.length === 0 && !isDragActive && (
            <div className="flex-1 flex items-center justify-center p-6 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {t("drag_or_click_upload")}
                </p>
              </div>
            </div>
          )}
          
          {/* 拖拽区域的提示，显示在文件列表中 */}
          {isDragActive && (
            <div className="flex-1 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-center text-blue-700 dark:text-blue-300 font-medium">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full mx-auto flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                </div>
                <p className="text-lg">{t("drop_files_here")}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* 文件命名建议 - 放在文件列表底部，始终可见 */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <Info className="w-3 h-3" />
            <span>{t("file_naming_suggestion")}: </span>
            <span className="text-yellow-600 dark:text-yellow-400">img_01.png, img_02.png...</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full">
      {files.length > 0 ? renderFilesList() : renderEmptyDropzone()}
    </div>
  );
} 
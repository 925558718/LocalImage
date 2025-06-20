import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ChevronUp, ImageIcon, Trash2, Info, Upload } from "lucide-react";
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
      className={`bg-muted/50 rounded-xl border-2 border-dashed p-6 flex flex-col items-center justify-center text-center h-full ${
        isDragActive
          ? "border-primary bg-primary/10"
          : "border-border"
      } transition-colors`}
    >
      <input {...getInputProps()} />
      <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-4">
        <ImageIcon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {isDragActive
          ? t("drop_files_here")
          : t("drag_or_click_upload")}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-xs">
        {t("supported_formats")}: PNG, JPG, WebP, GIF
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="bg-card mb-6"
      >
        {t("select_files")}
      </Button>
      
      {/* 文件命名建议 */}
      <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-xl p-4 border border-accent/20 max-w-md w-full mt-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-accent-foreground" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-semibold text-accent-foreground mb-2">
              {t("file_naming_suggestion")}
            </h4>
            <p className="text-sm text-accent-foreground/80 mb-2">
              {t("naming_tip_intro")}
            </p>
            <div className="text-xs text-accent-foreground/70 space-y-1">
              <div>✓ img_01.png, img_02.png, img_03.png</div>
              <div>✓ frame001.jpg, frame002.jpg, frame003.jpg</div>
            </div>
            <div className="text-xs text-accent-foreground/70 mt-2 font-medium">
              ✅ {t("format_support")} • {t("auto_sort")}
            </div>
          </div>
        </div>
      </div>

      {/* 拖拽提示 */}
      <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-xl p-4 border border-accent/20 max-w-md w-full mt-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
            <Upload className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-accent-foreground">
              {t("drag_drop_or_click")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("supported_formats")}: JPG, PNG, WebP, AVIF
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // 有文件时显示文件列表
  const renderFilesList = () => (
    <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border flex justify-between items-center">
        <div className="text-sm font-medium text-foreground">
          {t("uploaded_files")} ({files.length})
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="bg-card"
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
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
        
        <div className={`flex-1 overflow-y-auto ${isDragActive ? "bg-primary/10" : ""} max-h-[400px]`}>
          {getSortedFiles(files).map((file, index) => (
            <div
              key={`${file.name}-${file.lastModified}`}
              className="px-4 py-3 border-b border-border/50 last:border-0 flex items-center justify-between"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center mr-3 overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground line-clamp-1">
                    {file.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
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
                      const newFileA = new File([fileA], fileA.name.replace(/^(\d+)/, (m) => `${Number.parseInt(m) - 1}`), {
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
                  className="w-7 h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
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
                <div className="w-12 h-12 bg-muted rounded-full mx-auto flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">
                  {t("drag_or_click_upload")}
                </p>
              </div>
            </div>
          )}
          
          {/* 拖拽区域的提示，显示在文件列表中 */}
          {isDragActive && (
            <div className="flex-1 flex items-center justify-center bg-primary/10 text-center text-primary font-medium">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-primary" />
                </div>
                <p className="text-lg">{t("drop_files_here")}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* 文件命名建议 - 放在文件列表底部，始终可见 */}
        <div className="p-3 border-t border-border/50 bg-muted/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Info className="w-3 h-3" />
            <span>{t("file_naming_suggestion")}: </span>
            <span className="text-accent-foreground/70">img_01.png, img_02.png...</span>
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
import React, { useEffect, useCallback, useState } from "react";
import { FolderPlus, ImagePlus, Images, Trash2, Folder, LayoutGrid, List } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { IPC_CHANNELS } from "@mosa/ipc-bridge";
import type { FolderInfo, CatalogImage } from "@mosa/ipc-bridge/src/contracts/catalog.contract";
import TextType from "../components/reactbits/TextType";
import classnames from "classnames";
import { useCatalogStore } from "../stores/catalog.store";
import { ipc } from "../lib/ipc-client";
import styles from "./library.module.less";

const RAW_EXTENSIONS = new Set(["cr2", "cr3", "nef", "arw", "orf", "rw2", "dng", "raf", "pef", "srw", "raw"]);

function isRawFormat(fileName: string): boolean {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return RAW_EXTENSIONS.has(ext);
}

function getFileExtension(fileName: string): string {
  return (fileName.split(".").pop() ?? "").toUpperCase();
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatExifSummary(image: CatalogImage): string {
  const parts: string[] = [];
  if (image.cameraMake || image.cameraModel) {
    parts.push([image.cameraMake, image.cameraModel].filter(Boolean).join(" "));
  }
  if (image.width && image.height) {
    parts.push(`${image.width}x${image.height}`);
  }
  return parts.join("  ·  ");
}

function formatExifParams(image: CatalogImage): string {
  const parts: string[] = [];
  if (image.iso) parts.push(`ISO ${image.iso}`);
  if (image.aperture) parts.push(`f/${image.aperture}`);
  if (image.shutterSpeed) parts.push(`${image.shutterSpeed}s`);
  if (image.focalLength) parts.push(`${image.focalLength}mm`);
  return parts.join("  ·  ");
}

type ViewMode = "grid" | "list";

const LibraryPage: React.FC = () => {
  const { folders, images, isImporting, importProgress, setImages, setFolders, setImporting, setImportProgress } =
    useCatalogStore();
  
  const [selectedFolderId, setSelectedFolderId] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Filtered images by selected folder
  const filteredImages = selectedFolderId === "all"
    ? images
    : images.filter((img) => img.folderId === selectedFolderId);

  // Load all data
  const loadData = useCallback(async () => {
    try {
      const imgResult = await ipc.invoke<{ ok: boolean; data?: { images: CatalogImage[] } }>(
        IPC_CHANNELS.CATALOG_GET_IMAGES,
        {},
      );
      if (imgResult?.ok && imgResult.data) {
        setImages(imgResult.data.images);
      }

      const folderResult = await ipc.invoke<{ ok: boolean; data?: { folders: FolderInfo[] } }>(
        IPC_CHANNELS.CATALOG_GET_FOLDERS,
      );
      if (folderResult?.ok && folderResult.data) {
        setFolders(folderResult.data.folders);
      }
    } catch (e) {
      console.error("Failed to load catalog data:", e);
    }
  }, [setImages, setFolders]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Listen to import progress events
  useEffect(() => {
    const unsub = ipc.on?.("catalog:import-progress", (data) => {
      setImportProgress({ processed: data.processed, total: data.total });
    });
    return () => {
      unsub?.();
    };
  }, [setImportProgress]);

  const handleImportFolder = useCallback(async () => {
    setImporting(true);
    setImportProgress(null);
    try {
      await ipc.invoke(IPC_CHANNELS.CATALOG_IMPORT_FOLDER);
      await loadData();
    } finally {
      setImporting(false);
      setImportProgress(null);
    }
  }, [setImporting, setImportProgress, loadData]);

  const handleImportFiles = useCallback(async () => {
    setImporting(true);
    setImportProgress(null);
    try {
      await ipc.invoke(IPC_CHANNELS.CATALOG_IMPORT_FILES);
      await loadData();
    } finally {
      setImporting(false);
      setImportProgress(null);
    }
  }, [setImporting, setImportProgress, loadData]);

  const handleDeleteImage = useCallback(
    async (imageId: string) => {
      try {
        await ipc.invoke(IPC_CHANNELS.CATALOG_REMOVE_IMAGE, { imageId });
        await loadData();
      } catch (e) {
        console.error("Failed to delete image:", e);
      }
    },
    [loadData],
  );

  const progressPercent =
    importProgress && importProgress.total > 0
      ? Math.round((importProgress.processed / importProgress.total) * 100)
      : 0;

  const hasData = images.length > 0;

  // Empty state — no data at all
  if (!hasData) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <div className={styles.emptyContent}>
            <div className={styles.logoBg}>
              <img src="/logo.svg" className={styles.emptyIcon} />
              <p className={styles.emptyTitle}>osa</p>
            </div>
            <div className={styles.emptyHint}>
              <TextType
                text={[
                  "Add images, Reconstruct the logic of light",
                ]}
                className={styles.sloganEn}
                typingSpeed={60}
                deletingSpeed={30}
                pauseDuration={3000}
                initialDelay={500}
                loop
                showCursor
                cursorCharacter="_"
                cursorClassName={styles.textCursor}
              />
            </div>
            <div className={styles.emptyActions}>
              <button className={classnames(styles.emptyBtn, styles.emptyBtnPrimary)} onClick={handleImportFiles} disabled={isImporting}>
                <ImagePlus size={16} />
                导入图片
              </button>
              <button className={styles.emptyBtn} onClick={handleImportFolder} disabled={isImporting}>
                <FolderPlus size={16} />
                添加文件夹
              </button>
            </div>
            {isImporting && importProgress && (
              <div className={styles.emptyProgress}>
                <div className={styles.progressTrack}>
                  <div className={styles.progressBar} style={{ width: `${progressPercent}%` }} />
                </div>
                <span className={styles.emptyProgressText}>{importProgress.processed} / {importProgress.total}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Determine if a folder is a workspace folder
  const isWorkspaceFolder = (folder: FolderInfo) => folder.path.includes("/workspace/");
  const workspaceFolders = folders.filter(isWorkspaceFolder);
  const userFolders = folders.filter((f) => !isWorkspaceFolder(f));

  return (
    <Tabs.Root value={selectedFolderId} onValueChange={setSelectedFolderId} asChild>
      <div className={styles.page}>
        {/* Left sidebar — folder list */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <button className={classnames(styles.sidebarBtn, styles.sidebarBtnPrimary)} onClick={handleImportFiles} disabled={isImporting} title="导入图片">
              <ImagePlus size={14} />
              导入图片&nbsp;&nbsp;&nbsp;
            </button>
            <button className={styles.sidebarBtn} onClick={handleImportFolder} disabled={isImporting} title="添加文件夹">
              <FolderPlus size={14} />
              添加文件夹
            </button>
          </div>

          <Tabs.List className={styles.folderList}>
            <Tabs.Trigger value="all" className={styles.folderItem}>
              <Images size={14} />
              <span className={styles.folderName}>全部</span>
              <span className={styles.folderCount}>{images.length}</span>
            </Tabs.Trigger>

            {workspaceFolders.map((folder) => (
              <Tabs.Trigger key={folder.id} value={folder.id} className={styles.folderItem}>
                <Folder size={14} />
                <span className={styles.folderName}>工作区</span>
                <span className={styles.folderCount}>{folder.imageCount}</span>
              </Tabs.Trigger>
            ))}

            {userFolders.map((folder) => (
              <Tabs.Trigger key={folder.id} value={folder.id} className={styles.folderItem}>
                <Folder size={14} />
                <span className={styles.folderName}>{folder.name}</span>
                <span className={styles.folderCount}>{folder.imageCount}</span>
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </div>

        {/* Right content */}
        <div className={styles.content}>
          {/* Content header with view toggle */}
          <div className={styles.contentHeader}>
            <span className={styles.contentTitle}>{filteredImages.length} 张图片</span>
            <ToggleGroup.Root
              type="single"
              value={viewMode}
              onValueChange={(val) => { if (val) setViewMode(val as ViewMode); }}
              className={styles.viewToggle}
            >
              <ToggleGroup.Item value="grid" className={styles.viewToggleBtn} title="网格视图">
                <LayoutGrid size={18} />
              </ToggleGroup.Item>
              <ToggleGroup.Item value="list" className={styles.viewToggleBtn} title="列表视图">
                <List size={18} />
              </ToggleGroup.Item>
            </ToggleGroup.Root>
          </div>

          {/* Progress bar */}
          {isImporting && importProgress && (
            <div className={styles.emptyProgress}>
              <div className={styles.progressTrack}>
                <div className={styles.progressBar} style={{ width: `${progressPercent}%` }} />
              </div>
              <span className={styles.emptyProgressText}>{importProgress.processed} / {importProgress.total}</span>
            </div>
          )}

          {filteredImages.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyContent}>
                <Images size={40} strokeWidth={1} className={styles.emptyIcon} />
                <p className={styles.emptyTitle}>该文件夹暂无图片</p>
              </div>
            </div>
          ) : viewMode === "grid" ? (
          /* ── Grid view ── */
          <div className={styles.gridContainer}>
            <div className={styles.grid}>
              {filteredImages.map((image) => (
                <div key={image.id} className={styles.card}>
                  <img
                    className={styles.cardImage}
                    src={image.thumbnailPath ? `mosa://thumbnail${image.thumbnailPath}` : undefined}
                    alt={image.fileName}
                    loading="lazy"
                  />
                  <div className={styles.cardOverlay}>
                    <span className={styles.cardName}>{image.fileName}</span>
                  </div>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(image.id);
                    }}
                    title="删除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ── List view ── */
          <div className={styles.listContainer}>
            <div className={styles.listHeader}>
              <span className={styles.listHeaderThumb}>预览</span>
              <span className={styles.listHeaderName}>文件名</span>
              <span className={styles.listHeaderInfo}>相机 / 尺寸</span>
              <span className={styles.listHeaderParams}>拍摄参数</span>
              <span className={styles.listHeaderMeta}>格式</span>
              <span className={styles.listHeaderActions}>操作</span>
            </div>
            {filteredImages.map((image) => {
              const ext = getFileExtension(image.fileName);
              const raw = isRawFormat(image.fileName);
              return (
                <div key={image.id} className={styles.listRow}>
                  <div className={styles.listThumb}>
                    <img
                      src={image.thumbnailPath ? `mosa://thumbnail${image.thumbnailPath}` : undefined}
                      alt={image.fileName}
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.listName}>
                    <span className={styles.listFileName}>{image.fileName}</span>
                    <span className={styles.listFileSize}>{formatFileSize(image.fileSize)}</span>
                  </div>
                  <div className={styles.listInfo}>{formatExifSummary(image)}</div>
                  <div className={styles.listParams}>{formatExifParams(image)}</div>
                  <div className={styles.listMeta}>
                    <span className={styles.listExt}>{ext}</span>
                    {raw && <span className={styles.rawBadge}>RAW</span>}
                  </div>
                  <div className={styles.listActions}>
                    <button
                      className={styles.listDeleteBtn}
                      onClick={() => handleDeleteImage(image.id)}
                      title="删除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </Tabs.Root>
  );
};

export default LibraryPage;

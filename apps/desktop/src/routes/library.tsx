import React, { useEffect, useCallback, useState } from "react";
import { FolderPlus, ImagePlus, Images, Trash2, Folder, LayoutGrid, List, Plus, Pencil } from "lucide-react";
import { Button, Tabs, ToggleGroup, Tooltip, Masonry, MasonryItem, ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, toast } from "@mosa/ui-kit";
import { IPC_CHANNELS } from "@mosa/ipc-bridge";
import type { FolderInfo, CatalogImage } from "@mosa/ipc-bridge/src/contracts/catalog.contract";
import TextType from "../components/reactbits/TextType";
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
    parts.push(getDeviceName(image.cameraMake, image.cameraModel));
  }
  if (image.lens) {
    parts.push(image.lens);
  }
  if (image.width && image.height) {
    parts.push(`${image.width}x${image.height}`);
  }
  return parts.join("  ·  ");
}

function formatExifParams(image: CatalogImage): string {
  const parts: string[] = [];
  if (image.iso) parts.push(`ISO ${image.iso}`);
  if (image.focalLength) parts.push(`${image.focalLength}mm`);
  if (image.exposureCompensation !== undefined && image.exposureCompensation !== null) {
    parts.push(formatExposureComp(image.exposureCompensation));
  }
  if (image.aperture) parts.push(`F${image.aperture}`);
  if (image.shutterSpeed) parts.push(`${image.shutterSpeed}s`);
  return parts.join("  ·  ");
}

function getDeviceName(make?: string, model?: string): string {
  if (!make && !model) return "";
  if (!model) return make!;
  if (!make) return model;
  // Avoid duplication like "Canon Canon EOS R5"
  if (model.toLowerCase().startsWith(make.toLowerCase())) return model;
  return `${make} ${model}`;
}

function formatMegapixels(w: number, h: number): string {
  if (!w || !h) return "";
  const mp = (w * h) / 1_000_000;
  return mp >= 10 ? `${Math.round(mp)}MP` : `${mp.toFixed(1)}MP`;
}

function formatExposureComp(ev?: number): string {
  if (ev === undefined || ev === null) return "";
  if (ev === 0) return "0EV";
  return ev > 0 ? `+${ev}EV` : `${ev}EV`;
}

function PipeSep() {
  return <span className={styles.cardSep}>|</span>;
}

type ViewMode = "grid" | "list";

const LibraryPage: React.FC = () => {
  const { folders, images, isImporting, importProgress, setImages, setFolders, setImporting, setImportProgress } =
    useCatalogStore();
  
  const [selectedFolderId, setSelectedFolderId] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [fabOpen, setFabOpen] = useState(false);

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
      const res = await ipc.invoke<{ ok: boolean; data?: { importedCount: number; skippedCount: number; totalScanned: number } }>(IPC_CHANNELS.CATALOG_IMPORT_FOLDER);
      await loadData();
      if (res?.ok && res.data) {
        const { importedCount, skippedCount, totalScanned } = res.data;
        if (importedCount === 0 && totalScanned > 0) {
          toast.info("所有图片已在图库中");
        } else if (importedCount > 0 && skippedCount > 0) {
          toast.success(`导入 ${importedCount} 张，跳过 ${skippedCount} 张重复`);
        } else if (importedCount > 0) {
          toast.success(`成功导入 ${importedCount} 张图片`);
        }
      }
    } finally {
      setImporting(false);
      setImportProgress(null);
    }
  }, [setImporting, setImportProgress, loadData]);

  const handleImportFiles = useCallback(async () => {
    setImporting(true);
    setImportProgress(null);
    try {
      const res = await ipc.invoke<{ ok: boolean; data?: { importedCount: number; skippedCount: number; totalScanned: number } }>(IPC_CHANNELS.CATALOG_IMPORT_FILES);
      await loadData();
      if (res?.ok && res.data) {
        const { importedCount, skippedCount, totalScanned } = res.data;
        if (importedCount === 0 && totalScanned > 0) {
          toast.info("所有图片已在图库中");
        } else if (importedCount > 0 && skippedCount > 0) {
          toast.success(`导入 ${importedCount} 张，跳过 ${skippedCount} 张重复`);
        } else if (importedCount > 0) {
          toast.success(`成功导入 ${importedCount} 张图片`);
        }
      }
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

  const handleClearFolder = useCallback(async (folderId: string) => {
    const label = folderId === "all" ? "清空图库" : "清空文件夹";
    if (!window.confirm(`确定要${label}吗？此操作不可撤销。`)) return;
    try {
      await ipc.invoke(IPC_CHANNELS.CATALOG_CLEAR_FOLDER, { folderId });
      await loadData();
      toast.success(`已${label}`);
    } catch (e) {
      console.error("Failed to clear folder:", e);
    }
  }, [loadData]);

  const handleDeleteFolder = useCallback(async (folderId: string) => {
    if (!window.confirm("确定要删除此文件夹及其所有图片吗？此操作不可撤销。")) return;
    try {
      await ipc.invoke(IPC_CHANNELS.CATALOG_DELETE_FOLDER, { folderId });
      if (selectedFolderId === folderId) setSelectedFolderId("all");
      await loadData();
      toast.success("文件夹已删除");
    } catch (e) {
      console.error("Failed to delete folder:", e);
    }
  }, [loadData, selectedFolderId]);

  const handleRenameFolder = useCallback(async (folderId: string, currentName: string) => {
    const newName = window.prompt("重命名文件夹", currentName);
    if (!newName || newName.trim() === "" || newName === currentName) return;
    try {
      await ipc.invoke(IPC_CHANNELS.CATALOG_RENAME_FOLDER, { folderId, newName: newName.trim() });
      await loadData();
      toast.success("文件夹已重命名");
    } catch (e) {
      console.error("Failed to rename folder:", e);
    }
  }, [loadData]);

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
              <Button variant="primary" size="lg" className={styles.emptyBtn} onClick={handleImportFiles} disabled={isImporting}>
                <ImagePlus size={16} />
                导入图片
              </Button>
              <Button variant="secondary" size="lg" className={styles.emptyBtn} onClick={handleImportFolder} disabled={isImporting}>
                <FolderPlus size={16} />
                添加文件夹
              </Button>
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
          <Tabs.List className={styles.folderList}>
            <ContextMenu>
              <ContextMenuTrigger className={styles.contextTrigger}>
                <Tabs.Trigger value="all" className={styles.folderItem}>
                  <Images size={14} />
                  <span className={styles.folderName}>全部</span>
                  <span className={styles.folderCount}>{images.length}</span>
                </Tabs.Trigger>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem variant="danger" onClick={() => handleClearFolder("all")}>
                  <Trash2 size={14} />清空图库
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>

            {workspaceFolders.map((folder) => (
              <ContextMenu key={folder.id}>
                <ContextMenuTrigger className={styles.contextTrigger}>
                  <Tabs.Trigger value={folder.id} className={styles.folderItem}>
                    <Folder size={14} />
                    <span className={styles.folderName}>工作区</span>
                    <span className={styles.folderCount}>{folder.imageCount}</span>
                  </Tabs.Trigger>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem variant="danger" onClick={() => handleClearFolder(folder.id)}>
                    <Trash2 size={14} />清空文件夹
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}

            {userFolders.map((folder) => (
              <ContextMenu key={folder.id}>
                <ContextMenuTrigger className={styles.contextTrigger}>
                  <Tabs.Trigger value={folder.id} className={styles.folderItem}>
                    <Folder size={14} />
                    <span className={styles.folderName}>{folder.name}</span>
                    <span className={styles.folderCount}>{folder.imageCount}</span>
                  </Tabs.Trigger>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => handleRenameFolder(folder.id, folder.name)}>
                    <Pencil size={14} />重命名
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem variant="danger" onClick={() => handleDeleteFolder(folder.id)}>
                    <Trash2 size={14} />删除文件夹
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
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
                <LayoutGrid size={16} />
              </ToggleGroup.Item>
              <ToggleGroup.Item value="list" className={styles.viewToggleBtn} title="列表视图">
                <List size={16} />
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
                <div className={styles.emptyContent}>
                  <div className={styles.logoBg}>
                    <img src="/logo.svg" className={styles.emptyIcon} />
                    <p className={styles.emptyTitle}>osa</p>
                  </div>
                </div>
              </div>
            </div>
          ) : viewMode === "grid" ? (
          /* ── Masonry view ── */
          <div className={styles.gridContainer}>
            <Masonry columnWidth={220} gap={12}>
              {filteredImages.map((image) => (
                <MasonryItem key={image.id}>
                  <div className={styles.card}>
                    <div className={styles.cardImageWrap}>
                      <img
                        className={styles.cardImage}
                        src={image.thumbnailPath ? `mosa://thumbnail${image.thumbnailPath}` : undefined}
                        alt={image.fileName}
                        loading="lazy"
                      />
                    </div>
                    <div className={styles.cardBody}>
                      {/* Row 1: Device + badges */}
                      {(getDeviceName(image.cameraMake, image.cameraModel) || true) && (
                        <div className={styles.cardDeviceRow}>
                          <span className={styles.cardDeviceName}>
                            {getDeviceName(image.cameraMake, image.cameraModel) || image.fileName}
                          </span>
                          <div className={styles.cardBadges}>
                            <span className={styles.cardTag}>{getFileExtension(image.fileName)}</span>
                            {isRawFormat(image.fileName) && <span className={styles.rawBadge}>RAW</span>}
                          </div>
                        </div>
                      )}

                      {/* Row 2: Lens info */}
                      {(image.lens || image.focalLength) ? (
                        <div className={styles.cardLensRow}>
                          {image.lens ?? `${image.focalLength}mm`}
                        </div>
                      ) : null}

                      {/* Row 3: File metadata */}
                      <div className={styles.cardMetaRow}>
                        {image.fileSize ? formatFileSize(image.fileSize) : null}
                        {image.width && image.height ? <><PipeSep />{image.width}x{image.height}</> : null}
                        {image.width && image.height ? <><PipeSep />{formatMegapixels(image.width, image.height)}</> : null}
                      </div>

                      {/* Row 4: Shooting params */}
                      {(image.iso || image.focalLength || image.exposureCompensation !== undefined || image.aperture || image.shutterSpeed) && (
                        <div className={styles.cardMetaRow}>
                          {[
                            image.iso ? `ISO ${image.iso}` : null,
                            image.focalLength ? `${image.focalLength}mm` : null,
                            formatExposureComp(image.exposureCompensation) || null,
                            image.aperture ? `F${image.aperture}` : null,
                            image.shutterSpeed ? `${image.shutterSpeed}s` : null,
                          ].filter(Boolean).map((part, i, arr) => (
                            <React.Fragment key={i}>
                              {part}{i < arr.length - 1 && <PipeSep />}
                            </React.Fragment>
                          ))}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className={styles.cardActions}>
                        <Button
                          variant="ghost"
                          size="sm"
                          iconOnly
                          className={styles.cardDeleteBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(image.id);
                          }}
                          title="删除"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </MasonryItem>
              ))}
            </Masonry>
          </div>
        ) : (
          /* ── List view ── */
          <div className={styles.listContainer}>
            <div className={styles.listHeader}>
              <span className={styles.listHeaderThumb}>图片信息</span>
              <span className={styles.listHeaderParams}>拍摄参数</span>
              <span className={styles.listHeaderMeta}>格式</span>
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
                    <span className={styles.listFileName}>
                      {getDeviceName(image.cameraMake, image.cameraModel) || image.fileName}
                    </span>
                    {image.width && image.height && (
                      <span className={styles.listFileSize}>{image.width}x{image.height}</span>
                    )}
                    <span className={styles.listFileSize}>{formatFileSize(image.fileSize)}</span>
                    <Button
                      variant="danger"
                      size="sm"
                      iconOnly
                      className={styles.listDeleteBtn}
                      onClick={() => handleDeleteImage(image.id)}
                      title="删除"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <div className={styles.listParams}>{formatExifParams(image)}</div>
                  <div className={styles.listMeta}>
                    <span className={styles.listExt}>{ext}</span>
                    {raw && <span className={styles.rawBadge}>RAW</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

        {/* Floating action buttons */}
        <Tooltip.Provider delayDuration={200}>
          <div
            className={`${styles.fab} ${fabOpen ? styles.fabOpen : ""}`}
            onMouseEnter={() => setFabOpen(true)}
            onMouseLeave={() => setFabOpen(false)}
          >
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  className={styles.fabItem}
                  onClick={handleImportFiles}
                  disabled={isImporting}
                >
                  <ImagePlus size={18} />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Content side="left">导入图片</Tooltip.Content>
            </Tooltip.Root>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  className={styles.fabItem}
                  onClick={handleImportFolder}
                  disabled={isImporting}
                >
                  <FolderPlus size={18} />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Content side="left">添加文件夹</Tooltip.Content>
            </Tooltip.Root>
            <button className={styles.fabTrigger}>
              <Plus size={22} />
            </button>
          </div>
        </Tooltip.Provider>
    </div>
    </Tabs.Root>
  );
};

export default LibraryPage;

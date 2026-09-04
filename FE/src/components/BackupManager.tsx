import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  Backup,
  CloudDownload,
  Delete,
  Refresh,
  Restore,
  Storage,
} from "@mui/icons-material";

import { useCallback, useEffect, useState } from "react";

import dayjs from "dayjs";

import { api } from "../utils/api";

import { toast } from "react-toastify";

interface BackupItem {
  filename: string;
  size: number;
  createdAt: string;
}

const BackupManager = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [backups, setBackups] = useState<BackupItem[]>([]);

  const [loading, setLoading] = useState(false);

  const [creating, setCreating] = useState(false);

  const [deletingFile, setDeletingFile] = useState<string | null>(null);

  const [restoringFile, setRestoringFile] = useState<string | null>(null);

  const [restoringRealFile, setRestoringRealFile] = useState<string | null>(
    null
  );

  // =====================================================
  // FORMAT SIZE
  // =====================================================

  const formatFileSize = (bytes: number) => {
    if (!bytes) {
      return "0 KB";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // =====================================================
  // FETCH
  // =====================================================

  const fetchBackups = useCallback(async () => {
    try {
      setLoading(true);

      const data = await api.backup.getAll();

      setBackups(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Không thể tạo bản sao lưu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  // =====================================================
  // CREATE
  // =====================================================

  const handleCreateBackup = async () => {
    try {
      setCreating(true);

      const result = await api.backup.create();

      toast.success(result.message || "Sao lưu dữ liệu thành công");

      await fetchBackups();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể tạo bản sao lưu"
      );
    } finally {
      setCreating(false);
    }
  };

  // =====================================================
  // DOWNLOAD
  // =====================================================

  const handleDownload = (filename: string) => {
    const url = api.backup.getDownloadUrl(filename);

    const link = document.createElement("a");

    link.href = url;

    link.download = filename;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  // =====================================================
  // RESTORE TEST
  // =====================================================

  const handleRestoreTest = async (filename: string) => {
    const confirmed = window.confirm(
      `Khôi phục bản sao lưu này?\n\n` +
        `${filename}\n\n` +
        `Dữ liệu sẽ được khôi phục vào database TEST:\n` +
        `TinhTien_Restore_Test\n\n` +
        `Database TinhTien hiện tại sẽ KHÔNG bị thay đổi.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setRestoringFile(filename);

      const result = await api.backup.restoreTest(filename);

      toast.success(result.message || "Khôi phục dữ liệu test thành công");
    } catch (error) {
      console.error("Không thể restore backup:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể khôi phục dữ liệu test"
      );
    } finally {
      setRestoringFile(null);
    }
  };

  // =====================================================
  // RESTORE DATABASE THẬT
  // =====================================================

  const handleRestoreReal = async (filename: string) => {
    // ================= CONFIRM 1 =================

    const confirmed = window.confirm(
      `CẢNH BÁO!\n\n` +
        `Bạn đang chuẩn bị khôi phục DATABASE THẬT.\n\n` +
        `File:\n${filename}\n\n` +
        `Dữ liệu hiện tại sẽ bị thay thế bằng dữ liệu trong bản backup.\n\n` +
        `Hệ thống sẽ tự tạo một bản backup an toàn trước khi khôi phục.\n\n` +
        `Bạn có muốn tiếp tục?`
    );

    if (!confirmed) {
      return;
    }

    // ================= CONFIRM 2 =================

    const confirmation = window.prompt(
      `Để xác nhận, hãy nhập chính xác:\n\nKHOI PHUC`
    );

    if (confirmation !== "KHOI PHUC") {
      toast.warning('Bạn chưa nhập đúng "KHOI PHUC". Đã hủy khôi phục.');

      return;
    }

    // ================= RESTORE =================

    try {
      setRestoringRealFile(filename);

      const result = await api.backup.restore(filename, confirmation);

      toast.success("Khôi phục database thành công");

      // Reload backup list
      await fetchBackups();

      // Reload app để lấy lại toàn bộ
      // dữ liệu từ database vừa restore
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Không thể restore database:", error);

      alert(
        error instanceof Error ? error.message : "Không thể khôi phục database"
      );
    } finally {
      setRestoringRealFile(null);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (filename: string) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa bản sao lưu này?\n\n${filename}`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingFile(filename);

      await api.backup.delete(filename);

      toast.success("Đã xóa bản sao lưu");

      await fetchBackups();
    } catch (error) {
      console.error("Không thể xóa backup:", error);

      alert(
        error instanceof Error ? error.message : "Không thể xóa bản sao lưu"
      );
    } finally {
      setDeletingFile(null);
    }
  };

  const latestBackup = backups.length > 0 ? backups[0] : null;

  return (
    <Paper
      sx={{
        p: {
          xs: 2,
          md: 3,
        },
        borderRadius: 3,
      }}
    >
      {/* ================= HEADER ================= */}

      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          justifyContent: "space-between",
          alignItems: {
            xs: "stretch",
            sm: "center",
          },
          gap: 2,
          mb: 2.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Storage
            color="primary"
            sx={{
              fontSize: 30,
            }}
          />

          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
            >
              Sao Lưu Dữ Liệu
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Quản lý các bản sao lưu MongoDB
            </Typography>
          </Box>
        </Box>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
        >
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchBackups}
            disabled={loading}
          >
            Làm mới
          </Button>

          <Button
            variant="contained"
            startIcon={
              creating ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <Backup />
              )
            }
            onClick={handleCreateBackup}
            disabled={creating}
          >
            {creating ? "Đang sao lưu..." : "Tạo bản sao lưu"}
          </Button>
        </Stack>
      </Box>

      {/* ================= LATEST ================= */}

      <Card
        variant="outlined"
        sx={{
          mb: 2.5,
          borderRadius: 2,
          backgroundColor: "action.hover",
        }}
      >
        <CardContent>
          <Typography variant="caption" color="text.secondary">
            Backup gần nhất
          </Typography>

          {latestBackup ? (
            <>
              <Typography
                sx={{
                  mt: 0.5,
                  fontWeight: 700,
                }}
              >
                {dayjs(latestBackup.createdAt).format("DD/MM/YYYY HH:mm:ss")}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                {latestBackup.filename}
                {" • "}
                {formatFileSize(latestBackup.size)}
              </Typography>
            </>
          ) : (
            <Typography
              sx={{
                mt: 0.5,
                fontWeight: 600,
              }}
              color="text.secondary"
            >
              Chưa có bản sao lưu
            </Typography>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ mb: 2 }} />

      {/* ================= LIST TITLE ================= */}

      <Typography
        sx={{
          fontWeight: 700,
          mb: 1.5,
        }}
      >
        Danh sách bản sao lưu
      </Typography>

      {/* ================= LOADING ================= */}

      {loading ? (
        <Box
          sx={{
            py: 5,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : backups.length === 0 ? (
        <Box
          sx={{
            py: 5,
            textAlign: "center",
          }}
        >
          <Backup
            sx={{
              fontSize: 48,
              color: "text.disabled",
              mb: 1,
            }}
          />

          <Typography color="text.secondary">
            Chưa có bản sao lưu nào
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1}>
          {backups.map((backup) => (
            <Box
              key={backup.filename}
              sx={{
                display: "flex",
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
                alignItems: {
                  xs: "stretch",
                  sm: "center",
                },
                justifyContent: "space-between",
                gap: 1.5,
                p: 1.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              {/* INFO */}

              <Box
                sx={{
                  minWidth: 0,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {backup.filename}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  {dayjs(backup.createdAt).format("DD/MM/YYYY HH:mm")}
                  {" • "}
                  {formatFileSize(backup.size)}
                </Typography>
              </Box>

              {/* ACTION */}

              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  justifyContent: {
                    xs: "flex-end",
                    sm: "center",
                  },
                }}
              >
                {isMobile ? (
                  <>
                    {/* TẢI XUỐNG */}

                    <IconButton
                      color="primary"
                      onClick={() => handleDownload(backup.filename)}
                    >
                      <CloudDownload />
                    </IconButton>

                    {/* KHÔI PHỤC */}

                    <IconButton
                      color="warning"
                      disabled={
                        restoringRealFile === backup.filename ||
                        restoringFile === backup.filename
                      }
                      onClick={() => handleRestoreReal(backup.filename)}
                    >
                      {restoringRealFile === backup.filename ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Restore />
                      )}
                    </IconButton>

                    {/* XÓA */}

                    <IconButton
                      color="error"
                      disabled={deletingFile === backup.filename}
                      onClick={() => handleDelete(backup.filename)}
                    >
                      {deletingFile === backup.filename ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Delete />
                      )}
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<CloudDownload />}
                      onClick={() => handleDownload(backup.filename)}
                    >
                      Tải xuống
                    </Button>

                    <Button
                      size="small"
                      variant="contained"
                      color="warning"
                      startIcon={
                        restoringRealFile === backup.filename ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <Restore />
                        )
                      }
                      disabled={
                        restoringRealFile === backup.filename ||
                        restoringFile === backup.filename
                      }
                      onClick={() => handleRestoreReal(backup.filename)}
                    >
                      {restoringRealFile === backup.filename
                        ? "Đang khôi phục..."
                        : "Khôi phục"}
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      startIcon={
                        restoringFile === backup.filename ? (
                          <CircularProgress size={16} />
                        ) : (
                          <Restore />
                        )
                      }
                      disabled={restoringFile === backup.filename}
                      onClick={() => handleRestoreTest(backup.filename)}
                    >
                      {restoringFile === backup.filename
                        ? "Đang khôi phục"
                        : "Khôi phục test"}
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={
                        deletingFile === backup.filename ? (
                          <CircularProgress size={16} />
                        ) : (
                          <Delete />
                        )
                      }
                      disabled={deletingFile === backup.filename}
                      onClick={() => handleDelete(backup.filename)}
                    >
                      Xóa
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

export default BackupManager;

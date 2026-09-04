import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { Close, ContentCopy, Download, Share } from "@mui/icons-material";

import { useState } from "react";

import { toBlob, toPng } from "html-to-image";

import { toast } from "react-toastify";

import OwnerMonthlyReportCard from "./OwnerMonthlyReportCard";

interface Props {
  open: boolean;

  onClose: () => void;

  ownerName: string;

  animalTypeName: string;

  month: string;

  summary: any;
}

const OwnerMonthlyReportDialog = ({
  open,
  onClose,

  ownerName,

  animalTypeName,

  month,

  summary,
}: Props) => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [processing, setProcessing] = useState(false);

  const getFilename = () => {
    const owner = ownerName.trim().replace(/\s+/g, "_");

    return `BaoCaoThang_${owner}_${month}.png`;
  };

  const getElement = () => document.getElementById("owner-monthly-report-card");

  // =====================================================
  // DOWNLOAD
  // =====================================================

  const handleDownload = async () => {
    const element = getElement();

    if (!element) {
      toast.error("Không tìm thấy báo cáo");

      return;
    }

    try {
      setProcessing(true);

      const dataUrl = await toPng(element, {
        pixelRatio: 2,

        cacheBust: true,

        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");

      link.download = getFilename();

      link.href = dataUrl;

      link.click();

      toast.success("Đã tải ảnh báo cáo");
    } catch (error) {
      console.error(error);

      toast.error("Không thể tạo ảnh báo cáo");
    } finally {
      setProcessing(false);
    }
  };

  // =====================================================
  // COPY
  // =====================================================

  const handleCopy = async () => {
    const element = getElement();

    if (!element) {
      return;
    }

    try {
      setProcessing(true);

      const blob = await toBlob(element, {
        pixelRatio: 2,

        cacheBust: true,

        backgroundColor: "#ffffff",
      });

      if (!blob) {
        throw new Error("Không thể tạo ảnh");
      }

      if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
        toast.warning("Trình duyệt không hỗ trợ sao chép ảnh");

        return;
      }

      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);

      toast.success("Đã sao chép ảnh báo cáo");
    } catch (error) {
      console.error(error);

      toast.error("Không thể sao chép ảnh");
    } finally {
      setProcessing(false);
    }
  };

  // =====================================================
  // SHARE
  // =====================================================

  const handleShare = async () => {
    const element = getElement();

    if (!element) {
      return;
    }

    try {
      setProcessing(true);

      const blob = await toBlob(element, {
        pixelRatio: 2,

        cacheBust: true,

        backgroundColor: "#ffffff",
      });

      if (!blob) {
        throw new Error("Không thể tạo ảnh");
      }

      const file = new File([blob], getFilename(), {
        type: "image/png",
      });

      if (
        navigator.share &&
        navigator.canShare?.({
          files: [file],
        })
      ) {
        await navigator.share({
          title: "Báo cáo chi phí tháng",

          text: `Báo cáo tháng ${month} - ${ownerName}`,

          files: [file],
        });

        return;
      }

      toast.info("Thiết bị không hỗ trợ chia sẻ trực tiếp");
    } catch (error: any) {
      if (error?.name === "AbortError") {
        return;
      }

      console.error(error);

      toast.error("Không thể chia sẻ báo cáo");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={processing ? undefined : onClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="md"
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0,0,0,0.65)",

            backdropFilter: "blur(3px)",
          },
        },

        paper: {
          sx: {
            borderRadius: isMobile ? 0 : 3,

            backgroundImage: "none",

            overflow: "hidden",
          },
        },
      }}
    >
      {/* HEADER */}

      <Box
        sx={{
          p: {
            xs: 2,
            sm: 2.5,
          },

          display: "flex",

          justifyContent: "space-between",

          alignItems: "center",

          borderBottom: "1px solid",

          borderColor: "divider",
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
            }}
          >
            Báo Cáo Tháng
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {ownerName} • {animalTypeName}
          </Typography>
        </Box>

        <IconButton onClick={onClose} disabled={processing}>
          <Close />
        </IconButton>
      </Box>

      {/* PREVIEW */}

      <Box
        sx={{
          p: {
            xs: 1.5,
            sm: 3,
          },

          overflowX: "auto",

          backgroundColor: "background.default",
        }}
      >
        <Box
          sx={{
            width: "fit-content",

            mx: "auto",

            transformOrigin: "top center",

            ...(isMobile && {
              zoom: 0.47,
            }),
          }}
        >
          <OwnerMonthlyReportCard
            ownerName={ownerName}
            animalTypeName={animalTypeName}
            month={month}
            totalDays={Number(summary?.totalDays || 0)}
            totalQuantity={Number(summary?.totalQuantity || 0)}
            calculatedDays={Number(summary?.calculatedDays || 0)}
            totalCost={Number(summary?.totalCost || 0)}
            totalPaid={Number(summary?.totalPaid || 0)}
            totalUnpaid={Number(summary?.totalUnpaid || 0)}
            paidDays={Number(summary?.paidDays || 0)}
            unpaidDays={Number(summary?.unpaidDays || 0)}
          />
        </Box>
      </Box>

      {/* ACTION */}

      <Box
        sx={{
          p: 2,

          display: "flex",

          flexDirection: {
            xs: "column",
            sm: "row",
          },

          justifyContent: "flex-end",

          gap: 1,

          borderTop: "1px solid",

          borderColor: "divider",
        }}
      >
        {!isMobile && (
          <Button
            variant="outlined"
            startIcon={<ContentCopy />}
            disabled={processing}
            onClick={handleCopy}
          >
            Sao Chép Ảnh
          </Button>
        )}

        <Button
          variant="outlined"
          startIcon={<Download />}
          disabled={processing}
          onClick={handleDownload}
        >
          Tải PNG
        </Button>

        <Button
          variant="contained"
          startIcon={
            processing ? (
              <CircularProgress size={17} color="inherit" />
            ) : (
              <Share />
            )
          }
          disabled={processing}
          onClick={handleShare}
        >
          Chia Sẻ
        </Button>
      </Box>
    </Dialog>
  );
};

export default OwnerMonthlyReportDialog;

// "use client";

// import React, { useEffect, useState, useRef } from "react";
// import { useSession } from "next-auth/react";
// import { useParams, useRouter } from "next/navigation";
// import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
// import AppShell from "@/components/layout/AppShell";
// import {
//   GlobalWorkerOptions,
//   getDocument,
//   version as pdfjsVersion,
// } from "pdfjs-dist/legacy/build/pdf";

// // ✅ 配置 pdf.worker 路径（避免 SSR 报错）
// GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;

// export default function StaffCheckInPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const params = useParams();
//   const userId = params.userId as string;

//   const [ticketCode, setTicketCode] = useState("");
//   const [checkinResult, setCheckinResult] = useState("");
//   const [resultColor, setResultColor] = useState("gray");
//   const scannerRef = useRef<HTMLDivElement | null>(null);

//   // ✅ 权限检查
//   if (status === "loading") return null;
//   if (
//     !session?.user ||
//     session.user.role !== "Staff" ||
//     session.user.id !== userId
//   ) {
//     return <div className="p-6">Access Denied</div>;
//   }

//   // ✅ 启动摄像头扫码
//   useEffect(() => {
//     if (!scannerRef.current) return;

//     const scanner = new Html5QrcodeScanner(
//       "html5-qrcode-scanner",
//       { fps: 10, qrbox: 250 },
//       false,
//     );

//     scanner.render(
//       (decodedText) => {
//         setTicketCode(decodedText);
//         handleCheckIn(decodedText);
//       },
//       () => {},
//     );

//     return () => scanner.clear().catch(console.error);
//   }, []);

//   // ✅ 核销逻辑
//   const handleCheckIn = async (code?: string) => {
//     const c = code || ticketCode;
//     if (!c) {
//       setCheckinResult("Please enter or scan a ticket code first");
//       setResultColor("gray");
//       return;
//     }

//     try {
//       const res1 = await fetch("/api/tickets/resolve", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ code: c }),
//       });
//       const data1 = await res1.json();
//       if (!res1.ok) throw new Error(data1.error || "Resolve failed");

//       const res2 = await fetch(`/api/tickets/${data1.ticketId}/checkin`, {
//         method: "POST",
//       });
//       const data2 = await res2.json();
//       if (!res2.ok) throw new Error(data2.error || "Check-in failed");

//       setCheckinResult(`✅ ${data2.message}`);
//       setResultColor("green");
//     } catch (err: any) {
//       setCheckinResult(`❌ ${err.message}`);
//       setResultColor("red");
//     }
//   };

//   // ✅ 上传 image 或 pdf
//   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const qr = new Html5Qrcode("temp-qr-region");

//     if (file.type === "application/pdf") {
//       // 👉 处理 PDF
//       try {
//         const arrayBuffer = await file.arrayBuffer();
//         const pdf = await getDocument({ data: arrayBuffer }).promise;
//         const page = await pdf.getPage(1);

//         const viewport = page.getViewport({ scale: 2.0 });
//         const canvas = document.createElement("canvas");
//         const context = canvas.getContext("2d")!;
//         canvas.width = viewport.width;
//         canvas.height = viewport.height;
//         await page.render({ canvasContext: context, viewport }).promise;
//         const dataUrl = canvas.toDataURL();

//         // 尝试图像识别
//         try {
//           const result = await qr.scanFile(dataUrl, true);
//           setTicketCode(result);
//           handleCheckIn(result);
//         } catch (imgErr) {
//           // 尝试文本提取 fallback
//           const textContent = await page.getTextContent();
//           const extractedText = textContent.items
//             .map((item: any) => item.str)
//             .join(" ");
//           const match = extractedText.match(/TICKET-[\w-]+/);
//           if (match) {
//             setTicketCode(match[0]);
//             handleCheckIn(match[0]);
//           } else {
//             throw new Error("QR not found in PDF");
//           }
//         }
//       } catch (err) {
//         console.error("QR not found in file:", err);
//         setCheckinResult("❌ QR not found in PDF");
//         setResultColor("red");
//       } finally {
//         qr.clear();
//       }
//     } else {
//       // 👉 处理 image
//       try {
//         const result = await qr.scanFile(file, true);
//         setTicketCode(result);
//         handleCheckIn(result);
//       } catch (err) {
//         console.error("QR not found in image:", err);
//         setCheckinResult("❌ QR not found in image");
//         setResultColor("red");
//       } finally {
//         qr.clear();
//       }
//     }
//   };

//   return (
//     <AppShell>
//       <div className="p-6">
//         <h1 className="text-2xl font-bold mb-4">Check-in Interface</h1>

//         {/* ✅ 上传区域 */}
//         <div className="my-4 border-dashed border-2 border-gray-300 p-4 rounded">
//           <label className="block mb-2 font-medium">
//             Upload PDF (with QR Code)
//           </label>
//           <input
//             type="file"
//             accept="image/*,application/pdf"
//             onChange={handleFileUpload}
//             className="text-sm"
//           />
//         </div>

//         {/* camera */}
//         <div
//           id="html5-qrcode-scanner"
//           ref={scannerRef}
//           style={{ width: "100%", maxWidth: 600 }}
//         />

//         {/* scan result */}
//         <div
//           className={`mt-4 text-sm border p-2 rounded bg-${resultColor}-100 text-${resultColor}-800`}
//         >
//           {checkinResult || "Awaiting scan..."}
//         </div>

//         {/* manual input */}
//         <div className="mb-4 mt-4">
//           <label className="block mb-1 font-medium">Ticket Code</label>
//           <input
//             className="border rounded p-2 w-full"
//             value={ticketCode}
//             onChange={(e) => setTicketCode(e.target.value)}
//             placeholder="Scan or manually enter code"
//           />
//         </div>
//         <button
//           onClick={() => handleCheckIn()}
//           className="bg-blue-500 text-white px-4 py-2 rounded"
//         >
//           Check In
//         </button>

//         {/* ✅ 隐藏容器 */}
//         <div id="temp-qr-region" style={{ display: "none" }} />
//       </div>
//     </AppShell>
//   );
// }

"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import AppShell from "@/components/layout/AppShell";
import {
  GlobalWorkerOptions,
  getDocument,
  version as pdfjsVersion,
} from "pdfjs-dist/legacy/build/pdf";

// ✅ 设置 worker 路径
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;

export default function StaffCheckInPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const userId = params.userId as string;

  const [ticketCode, setTicketCode] = useState("");
  const [checkinResult, setCheckinResult] = useState("");
  const [resultColor, setResultColor] = useState("gray");
  const scannerRef = useRef<HTMLDivElement | null>(null);

  // ✅ 启动摄像头扫码
  useEffect(() => {
    if (!scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      "html5-qrcode-scanner",
      { fps: 10, qrbox: 250 },
      false,
    );

    scanner.render(
      (decodedText) => {
        setTicketCode(decodedText);
        handleCheckIn(decodedText);
      },
      () => {},
    );

    return () => scanner.clear().catch(console.error);
  }, []);

  // ✅ 核销逻辑
  const handleCheckIn = async (code?: string) => {
    const c = code || ticketCode;
    if (!c) {
      setCheckinResult("Please enter or scan a ticket code first");
      setResultColor("gray");
      return;
    }

    try {
      const res1 = await fetch("/api/tickets/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: c }),
      });
      const data1 = await res1.json();
      if (!res1.ok) throw new Error(data1.error || "Resolve failed");

      const res2 = await fetch(`/api/tickets/${data1.ticketId}/checkin`, {
        method: "POST",
      });
      const data2 = await res2.json();
      if (!res2.ok) throw new Error(data2.error || "Check-in failed");

      setCheckinResult(`✅ ${data2.message}`);
      setResultColor("green");
    } catch (err: any) {
      setCheckinResult(`❌ ${err.message}`);
      setResultColor("red");
    }
  };

  // ✅ 上传 image/pdf 文件
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const qr = new Html5Qrcode("temp-qr-region");

    if (file.type === "application/pdf") {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        const dataUrl = canvas.toDataURL();

        try {
          const result = await qr.scanFile(dataUrl, true);
          setTicketCode(result);
          handleCheckIn(result);
        } catch {
          const textContent = await page.getTextContent();
          const extracted = textContent.items.map((i: any) => i.str).join(" ");
          const match = extracted.match(/TICKET-[\w-]+/);
          if (match) {
            setTicketCode(match[0]);
            handleCheckIn(match[0]);
          } else {
            throw new Error("QR not found in PDF");
          }
        }
      } catch (err) {
        console.error("QR not found in file:", err);
        setCheckinResult("❌ QR not found in PDF");
        setResultColor("red");
      } finally {
        qr.clear();
      }
    } else {
      try {
        const result = await qr.scanFile(file, true);
        setTicketCode(result);
        handleCheckIn(result);
      } catch (err) {
        console.error("QR not found in image:", err);
        setCheckinResult("❌ QR not found in image");
        setResultColor("red");
      } finally {
        qr.clear();
      }
    }
  };

  // ✅ 权限检查（放在最后，确保 hooks 不被跳过）
  if (status === "loading") return null;
  if (
    !session?.user ||
    session.user.role !== "Staff" ||
    session.user.id !== userId
  ) {
    return <div className="p-6">Access Denied</div>;
  }

  return (
    <AppShell>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Check-in Interface</h1>

        {/* 上传文件 */}
        <div className="my-4 border-dashed border-2 border-gray-300 p-4 rounded">
          <label className="block mb-2 font-medium">Upload Image or PDF</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            className="text-sm"
          />
        </div>

        {/* 摄像头区域 */}
        <div
          id="html5-qrcode-scanner"
          ref={scannerRef}
          style={{ width: "100%", maxWidth: 600 }}
        />

        {/* 结果显示 */}
        <div
          className={`mt-4 text-sm border p-2 rounded bg-${resultColor}-100 text-${resultColor}-800`}
        >
          {checkinResult || "Awaiting scan..."}
        </div>

        {/* 手动输入 */}
        <div className="mb-4 mt-4">
          <label className="block mb-1 font-medium">Ticket Code</label>
          <input
            className="border rounded p-2 w-full"
            value={ticketCode}
            onChange={(e) => setTicketCode(e.target.value)}
            placeholder="Scan or manually enter code"
          />
        </div>
        <button
          onClick={() => handleCheckIn()}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Check In
        </button>

        {/* 临时扫码区域 */}
        <div id="temp-qr-region" style={{ display: "none" }} />
      </div>
    </AppShell>
  );
}

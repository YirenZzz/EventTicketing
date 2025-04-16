// "use client";

// import React, { useEffect, useState, useRef } from "react";
// import { useSession } from "next-auth/react";
// import { useParams, useRouter } from "next/navigation";
// import { Html5QrcodeScanner } from "html5-qrcode";

// /**
//  * StaffCheckInPage: 使用 html5-qrcode 来扫描二维码
//  */
// export default function StaffCheckInPage() {
//   const { data: session } = useSession();
//   const router = useRouter();
//   const params = useParams();
//   const userId = params.userId as string;

//   // 用于手动输入/展示扫描结果
//   const [ticketCode, setTicketCode] = useState("");
//   const [checkinResult, setCheckinResult] = useState("");

//   // 我们需要一个ID容器来放置扫描器
//   const scannerRef = useRef<HTMLDivElement | null>(null);

//   // 校验Staff身份
//   if (session.user.role !== "Staff" || session.user.id !== userId) {
//     return <div className="p-6">Access Denied</div>;
//   }

//   useEffect(() => {
//     // 如果 scannerRef 存在，则初始化
//     if (scannerRef.current) {
//       // fps: 帧率, qrbox: 扫描框大小
//       const scanner = new Html5QrcodeScanner(
//         "html5-qrcode-scanner",
//         { fps: 10, qrbox: 250 },
//         /* verbose= */ false,
//       );

//       function onScanSuccess(decodedText: string, decodedResult: any) {
//         // 拿到扫描结果
//         setTicketCode(decodedText);
//         setCheckinResult(`Scanned code: ${decodedText}`);
//         // 你也可以自动提交检查:
//         // handleCheckIn(decodedText);
//         // 如果想自动 "停止扫描"
//         // scanner.clear();
//       }

//       function onScanFailure(error: any) {
//         // 扫描失败时的回调（可忽略或打印日志）
//         // console.warn(Scan failure: ${error});
//       }

//       scanner.render(onScanSuccess, onScanFailure);

//       // 卸载时清除
//       return () => {
//         // scanner.clear().catch((err) => console.error(err));
//       };
//     }
//   }, []);

//   // 点击按钮时调用后端 API
//   const handleCheckIn = async (code?: string) => {
//     const c = code || ticketCode;
//     if (!c) {
//       setCheckinResult("Please enter or scan a ticket code first");
//       return;
//     }
//     try {
//       const res = await fetch("/api/tickets/checkin", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ticketCode: c }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Check-in failed");
//       setCheckinResult(`Check-in success: ${data.message}`);
//     } catch (err: any) {
//       setCheckinResult(err.message);
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">
//         Check-in Interface (Html5Qrcode)
//       </h1>

//       {/* 1) 放一个容器用于渲染扫描器 */}
//       <div
//         id="html5-qrcode-scanner"
//         ref={scannerRef}
//         style={{ width: "100%", maxWidth: 600 }}
//       />

//       {/* 2) 显示扫描结果或提示 */}
//       {checkinResult && (
//         <div className="mt-4 text-sm border p-2 rounded bg-gray-50">
//           {checkinResult}
//         </div>
//       )}

//       {/* 3) 手动输入 ticketCode */}
//       <div className="mb-4 mt-4">
//         <label className="block mb-1 font-medium">Ticket Code</label>
//         <input
//           className="border rounded p-2 w-full"
//           value={ticketCode}
//           onChange={(e) => setTicketCode(e.target.value)}
//           placeholder="Scan or manually enter code"
//         />
//       </div>
//       <button
//         onClick={() => handleCheckIn()}
//         className="bg-blue-500 text-white px-4 py-2 rounded"
//       >
//         Check In
//       </button>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function StaffCheckInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [ticketCode, setTicketCode] = useState("");
  const [checkinResult, setCheckinResult] = useState("");
  const [resultColor, setResultColor] = useState("gray");

  const scannerRef = useRef<HTMLDivElement | null>(null);

  if (status === "loading") return null;
  if (
    !session?.user ||
    session.user.role !== "Staff" ||
    session.user.id !== userId
  ) {
    return <div className="p-6">Access Denied</div>;
  }

  useEffect(() => {
    if (scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "html5-qrcode-scanner",
        { fps: 10, qrbox: 250 },
        false,
      );

      function onScanSuccess(decodedText: string) {
        setTicketCode(decodedText);
        handleCheckIn(decodedText); // ✅ 自动核验
      }

      function onScanFailure(error: any) {
        // 可忽略
      }

      scanner.render(onScanSuccess, onScanFailure);

      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, []);

  // ✅ 更新后的核销逻辑
  const handleCheckIn = async (code?: string) => {
    const c = code || ticketCode;
    if (!c) {
      setCheckinResult("Please enter or scan a ticket code first");
      setResultColor("gray");
      return;
    }

    try {
      // Step 1: resolve ticketId from code
      const res1 = await fetch("/api/tickets/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: c }),
      });
      const data1 = await res1.json();
      if (!res1.ok) throw new Error(data1.error || "Resolve failed");

      // Step 2: send check-in request
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Check-in Interface (Html5Qrcode)
      </h1>

      {/* 扫描器容器 */}
      <div
        id="html5-qrcode-scanner"
        ref={scannerRef}
        style={{ width: "100%", maxWidth: 600 }}
      />

      {/* 显示结果 */}
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
    </div>
  );
}

// app/signup/page.tsx
// "use client";

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";

// export default function SignupPage() {
//   const router = useRouter();
  
//   // 表单状态：收集 email, name, password
//   const [email, setEmail] = useState("");
//   const [name, setName] = useState("");
//   const [password, setPassword] = useState("");
  
//   // 用于显示错误/成功提示
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   async function handleSignup(e: React.FormEvent) {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     // 简单校验
//     if (!email || !name || !password) {
//       setError("Please fill all fields.");
//       return;
//     }

//     try {
//       // 调用你写好的 /api/users 接口
//       const res = await fetch("/api/users", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, name, password }),
//       });
//       const data = await res.json();

//       if (!res.ok) {
//         // 如果服务器响应不是 2xx
//         setError(data.error || "Signup failed");
//       } else {
//         setSuccess("Signup successful! You can now log in.");
//         // 或者：router.push("/login")，跳转到登录页
//       }

//     } catch (err: any) {
//       console.error(err);
//       setError("Something went wrong.");
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <form onSubmit={handleSignup} className="bg-white p-8 rounded shadow-md w-full max-w-md">
//         <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
//         {error && <p className="text-red-500 mb-4">{error}</p>}
//         {success && <p className="text-green-500 mb-4">{success}</p>}

//         <label htmlFor="email" className="block mb-2">Email:</label>
//         <input
//           id="email"
//           type="email"
//           className="border p-2 mb-4 w-full"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />

//         <label htmlFor="name" className="block mb-2">Name:</label>
//         <input
//           id="name"
//           type="text"
//           className="border p-2 mb-4 w-full"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />

//         <label htmlFor="password" className="block mb-2">Password:</label>
//         <input
//           id="password"
//           type="password"
//           className="border p-2 mb-4 w-full"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />

//         <button
//           type="submit"
//           className="bg-blue-500 text-white py-2 px-4 rounded w-full"
//         >
//           Sign Up
//         </button>

//         <div className="mt-4 text-sm text-gray-700">
//           Already have an account?{" "}
//           <a href="/login" className="text-blue-600 underline">
//             Login here
//           </a>
//         </div>
//       </form>
//     </div>
//   );
// }






"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [role, setRole] = useState("Attendee"); // 新增：角色选择
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // 提交注册
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPass) {
      setError("Password and Confirm Password do not match.");
      return;
    }

    setLoading(true);

    try {
      // 调用 /api/users (或你已有的 signup API) 并发送 role
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // 后端需要什么字段就传什么
          name,
          email,
          password,
          role, // 关键：一起传给后端
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create user");
      } else {
        setSuccess("Signup successful! You can now log in.");
        // 可选：自动跳到 /login
        // router.push("/login");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen">
      {/* 左侧白色背景区域 */}
      <section className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-12 lg:px-24 bg-white">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="flex items-center mb-8">
            <img
              src="/your-logo.png"  /* 替换成你自己的LOGO */
              alt="Logo"
              className="h-8 w-8 mr-2"
            />
            <h1 className="text-2xl font-bold">hi.events</h1>
          </div>

          {/* 标题与说明 */}
          <h2 className="text-3xl font-semibold mb-2">
            Create an account <span className="wave-emoji">👋</span>
          </h2>
          <p className="text-gray-600 mb-6">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>

          {/* 显示错误或成功提示 */}
          {error && (
            <p className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">
              {error}
            </p>
          )}
          {success && (
            <p className="bg-green-100 text-green-600 p-2 rounded mb-4 text-sm">
              {success}
            </p>
          )}

          {/* 注册表单 */}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  className="border rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="John"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  className="border rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="Smith"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div> */}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                className="border rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  className="border rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  className="border rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="Confirm password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Role Selection：Organizer/Staff/Attendee */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Your Role
              </label>
              <select
                className="border rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Organizer">Organizer</option>
                <option value="Staff">Staff</option>
                <option value="Attendee">Attendee</option>
              </select>
            </div>

            {/* 注册按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="bg-pink-500 hover:bg-pink-600 text-white w-full py-2 rounded mb-4"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          {/* 同意条款 */}
          <p className="text-sm text-gray-500 mb-6">
            By registering you agree to our{" "}
            <Link href="#" className="underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline">
              Privacy Policy
            </Link>.
          </p>

          {/* 底部 */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>Powered by Hi.Events 🚀</div>
            <select className="border rounded px-2 py-1 text-gray-700">
              <option>English</option>
              <option>Français</option>
              <option>中文</option>
            </select>
          </div>
        </div>
      </section>

      {/* 右侧渐变背景 */}
      <section className="hidden md:flex md:w-1/2 bg-gradient-to-r from-purple-400 via-pink-500 to-pink-600 text-white flex-col justify-center px-10">
        <div className="max-w-md">
          <h3 className="text-2xl font-bold mb-4">Instant Setup</h3>
          <p className="mb-6">
            Create and customize your event in minutes
          </p>
          <h3 className="text-2xl font-bold mb-4">No CC Required</h3>
          <p className="mb-6">
            Get started for free, no subscription fees
          </p>
          <h3 className="text-2xl font-bold mb-4">Manage All in One Place</h3>
          <p className="mb-6">
            Ticket sales, check-ins, analytics, and more
          </p>
        </div>
      </section>
    </main>
  );
}




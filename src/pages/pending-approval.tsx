import { useClerk, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function PendingApproval() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    // Kalo user udah active, redirect ke dashboard
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/user/status");
        const data = await res.json();
        if (data.status === "active") {
          router.push("/drive/my-drive");
          return;
        }
      } catch {
        // ignore
      }
      setChecking(false);
    };

    checkStatus();
  }, [isLoaded, router]);

  if (!isLoaded || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bgc">
        <p className="text-textC">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bgc px-4">
      <div className="max-w-md text-center">
        <div className="mb-6 text-6xl">⏳</div>
        <h1 className="mb-2 text-2xl font-semibold text-textC">
          Akun Menunggu Persetujuan
        </h1>
        <p className="mb-2 text-gray-500">
          Akun kamu <strong>{user?.emailAddresses?.[0]?.emailAddress}</strong>{" "}
          masih menunggu persetujuan dari admin.
        </p>
        <p className="mb-6 text-sm text-gray-400">
          Silakan coba lagi nanti setelah disetujui. Halaman ini akan otomatis
          mengarahkan kamu ke dashboard setelah akun di-approve.
        </p>
        <button
          onClick={() => signOut({ redirectUrl: "/login" })}
          className="rounded-lg bg-gray-200 px-6 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
        >
          Keluar
        </button>
      </div>
    </div>
  );
}

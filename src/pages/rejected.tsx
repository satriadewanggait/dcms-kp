import { useClerk, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function RejectedPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userStatus, setUserStatus] = useState<string>("");

  useEffect(() => {
    if (!isLoaded) return;

    const checkStatus = async () => {
      try {
        const res = await fetch("/api/user/status");
        const data = await res.json();
        setUserStatus(data.status);
        // Kalo status berubah jadi active
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

  const isInactive = userStatus === "inactive";

  return (
    <div className="flex min-h-screen items-center justify-center bg-bgc px-4">
      <div className="max-w-md text-center">
        <div className="mb-6 text-6xl">{isInactive ? "💤" : "🚫"}</div>
        <h1 className="mb-2 text-2xl font-semibold text-textC">
          {isInactive ? "Akun Nonaktif" : "Akun Ditolak"}
        </h1>
        <p className="mb-2 text-gray-500">
          {isInactive ? (
            <>
              Akun <strong>{user?.emailAddresses?.[0]?.emailAddress}</strong>{" "}
              sudah tidak aktif. Silakan hubungi admin untuk informasi lebih
              lanjut.
            </>
          ) : (
            <>
              Maaf, akun{" "}
              <strong>{user?.emailAddresses?.[0]?.emailAddress}</strong> tidak
              disetujui untuk mengakses DCMS.
            </>
          )}
        </p>
        <p className="mb-6 text-sm text-gray-400">
          Silakan hubungi admin jika kamu merasa ini adalah kesalahan.
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

import { ClerkProvider, useUser } from "@clerk/nextjs";
import { type AppType } from "next/app";
import { type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import "@/styles/globals.css";
import Header from "@/components/headerComponents/Header";
import Footer from "@/components/Footer";
import SideMenu from "@/components/SideMenu";

function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [statusChecked, setStatusChecked] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      void router.push("/login");
      return;
    }

    // Cek status user
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/user/status");
        if (!res.ok) return;

        const data = await res.json();
        if (data.status === "pending") {
          void router.push("/pending-approval");
          return;
        }
        if (data.status === "rejected") {
          void router.push("/rejected");
          return;
        }
        if (data.status === "inactive") {
          void router.push("/rejected");
          return;
        }
        // Kalau active, lanjut
        setStatusChecked(true);
      } catch {
        // Error fetching status, tetap lanjut aja
        setStatusChecked(true);
      }
    };

    checkStatus();
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bgc">
        <p className="text-textC">Loading...</p>
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bgc">
        <p className="text-textC">Redirecting to login...</p>
      </main>
    );
  }

  // Tunggu status check selesai
  if (!statusChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bgc">
        <p className="text-textC">Checking access...</p>
      </main>
    );
  }

  return <>{children}</>;
}

const MyApp: AppType = ({ Component, pageProps }) => {
  const router = useRouter();

  // Public routes — no auth needed
  const isSharePage = router.pathname.startsWith("/share/");
  const isAuthPage =
    router.pathname === "/login" || router.pathname === "/register";
  const isPublicPage =
    router.pathname === "/pending-approval" ||
    router.pathname === "/rejected" ||
    router.pathname === "/";

  if (isSharePage || isAuthPage || isPublicPage) {
    return (
      <ClerkProvider {...pageProps}>
        <main className="min-h-screen bg-bgc">
          <Component {...pageProps} />
        </main>
      </ClerkProvider>
    );
  }

  // Protected app
  return (
    <ClerkProvider {...pageProps}>
      <AuthGate>
        <main className="flex h-screen flex-col overflow-hidden bg-bgc">
          <Header />

          <section className="mb-5 flex flex-1 overflow-hidden px-5 pr-16">
            <div>
              <SideMenu />
            </div>

            <div className="flex flex-1">
              <div className="h-[90vh] w-full overflow-hidden rounded-2xl bg-white">
                <Component {...pageProps} />
              </div>
            </div>
          </section>
          <Footer />
        </main>
      </AuthGate>
    </ClerkProvider>
  );
};

export default MyApp;

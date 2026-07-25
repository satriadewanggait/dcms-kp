import { ClerkProvider, useUser } from "@clerk/nextjs";
import { type AppType } from "next/app";
import { type ReactNode } from "react";
import { useRouter } from "next/router";
import "@/styles/globals.css";
import Header from "@/components/headerComponents/Header";
import Footer from "@/components/Footer";
import SideMenu from "@/components/SideMenu";

function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bgc">
        <p className="text-textC">Loading...</p>
      </main>
    );
  }

  if (!isSignedIn) {
    // Wait until loaded then redirect
    if (typeof window !== "undefined") {
      void router.push("/login");
    }
    return (
      <main className="flex min-h-screen items-center justify-center bg-bgc">
        <p className="text-textC">Redirecting to login...</p>
      </main>
    );
  }

  return <>{children}</>;
}

const MyApp: AppType = ({ Component, pageProps }) => {
  const router = useRouter();

  // Public routes
  const isSharePage = router.pathname.startsWith("/share/");
  const isAuthPage =
    router.pathname === "/login" || router.pathname === "/register";

  // Public layout — share & auth pages
  if (isSharePage || isAuthPage) {
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

import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bgc px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-center text-2xl font-semibold text-textC">
          Daftar
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Buat akun baru untuk mulai menggunakan DCMS
        </p>
        <SignUp
          routing="hash"
          signInUrl="/login"
          fallbackRedirectUrl="/drive/my-drive"
        />
      </div>
    </div>
  );
}

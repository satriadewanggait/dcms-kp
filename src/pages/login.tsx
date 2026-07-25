import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bgc px-4">
      <div className="w-full max-w-md">
        <SignIn
          routing="hash"
          signUpUrl="/register"
          fallbackRedirectUrl="/drive/my-drive"
        />
      </div>
    </div>
  );
}

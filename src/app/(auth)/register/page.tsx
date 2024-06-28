"use client";

import GoogleLogin from "../../../components/auth/googleLogin";
import AppleLogin from "../../../components/auth/appleLogin";
import { Button } from "../../../components/ui/button";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const RegisterPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center text-center overflow-hidden px-6 lg:px-0 ">
      <div className="w-full flex flex-col gap-3 lg:max-w-[420px] rounded-xl p-8 bg-card dark:bg-muted">
        <GoogleLogin signInTextPrefix="Sign up with" />
        <AppleLogin signInTextPrefix="Sign up with" />
        {/* <Divider textInCenter="OR" className="my-4" />
        <EmailLogin register /> */}
      </div>
      <div className="flex flex-row gap-1 justify-center items-center">
        <span className="text-muted-foreground">Already have an account?</span>
        <Button
          variant="link"
          className="text-base underline text-muted-foreground !p-0"
          asChild
        >
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </div>
  );
};

export default RegisterPage;

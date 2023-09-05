"use client";

import { Github } from "lucide-react";
import { signIn } from "next-auth/react";

import { Button } from "~/components/ui/button";

export default function SignIn() {
  return (
    <div className="rounded-md bg-background p-8">
      <div className="mx-auto flex w-full flex-col justify-center space-y-4">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign In</h1>
          <p className="text-sm text-muted-foreground">
            Choose one of the following options to sign in
          </p>
        </div>
        <div className="flex flex-col space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
          </div>
          <Button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            variant="outline"
          >
            <Github className="mr-4" />
            GitHub
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";
import { useFormStatus } from "react-dom";
import { login, signup } from "./actions";
import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginState, loginAction] = useActionState(login, null);
  const [signupState, signupAction] = useActionState(signup, null);

  useEffect(() => {
    if (loginState?.error) {
      toast.error(loginState.error);
    }
  }, [loginState]);

  useEffect(() => {
    if (signupState?.error) {
      toast.error(signupState.error);
    }
  }, [signupState]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{isLogin ? "Login" : "Sign Up"}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLogin ? (
            <form action={loginAction} className="space-y-4">
              <div className="space-y-2">
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  className="w-full"
                />
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  className="w-full"
                />
              </div>
              <SubmitButton>Login</SubmitButton>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsLogin(false)}
              >
                Need an account? Sign Up
              </Button>
            </form>
          ) : (
            <form action={signupAction} className="space-y-4">
              <div className="space-y-2">
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  className="w-full"
                />
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  className="w-full"
                />
                <Input
                  name="username"
                  type="text"
                  placeholder="Username"
                  required
                  className="w-full"
                />
              </div>
              <SubmitButton>Sign Up</SubmitButton>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsLogin(true)}
              >
                Already have an account? Login
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

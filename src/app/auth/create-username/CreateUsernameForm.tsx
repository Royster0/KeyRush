"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";
import { useFormStatus } from "react-dom";
import { createUsername } from "./username-actions";
import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Creating...
        </>
      ) : (
        "Create Username"
      )}
    </Button>
  );
}

const initialState = {
  error: "",
};

interface CreateUsernameFormProps {
  defaultUsername?: string;
}

export function CreateUsernameForm({ defaultUsername }: CreateUsernameFormProps) {
  const [state, action] = useActionState(createUsername, initialState);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create a Username</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Please choose a unique username to continue.
        </p>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Input
              name="username"
              type="text"
              placeholder="Username"
              defaultValue={defaultUsername}
              required
              minLength={3}
              className="w-full"
            />
          </div>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}

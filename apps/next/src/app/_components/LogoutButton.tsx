"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

const LogoutButton = () => {
  const router = useRouter();
  return (
    <Button onClick={() => logout().then(() => router.refresh())}>
      Log out
    </Button>
  );
};

export { LogoutButton };

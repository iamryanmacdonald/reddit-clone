"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DialogContent, Overlay, Portal, Root } from "@radix-ui/react-dialog";

interface ModalProps {
  children: React.ReactNode;
}

export default function Modal({ children }: ModalProps) {
  const router = useRouter();

  const handleOnOpenChange = (open: boolean) => {
    if (!open) router.back();
  };

  return (
    <Root open onOpenChange={handleOnOpenChange}>
      <Portal>
        <Overlay className="fixed inset-0 bg-black/70" />
        <DialogContent className="fixed left-1/2 top-1/2 w-fit -translate-x-1/2 -translate-y-1/2">
          {children}
        </DialogContent>
      </Portal>
    </Root>
  );
}

"use client";

import React, { useContext } from "react";
import { ModalContext } from "@/context/GlobalModalContext";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// interface GlobalModalProps {
//   children: ReactNode;
// }

const GlobalModal = (): JSX.Element => {
  const { isOpen, content, closeModal } = useContext(ModalContext);

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Opaque, blurry background overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={closeModal}
      />

      {/* Modal content */}
      <div className="relative bg-white p-8 rounded-lg max-w-md w-full m-4">
        {/* Close button */}
        <Button
          onClick={closeModal}
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </Button>
        {content}
      </div>
    </div>
  );
};

export default GlobalModal;

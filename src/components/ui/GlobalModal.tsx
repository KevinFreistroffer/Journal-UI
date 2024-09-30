"use client";

import React, { useContext } from "react";
import { ModalContext } from "@/GlobalModalContext";
import { useAuth } from "@/hooks/useAuth";

const GlobalModal: React.FC = () => {
  const context = useContext(ModalContext);
  const { user } = useAuth();
  if (!context?.isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold mb-4">
            This page is disabled until you verify your account.
          </h2>
          <p className="mb-4">
            Please check your email for a verification link.
          </p>
          <p className="mb-4">
            If you have not received an email, you can resend it by clicking the
            button below.
          </p>
          <div className="text-center mb-4">
            <a
              href={`/api/auth/send-verification-email?userId=${user?._id}`}
              className="text-blue-500 hover:underline "
            >
              Resend Verification Email
            </a>
          </div>
          <button
            onClick={context?.closeModal}
            className="w-full bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalModal;

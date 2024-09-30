"use client";

import React, { useContext } from "react";
import { ModalContext } from "@/GlobalModalContext";

const GlobalModal: React.FC = () => {
  const context = useContext(ModalContext);

  if (!context?.isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={context?.closeModal}>Close</button>
        {context?.content}
      </div>
    </div>
  );
};

export default GlobalModal;

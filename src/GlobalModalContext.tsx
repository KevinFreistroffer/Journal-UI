"use client";

import React, { createContext, useState, ReactNode } from "react";

export interface IIModalContextType {
  isOpen: boolean;
  content: ReactNode;
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
}

export const ModalContext = createContext<IModalContextType | undefined>(
  undefined
);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);

  const openModal = (content: ReactNode) => {
    setContent(content);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setContent(null);
  };

  return (
    <ModalContext.Provider value={{ isOpen, content, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

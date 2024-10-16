"use client";

import React, { createContext, useState, ReactNode, useContext } from "react";

export interface IIModalContextType {
  isOpen: boolean;
  content: ReactNode | ReactNode[] | null;
  openModal: (content: ReactNode | ReactNode[]) => void;
  closeModal: () => void;
  setContent: React.Dispatch<React.SetStateAction<ReactNode>>; // Add this line
}

export const ModalContext = createContext<IIModalContextType>({
  isOpen: false,
  content: null,
  openModal: (content: ReactNode | ReactNode[]) => {},
  closeModal: () => {},
  setContent: () => {},
});

export const useModal = () => useContext(ModalContext);

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
    <ModalContext.Provider
      value={{ isOpen, content, openModal, closeModal, setContent }}
    >
      {children}
    </ModalContext.Provider>
  );
};

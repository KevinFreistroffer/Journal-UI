"use client";

import React, { useContext, useEffect } from "react";
import { ModalContext } from "@/context/GlobalModalContext";
import InstallPrompt from "./InstallPrompt";
import PushNotificationManager from "./PushNotificationManager";

const PWA: React.FC = () => {
  const { openModal, setContent } = useContext(ModalContext);

  useEffect(() => {
    openModal(
      <>
        <InstallPrompt />
        <PushNotificationManager />
      </>
    );
  }, [openModal, setContent]);

  return <></>;
};

export default PWA;

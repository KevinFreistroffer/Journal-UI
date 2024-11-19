import React, { useState, useEffect } from "react";
import styles from "./debug.module.css";

interface IProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

const DebugLayout: React.FC<IProps> = ({ position }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  return (
    <div className={`${styles.debugContainer} ${styles[position]}`}>
      <div>Width: {dimensions.width}px</div>
      <div>Height: {dimensions.height}px</div>
    </div>
  );
};

export default DebugLayout;

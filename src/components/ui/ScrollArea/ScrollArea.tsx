"use client";
// src/components/ui/scroll-area.tsx

import * as ScrollArea from "@radix-ui/react-scroll-area";
import React from "react";
import styles from "./styles.module.css";

interface DataItem {
  id: string;
  label: string;
  value: string | number | boolean;
}

const ScrollAreaComponent: React.FC<{
  content: DataItem[];
  onSelect: (item: DataItem) => void;
  rootClassName?: string;
}> = ({ content, onSelect, rootClassName }) => {
  const handleSelect = (item: DataItem) => {
    onSelect(item); // Call the onSelect function with the selected item
  };

  return (
    <ScrollArea.Root
      style={{
        width: "300px",
        maxHeight: "200px",
        minHeight: "150px",
        height: "10px",
      }}
      className={`${styles.ScrollAreaRoot} ${rootClassName || ""} fasfsad`}
    >
      <ScrollArea.Viewport
        className={`${styles.ScrollAreaViewport} fsdafdsafsdafsdafadsfsadfsa z-25`}
      >
        <div>
          {/* Render the passed content */}
          {content.length ? (
            content.map((item, index) => (
              <div
                key={index}
                onClick={() => handleSelect(item)}
                className="cursor-pointer px-3 py-1.5 hover:bg-gray-200"
              >
                {item.label}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400">No categories</div>
          )}
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        className={styles.ScrollAreaScrollbar}
        orientation="vertical"
      >
        <ScrollArea.Thumb className={styles.ScrollAreaThumb} />
      </ScrollArea.Scrollbar>
      <ScrollArea.Scrollbar
        className={styles.ScrollAreaScrollbar}
        orientation="horizontal"
      >
        <ScrollArea.Thumb className={styles.ScrollAreaThumb} />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner className={styles.ScrollAreaCorner} />
    </ScrollArea.Root>
  );
};

export default ScrollAreaComponent;

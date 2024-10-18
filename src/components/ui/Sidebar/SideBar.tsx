import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface SidebarSection {
  title: string;
  content: React.ReactNode;
}

interface IProps {
  isOpen: boolean;
  icon: React.ReactNode;
  sections: SidebarSection[];
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<IProps> = ({
  icon,
  isOpen,
  sections,
  setIsSidebarOpen,
}) => {
  return (
    <div
      className={`fixed mt-16 top-0 left-0 h-full bg-gray-100 p-4 overflow-y-auto transition-all duration-300 ease-in-out z-10 hidden md:block ${
        isOpen ? "w-56" : "w-16"
      }`}
    >
      <Button
        className={`relative w-full p-0 cursor-pointer ${
          isOpen ? "justify-end" : "justify-center"
        }`}
        variant="ghost"
        size="sm"
        onClick={() => {
          setIsSidebarOpen(!isOpen);
        }}
        title={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <ChevronLeft size={20} /> : icon}
      </Button>
      {isOpen && (
        <div className="flex flex-col mt-4">
          {sections.map((section, index) => (
            <div key={index} className="mb-8">
              <p>
                <span className="font-medium">{section.title}</span>
              </p>
              <div className="mt-2 text-sm font-thin text-gray-600">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;

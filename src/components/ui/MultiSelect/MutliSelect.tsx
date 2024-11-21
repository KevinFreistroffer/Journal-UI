"use client";

import "./MultiSelect.css";
import React, { useState } from "react";
import CreatableSelect from "react-select/creatable";
import { useTheme } from "next-themes";
import { Plus } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  onCreateOption?: (inputValue: string) => void;
  placeholder?: string;
  className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedValues,
  onChange,
  onCreateOption,
  placeholder = "Search or select options...",
  className = "",
}) => {
  const { theme } = useTheme();

  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value)
  );

  const handleChange = (newValue: any) => {
    onChange(newValue.map((option: Option) => option.value));
  };

  return (
    <div className="relative">
      <CreatableSelect
        isMulti
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        onCreateOption={onCreateOption}
        placeholder={placeholder}
        className={className}
        classNamePrefix="react-select"
        closeMenuOnSelect={false}
        formatCreateLabel={(inputValue) => (
          <div className="flex items-center gap-2 cursor-pointer transition-colors rounded-md p-1">
            <Plus size={16} />
            <span>Create &quot;{inputValue}&quot;</span>
          </div>
        )}
        styles={{
          control: (baseStyles) => ({
            ...baseStyles,
            backgroundColor: theme === "dark" ? "black" : "white",
            borderColor:
              theme === "dark" ? "rgb(209, 213, 219)" : baseStyles.borderColor,
            color: theme === "dark" ? "hsl(var(--foreground))" : undefined,
          }),
          menu: (baseStyles, state) => {
            console.log(baseStyles);
            console.log(state);
            return {
              ...baseStyles,
              backgroundColor: theme === "dark" ? "black" : "white",
              borderColor: theme === "dark" ? "red" : "blue",
            };
          },
          option: (baseStyles, state) => ({
            ...baseStyles,
            backgroundColor: state.isFocused
              ? theme === "dark"
                ? "hsl(var(--accent))"
                : "hsl(var(--accent-light))"
              : "transparent",
            color:
              theme === "dark"
                ? state.isFocused
                  ? "hsl(var(--accent-foreground))"
                  : "hsl(var(--foreground))"
                : undefined,
          }),
          singleValue: (baseStyles) => ({
            ...baseStyles,
            color: theme === "dark" ? "hsl(var(--foreground))" : undefined,
          }),
          multiValue: (baseStyles) => ({
            ...baseStyles,
            color: theme === "dark" ? "hsl(var(--foreground))" : undefined,
          }),
        }}
      />
    </div>
  );
};

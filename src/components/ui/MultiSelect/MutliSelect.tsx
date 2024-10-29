import React from "react";
import Select, { MultiValue } from "react-select";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

// Add custom styles for the checkbox option
const Option = (props: any) => {
  return (
    <div
      {...props.innerProps}
      className={`${props.className} flex items-center px-3 py-2 hover:bg-gray-100`}
    >
      <input
        type="checkbox"
        checked={props.isSelected}
        onChange={() => {}}
        className="mr-2"
      />
      <span>{props.label}</span>
    </div>
  );
};

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder = "Select options...",
  className = "",
}) => {
  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value)
  );

  const handleChange = (newValue: MultiValue<Option>) => {
    onChange(newValue.map((option) => option.value));
  };

  return (
    <Select
      isMulti
      options={options}
      value={selectedOptions}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      classNamePrefix="react-select"
      components={{ Option }}
    />
  );
};

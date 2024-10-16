import { useState, useEffect } from "react";
import { usePopper } from "react-popper";
import "./HelperText.css";
import Joyride, { TooltipRenderProps } from "react-joyride";

const HelperText = (props: TooltipRenderProps) => {
  const {
    backProps,
    closeProps,
    continuous,
    index,
    primaryProps,
    skipProps,
    step,
    tooltipProps,
  } = props;
  return (
    <div className="Tooltip tooltip__body p-6 rounded" {...tooltipProps}>
      <div className="Tooltip-content flex flex-col">
        <div className="tooltip__content mb-6">{step.content}</div>
        <button
          className="tooltip__close text-sm bg-blue-500 text-white px-4 py-2 rounded self-end"
          {...closeProps}
        >
          Ok
        </button>
      </div>
    </div>
  );
};

export default HelperText;

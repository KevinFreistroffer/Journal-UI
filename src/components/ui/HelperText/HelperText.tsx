import { useState, useEffect } from "react";
import { usePopper } from "react-popper";
import "./HelperText.css";

const HelperText = ({
  text,
  children,
  isVisible,
  onClick,
}: {
  text: string;
  children: React.ReactNode;
  isVisible: boolean;
  onClick: () => void;
}) => {
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "auto", // Automatically chooses the best placement
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 8], // Add some spacing between the icon and tooltip
        },
      },
    ],
  });

  useEffect(() => {
    console.log("isVisible", isVisible);
  }, [isVisible]);

  return (
    <div
      className="tooltip-trigger"
      //   onMouseEnter={() => setVisible(true)}
      //   onMouseLeave={() => setVisible(false)}
      onClick={() => {
        console.log("HelperText onClick()");
        onClick();
      }}
      ref={setReferenceElement}
    >
      {children}
      {isVisible && (
        <div
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
          className="tooltip-text"
        >
          <div className="flex flex-col">
            <p className="mb-12">{text}</p>
            <button
              className="self-end flex px-4 py-2 text-xs text-white bg-blue-500 rounded hover:bg-blue-600"
              onClick={() => onClick()}
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelperText;

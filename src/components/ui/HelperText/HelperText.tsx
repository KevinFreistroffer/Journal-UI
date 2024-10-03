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
      //   onMouseEnter={() => setVisible(true)}
      //   onMouseLeave={() => setVisible(false)}
      onClick={() => {
        console.log("HelperText onClick()");
        onClick();
      }}
      ref={setReferenceElement}
      className="tooltip-trigger"
    >
      {children}
      {isVisible && (
        <div
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
          className="tooltip-text"
        >
          {text}
        </div>
      )}
    </div>
  );
};

export default HelperText;

import React from "react";
import styles from "./debug.module.css";

interface StateProps {
  state: Record<string, any>;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

const State: React.FC<StateProps> = ({ state, position }) => {
  return (
    <div className={`${styles.debugContainer} ${styles[position]}`}>
      <div className={styles.main}>
        <h1 className={styles.title}>Debug: State</h1>
        <div className={styles.description}>
          {Object.entries(state).map(([key, value]) => (
            <div key={key} className={styles.stateItem}>
              <strong>{key}:</strong> {JSON.stringify(value)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default State;

import React, { createContext, useContext, useRef } from "react";

const BlurTargetContext = createContext(null);

export function BlurTargetProvider({ children }) {
  const blurTargetRef = useRef(null);

  return (
    <BlurTargetContext.Provider value={blurTargetRef}>
      {children}
    </BlurTargetContext.Provider>
  );
}

export function useBlurTargetRef() {
  const blurTargetRef = useContext(BlurTargetContext);

  if (!blurTargetRef) {
    throw new Error("useBlurTargetRef must be used inside BlurTargetProvider.");
  }

  return blurTargetRef;
}

"use client";

import React, { useEffect, useRef } from "react";

const Dropdown = ({ 
  children, 
  isOpen, 
  onClose, 
  className = "",
  position = "bottom-right" 
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positionClasses = {
    "bottom-right": "top-full right-0 mt-2",
    "bottom-left": "top-full left-0 mt-2",
    "top-right": "bottom-full right-0 mb-2",
    "top-left": "bottom-full left-0 mb-2",
  };

  return (
    <div
      ref={dropdownRef}
      className={`absolute z-50 ${positionClasses[position]} ${className}`}
    >
      {children}
    </div>
  );
};

export default Dropdown;

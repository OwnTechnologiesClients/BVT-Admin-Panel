"use client";

import React from "react";
import { cn } from "@/lib/utils";

const BaseInput = React.forwardRef(({
  label,
  type = "text",
  placeholder = "",
  required = false,
  error,
  helper,
  className,
  ...props
}, ref) => {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        className={cn(
          "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
          error && "border-red-500 focus:ring-red-500 focus:border-red-500",
          className
        )}
        {...props}
      />
      
      {error && (
        <div className="text-red-500 text-sm mt-1">{error}</div>
      )}
      
      {helper && !error && (
        <div className="text-gray-500 text-sm mt-1">{helper}</div>
      )}
    </div>
  );
});

BaseInput.displayName = "BaseInput";

export { BaseInput };

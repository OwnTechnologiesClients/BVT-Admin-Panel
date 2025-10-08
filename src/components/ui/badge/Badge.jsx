import React from "react";

export const Badge = ({ 
  children, 
  color = "default", 
  className = "",
  size = "sm" 
}) => {
  const baseClasses = "inline-flex items-center gap-1 font-medium rounded-full";
  
  const colorClasses = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
    warning: "bg-yellow-100 text-yellow-800",
    info: "bg-blue-100 text-blue-800",
  };
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span className={`${baseClasses} ${colorClasses[color]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;

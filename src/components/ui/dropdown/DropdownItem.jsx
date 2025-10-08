import React from "react";

export const DropdownItem = ({ 
  children, 
  onClick, 
  className = "",
  tag = "button",
  href,
  ...props 
}) => {
  const Component = tag === "a" ? "a" : "button";
  
  const baseClasses = "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors";
  
  if (tag === "a" && href) {
    return (
      <a
        href={href}
        className={`${baseClasses} ${className}`}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Component
      onClick={onClick}
      className={`${baseClasses} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default DropdownItem;

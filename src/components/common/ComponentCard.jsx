import React from "react";

export const ComponentCard = ({ title, children, className = "" }) => {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-5 md:p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
};

export default ComponentCard;

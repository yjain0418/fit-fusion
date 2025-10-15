// components/ui/card.jsx
import React from 'react';

// Card Container Component
export const Card = ({ className = '', children, ...props }) => {
  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header Component
export const CardHeader = ({ className = '', children, ...props }) => {
  return (
    <div 
      className={`flex flex-col space-y-1.5 p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Title Component
export const CardTitle = ({ className = '', children, ...props }) => {
  return (
    <h3 
      className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

// Card Description Component
export const CardDescription = ({ className = '', children, ...props }) => {
  return (
    <p 
      className={`text-sm text-gray-600 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

// Card Content Component
export const CardContent = ({ className = '', children, ...props }) => {
  return (
    <div 
      className={`p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Optional: Card Footer Component (if needed later)
export const CardFooter = ({ className = '', children, ...props }) => {
  return (
    <div 
      className={`flex items-center p-6 pt-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
import React from 'react';

const Loader = ({ size = 48, overlay = false, message = '' }) => {
  const spinner = (
    <svg
      className="animate-spin"
      width={size}
      height={size}
      viewBox="0 0 50 50"
      style={{ color: 'var(--color-primary-500)' }}
    >
      <circle
        className="opacity-20"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
      />
      <path
        className="opacity-80"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        d="M45 25a20 20 0 0 1-20 20"
      />
    </svg>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-100/80 backdrop-blur-sm">
        <div className="flex flex-col items-center">
          {spinner}
          {message && <div className="mt-4 text-text-primary text-lg">{message}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-4">
      {spinner}
      {message && <div className="mt-2 text-text-primary text-sm">{message}</div>}
    </div>
  );
};

export default Loader;

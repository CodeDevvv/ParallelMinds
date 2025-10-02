import PropTypes from 'prop-types';

const ProcessingLoader = ({ overlay = true }) => {
  const spinner = (
    <svg
      className="animate-spin"
      width={48}
      height={48}
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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface-100/80 backdrop-blur-sm p-4">
        {spinner}
        <h2 className="mt-4 text-xl font-semibold text-text-primary text-center">
          Got it! Processing your responses…  
          Hang tight—it won’t take long.
        </h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {spinner}
      <span className="mt-2 text-text-primary text-center text-sm">
        Processing your responses… please wait.
      </span>
    </div>
  );
};


ProcessingLoader.propTypes = {
  overlay: PropTypes.bool,
};

export default ProcessingLoader;

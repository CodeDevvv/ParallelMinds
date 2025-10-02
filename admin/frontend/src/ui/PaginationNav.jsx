import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';

const PaginationNav = ({ onPrev, onNext, hidePrev, hideNext }) => {
  return (
    <div className="flex justify-between items-center w-full pt-6 mt-8 border-t border-neutral-800">
      
      <div>
        <button
          onClick={onPrev}
          hidden={hidePrev}
          disabled={hidePrev} 
          className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg
                     bg-neutral-800 border border-neutral-700 text-neutral-200
                     hover:bg-neutral-700 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous Page"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          <span>Previous</span>
        </button>
      </div>

      <div>
        <button
          onClick={onNext}
          hidden={hideNext}
          disabled={hideNext} 
          className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg
                     bg-neutral-800 border border-neutral-700 text-neutral-200
                     hover:bg-neutral-700 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next Page"
        >
          <span>Next</span>
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

PaginationNav.propTypes = {
    onPrev: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired,
    hidePrev: PropTypes.bool,
    hideNext: PropTypes.bool,
};

export default PaginationNav;
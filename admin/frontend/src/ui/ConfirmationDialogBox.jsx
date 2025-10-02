import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ConfirmationDialog = ({ onClose, onConfirm, message }) => {
  const [show, setShow] = useState(true);

  const handleDecision = (confirmed) => {
    onConfirm(confirmed); 
    setShow(false);       
  };

  return (
    <Transition appear show={show} as={Fragment}
      afterLeave={onClose} 
    >
      <Dialog as="div" className="relative z-50" onClose={() => handleDecision(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-700 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="mt-0 flex-grow">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-white">
                      Confirmation Required
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-neutral-400">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-4">
                  <button type="button" className="inline-flex justify-center rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800" onClick={() => handleDecision(false)}>
                    Cancel
                  </button>
                  <button type="button" className="inline-flex justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" onClick={() => handleDecision(true)}>
                    Okay
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

ConfirmationDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
};

export default ConfirmationDialog;
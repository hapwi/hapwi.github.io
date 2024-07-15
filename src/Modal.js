// Modal.js
import { Dialog } from "@headlessui/react";
import {
  CheckIcon,
  XCircleIcon,
  PencilSquareIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import React from "react";

const Modal = ({ isOpen, title, message, status, onClose, children }) => {
  const getIcon = () => {
    switch (status) {
      case "success":
        return (
          <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
        );
      case "error":
        return (
          <XCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
        );
      case "edit":
        return (
          <PencilSquareIcon
            className="h-6 w-6 text-yellow-600"
            aria-hidden="true"
          />
        );
      case "loading":
        return (
          <ArrowPathIcon
            className="h-6 w-6 text-blue-600 animate-spin"
            aria-hidden="true"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onClose={() => {}} className="relative z-10">
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                {getIcon()}
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <Dialog.Title
                  as="h3"
                  className="text-base font-semibold leading-6 text-gray-900"
                >
                  {title}
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{message}</p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6">{children}</div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default Modal;

import React from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: React.ReactNode;
}

/**
 * Universal Modal Portal for Ontario ACCS Hub
 * Portals lightboxes, modals, and drawers directly into document.body to completely
 * prevent stacking-context traps and eliminate header gaps or bleed-throughs.
 */
export const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
};

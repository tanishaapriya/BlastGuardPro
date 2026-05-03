import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, size = 'md', footer }) {
  useEffect(() => {
    if (!open) return;
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const widths = { sm: 440, md: 560, lg: 720, xl: 900 };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(6px)',
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit  ={{ opacity: 0, scale: 0.96, y: 8   }}
            transition={{ duration: 0.2, ease: [0.4,0,0.2,1] }}
            className="relative flex flex-col z-10"
            style={{
              width: '100%',
              maxWidth: widths[size],
              maxHeight: '88vh',
              background: '#0D1829',
              border: '1px solid #1E2D45',
              borderRadius: 20,
              boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 shrink-0"
              style={{ borderBottom: '1px solid #1A2942' }}
            >
              <h2 className="text-base font-semibold" style={{ color: '#E2EAF4' }}>{title}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0"
                style={{ color: '#5A7A9A' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#111E30'; e.currentTarget.style.color = '#E2EAF4'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5A7A9A'; }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>

            {/* Footer */}
            {footer && (
              <div
                className="px-6 py-4 shrink-0"
                style={{ borderTop: '1px solid #1A2942' }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

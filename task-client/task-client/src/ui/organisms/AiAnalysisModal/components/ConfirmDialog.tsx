"use client";

import React from "react";
import {AnimatePresence, motion} from 'framer-motion';
import {FiAlertTriangle} from "react-icons/fi";
import {useTheme} from '@/ui/theme/themeContext';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

/**
 * 确认弹窗组件 -
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}) => {
  const { theme } = useTheme();
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="confirm-dialog-backdrop"
        className="fixed inset-0 bg-black/30 z-[60] flex items-center justify-center backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="backdrop-blur-xl rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 border"
          style={{
            backgroundColor: `${theme.colors.card.background}F2`, // 95% opacity
            borderColor: `${theme.colors.card.border}CC`, // 80% opacity
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)'
          }}
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center mb-4">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
              style={{
                backgroundColor: `${theme.colors.warning[500]}14`, // 8% opacity
                color: theme.colors.warning[500]
              }}
            >
              <FiAlertTriangle size={20} />
            </div>
            <h3 
              className="text-lg font-medium"
              style={{ color: theme.colors.foreground }}
            >
              {title}
            </h3>
          </div>

          <p 
            className="mb-6 leading-relaxed"
            style={{ color: theme.colors.neutral[600] }}
          >
            {message}
          </p>

          <div className="flex justify-end space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              style={{
                backgroundColor: theme.colors.neutral[100],
                color: theme.colors.neutral[700]
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.neutral[200];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.neutral[100];
              }}
              onClick={onClose}
            >
              取消
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              style={{
                backgroundColor: theme.colors.error[500],
                color: '#FFFFFF'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#DC2626'; // 使用固定的深红色
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.error[500];
              }}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              确认
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmDialog;

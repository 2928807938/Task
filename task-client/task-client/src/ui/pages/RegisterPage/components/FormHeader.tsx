"use client";

import React from 'react';
import {motion} from 'framer-motion';
import { useTheme } from '@/ui/theme';

export function FormHeader() {
  const { theme } = useTheme();
  
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.3 }}
    >
      <h2 className="text-3xl font-bold mb-2" style={{ color: theme.colors.foreground }}>
        创建账号
      </h2>
      <p className="text-sm" style={{ color: theme.colors.neutral[500] }}>
        请填写以下信息完成注册
      </p>
    </motion.div>
  );
}

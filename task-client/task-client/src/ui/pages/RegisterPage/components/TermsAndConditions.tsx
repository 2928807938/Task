"use client";

import React from 'react';
import Link from 'next/link';
import {FieldErrors, UseFormRegister} from 'react-hook-form';
import { ThemeDefinition } from '@/ui/theme';

interface TermsAndConditionsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  theme: ThemeDefinition;
  isDark: boolean;
}

export function TermsAndConditions({
  register,
  errors,
  theme,
  isDark
}: TermsAndConditionsProps) {
  return (
    <div className="mt-2">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="terms"
            {...register('terms', { required: true })}
            type="checkbox"
            className="w-4 h-4 rounded border-2 focus:ring-2 focus:ring-offset-0 transition-colors"
            style={{
              backgroundColor: theme.colors.card.background,
              borderColor: errors.terms ? theme.colors.error[500] : theme.colors.card.border,
              accentColor: theme.colors.primary[500]
            }}
          />
        </div>
        <div className="ml-3 text-sm">
          <label 
            htmlFor="terms" 
            className="cursor-pointer"
            style={{ 
              color: errors.terms ? theme.colors.error[500] : theme.colors.neutral[500] 
            }}
          >
            我已阅读并同意
            <Link
              href="/terms"
              className="ml-1 hover:underline transition-colors"
              style={{ color: theme.colors.primary[500] }}
            >
              《服务条款》
            </Link>
            和
            <Link
              href="/privacy"
              className="ml-1 hover:underline transition-colors"
              style={{ color: theme.colors.primary[500] }}
            >
              《隐私政策》
            </Link>
          </label>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { Suspense } from 'react';
import { LoginTemplate } from '@/ui/templates/LoginTemplate';

export function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginTemplate />
    </Suspense>
  );
}

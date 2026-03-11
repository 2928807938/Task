"use client";

import {useEffect, useState} from "react";
import {UseFormReturn} from "react-hook-form";
import {
    CreateProjectRequest,
    PriorityItem,
    PrioritySystem,
    ProjectConfig,
    StatusItem,
    StatusSystem,
    StatusTransitionRule,
} from "@/types/api-types";

export interface UsePriorityStatusStepReturn {
  prioritySystem: PrioritySystem;
  statusSystem: StatusSystem;
  customPriorityItems: PriorityItem[];
  customStatusItems: StatusItem[];
  statusTransitions: StatusTransitionRule[];

  setPrioritySystem: (sys: PrioritySystem) => void;
  setStatusSystem: (sys: StatusSystem) => void;
  addPriority: (item: PriorityItem) => void;
  removePriority: (id: string) => void;
  addStatus: (item: StatusItem) => void;
  removeStatus: (id: string) => void;
  toggleTransition: (fromId: string, toId: string) => void;
}

/**
 * 提取自 PriorityStatusStep 的核心业务逻辑，方便 UI 组件解耦
 */
export default function usePriorityStatusStep(
  form: UseFormReturn<CreateProjectRequest>
): UsePriorityStatusStepReturn {
  const { watch, setValue } = form;

  const [prioritySystem, setPrioritySystemState] =
    useState<PrioritySystem>("standard");
  const [statusSystem, setStatusSystemState] =
    useState<StatusSystem>("standard");
  const [customPriorityItems, setCustomPriorityItems] = useState<PriorityItem[]>(
    []
  );
  const [customStatusItems, setCustomStatusItems] = useState<StatusItem[]>([]);
  const [statusTransitions, setStatusTransitions] =
    useState<StatusTransitionRule[]>([]);

  /* ------------------------------ 初始化加载 ----------------------------- */
  useEffect(() => {
    // 从表单中获取各个配置项
    const prioritySystemValue = watch("prioritySystem");
    const statusSystemValue = watch("statusSystem");
    const customPriorityItemsValue = watch("customPriorityItems");
    const customStatusItemsValue = watch("customStatusItems");
    const customStatusTransitionsValue = watch("customStatusTransitions");

    // 设置状态
    if (prioritySystemValue) setPrioritySystemState(prioritySystemValue);
    if (statusSystemValue) setStatusSystemState(statusSystemValue);
    if (Array.isArray(customPriorityItemsValue)) setCustomPriorityItems(customPriorityItemsValue);
    if (Array.isArray(customStatusItemsValue)) setCustomStatusItems(customStatusItemsValue);
    if (Array.isArray(customStatusTransitionsValue)) setStatusTransitions(customStatusTransitionsValue);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --------------------------------- 工具 -------------------------------- */
  const updateFormValues = (partial: Partial<ProjectConfig>) => {
    try {
      // 直接更新表单中的各个字段
      if (partial.prioritySystem !== undefined) {
        setValue("prioritySystem", partial.prioritySystem);
      }
      if (partial.statusSystem !== undefined) {
        setValue("statusSystem", partial.statusSystem);
      }
      if (partial.customPriorityItems !== undefined) {
        setValue("customPriorityItems", partial.customPriorityItems);
      }
      if (partial.customStatusItems !== undefined) {
        setValue("customStatusItems", partial.customStatusItems);
      }
      if (partial.customStatusTransitions !== undefined) {
        setValue("customStatusTransitions", partial.customStatusTransitions);
      }
    } catch (err) {
      console.error("更新项目配置失败", err);
    }
  };

  /* ------------------------------ Mutations ------------------------------ */
  const setPrioritySystem = (sys: PrioritySystem) => {
    setPrioritySystemState(sys);
    updateFormValues({ prioritySystem: sys });
  };

  const setStatusSystem = (sys: StatusSystem) => {
    setStatusSystemState(sys);
    updateFormValues({ statusSystem: sys });
  };

  const addPriority = (item: PriorityItem) => {
    const list = [...customPriorityItems, item];
    setCustomPriorityItems(list);
    updateFormValues({ customPriorityItems: list });
  };

  const removePriority = (id: string) => {
    const list = customPriorityItems.filter((p) => p.id !== id);
    setCustomPriorityItems(list);
    updateFormValues({ customPriorityItems: list });
  };

  const addStatus = (item: StatusItem) => {
    const list = [...customStatusItems, item];
    setCustomStatusItems(list);
    updateFormValues({ customStatusItems: list });
  };

  const removeStatus = (id: string) => {
    const list = customStatusItems.filter((s) => s.id !== id);
    setCustomStatusItems(list);
    updateFormValues({ customStatusItems: list });
  };

  const toggleTransition = (fromId: string, toId: string) => {
    if (fromId === toId) return; // 不允许自己转自己

    const idx = statusTransitions.findIndex(
      (r) => r.fromStatusId === fromId && r.toStatusId === toId
    );

    const list: StatusTransitionRule[] = idx >= 0
      ? [
          ...statusTransitions.slice(0, idx),
          ...statusTransitions.slice(idx + 1),
        ]
      : [...statusTransitions, { fromStatusId: fromId, toStatusId: toId }];

    setStatusTransitions(list);
    updateFormValues({ customStatusTransitions: list });
  };

  return {
    prioritySystem,
    statusSystem,
    customPriorityItems,
    customStatusItems,
    statusTransitions,
    setPrioritySystem,
    setStatusSystem,
    addPriority,
    removePriority,
    addStatus,
    removeStatus,
    toggleTransition,
  };
}

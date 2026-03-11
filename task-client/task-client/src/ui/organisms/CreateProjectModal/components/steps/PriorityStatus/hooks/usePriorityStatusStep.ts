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
  updatePriority: (id: string, name: string, color: string, order: number) => void;
  addStatus: (item: StatusItem) => void;
  removeStatus: (id: string) => void;
  updateStatus: (id: string, name: string, color: string, order: number) => void;
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
    // 直接从表单字段中获取值
    const prioritySystemValue = watch("prioritySystem");
    const statusSystemValue = watch("statusSystem");
    const customPriorityItemsValue = watch("customPriorityItems");
    const customStatusItemsValue = watch("customStatusItems");
    const customStatusTransitionsValue = watch("customStatusTransitions");

    // 兼容旧版的config字段
    const configValue = (watch as any)("config");

    if (prioritySystemValue) {
      setPrioritySystemState(prioritySystemValue);
    }

    if (statusSystemValue) {
      setStatusSystemState(statusSystemValue);
    }

    if (Array.isArray(customPriorityItemsValue)) {
      setCustomPriorityItems(customPriorityItemsValue);
    }

    if (Array.isArray(customStatusItemsValue)) {
      setCustomStatusItems(customStatusItemsValue);
    }

    if (Array.isArray(customStatusTransitionsValue)) {
      setStatusTransitions(customStatusTransitionsValue);
    }

    // 兼容旧版的config字段
    if (configValue && !prioritySystemValue) {
      try {
        const config: ProjectConfig =
          typeof configValue === "string" ? JSON.parse(configValue) : configValue;

        if (config.prioritySystem) setPrioritySystemState(config.prioritySystem);
        if (config.statusSystem) setStatusSystemState(config.statusSystem);
        if (Array.isArray(config.customPriorityItems))
          setCustomPriorityItems(config.customPriorityItems);
        if (Array.isArray(config.customStatusItems))
          setCustomStatusItems(config.customStatusItems);

        // 使用customStatusTransitions字段
        const rules = config.customStatusTransitions;
        if (Array.isArray(rules)) {
          setStatusTransitions(rules);
        }
      } catch (err) {
        console.error("解析项目配置失败", err);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --------------------------------- 工具 -------------------------------- */
  const updateConfig = (partial: Partial<ProjectConfig>) => {
    try {
      // 直接更新表单字段
      if ('prioritySystem' in partial && partial.prioritySystem) {
        setValue("prioritySystem", partial.prioritySystem);
      }

      if ('statusSystem' in partial && partial.statusSystem) {
        setValue("statusSystem", partial.statusSystem);
      }

      if ('customPriorityItems' in partial && Array.isArray(partial.customPriorityItems)) {
        setValue("customPriorityItems", partial.customPriorityItems);
      }

      if ('customStatusItems' in partial && Array.isArray(partial.customStatusItems)) {
        setValue("customStatusItems", partial.customStatusItems);
      }

      if ('customStatusTransitions' in partial && Array.isArray(partial.customStatusTransitions)) {
        setValue("customStatusTransitions", partial.customStatusTransitions);
      }
    } catch (err) {
      console.error("更新项目配置失败", err);
    }
  };

  /* ------------------------------ Mutations ------------------------------ */
  const setPrioritySystem = (sys: PrioritySystem) => {
    setPrioritySystemState(sys);
    updateConfig({ prioritySystem: sys });
  };

  const setStatusSystem = (sys: StatusSystem) => {
    setStatusSystemState(sys);
    updateConfig({ statusSystem: sys });
  };

  const addPriority = (item: PriorityItem) => {
    const list = [...customPriorityItems, item];
    setCustomPriorityItems(list);
    updateConfig({ customPriorityItems: list });
  };

  const removePriority = (id: string) => {
    const list = customPriorityItems.filter((p) => p.id !== id);
    setCustomPriorityItems(list);
    updateConfig({ customPriorityItems: list });
  };

  const updatePriority = (id: string, name: string, color: string, order: number) => {
    const list = customPriorityItems.map(item =>
      item.id === id ? { ...item, name, color, order } : item
    );
    setCustomPriorityItems(list);
    updateConfig({ customPriorityItems: list });
  };

  const addStatus = (item: StatusItem) => {
    const list = [...customStatusItems, item];
    setCustomStatusItems(list);
    updateConfig({ customStatusItems: list });
  };

  const removeStatus = (id: string) => {
    const list = customStatusItems.filter((s) => s.id !== id);
    setCustomStatusItems(list);
    updateConfig({ customStatusItems: list });
  };

  const updateStatus = (id: string, name: string, color: string, order: number) => {
    const list = customStatusItems.map(item =>
      item.id === id ? { ...item, name, color, order } : item
    );
    setCustomStatusItems(list);
    updateConfig({ customStatusItems: list });
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
    updateConfig({ customStatusTransitions: list });
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
    updatePriority,
    addStatus,
    removeStatus,
    updateStatus,
    toggleTransition,
  };
}

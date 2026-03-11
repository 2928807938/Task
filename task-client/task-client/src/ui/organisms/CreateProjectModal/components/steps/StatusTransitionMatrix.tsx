"use client";

import React from "react";
import {StatusItem, StatusTransitionRule} from "@/types/api-types";

interface Props {
  items: StatusItem[];
  transitions: StatusTransitionRule[];
  onToggle: (fromId: string, toId: string) => void;
}

const StatusTransitionMatrix: React.FC<Props> = ({ items, transitions, onToggle }) => {
  return (
    <div className="mt-4">
      <h6 className="text-sm font-medium mb-2">状态转换规则</h6>
      <div className="p-3 bg-white rounded-lg border border-gray-200">
        <div className="text-xs text-gray-600 mb-2">点击单元格设置或取消状态转换关系</div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-2 py-2 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  从\\到
                </th>
                {items.map((item) => (
                  <th
                    key={item.id}
                    className="px-2 py-2 bg-gray-100 text-left text-xs font-medium"
                    style={{ color: item.color }}
                  >
                    {item.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((from) => (
                <tr key={from.id}>
                  <td
                    className="px-2 py-2 whitespace-nowrap text-xs font-medium"
                    style={{ color: from.color }}
                  >
                    {from.name}
                  </td>
                  {items.map((to) => (
                    <td
                      key={to.id}
                      className="px-2 py-2 whitespace-nowrap text-xs cursor-pointer hover:bg-gray-50"
                      onClick={() => from.id !== to.id && onToggle(from.id, to.id)}
                    >
                      {from.id === to.id ? (
                        <div className="w-4 h-4 flex items-center justify-center text-black">-</div>
                      ) : (
                        <div className="w-4 h-4 flex items-center justify-center">
                          {transitions.some(
                            (r) => r.fromStatusId === from.id && r.toStatusId === to.id
                          ) ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-3 h-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke={to.color}
                              style={{ color: to.color }}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-gray-300"></div>
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatusTransitionMatrix;

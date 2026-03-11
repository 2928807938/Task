import {Task, TaskStatus} from '@/core/domain/entities/task';
import {TaskRepository} from '@/core/interfaces/repositories/task-repository';

export class ToggleTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  execute(id: string): Task | null {
    // 将任务状态更新为已完成，并记录完成时间
    return this.taskRepository.update(id, {
      status: TaskStatus.COMPLETED,
      completedAt: new Date()
    });
  }
}

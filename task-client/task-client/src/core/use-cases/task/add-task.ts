import {Task, TaskPriority, TaskStatus} from '@/core/domain/entities/task';
import {TaskRepository} from '@/core/interfaces/repositories/task-repository';

export class AddTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  execute(title: string): Task {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      status: TaskStatus.WAITING,  // 设置初始状态
      priority: TaskPriority.MEDIUM,  // 设置默认优先级
      createdAt: new Date()
    };

    return this.taskRepository.save(newTask);
  }
}

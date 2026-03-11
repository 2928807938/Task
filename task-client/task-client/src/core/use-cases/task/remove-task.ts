import {TaskRepository} from '@/core/interfaces/repositories/task-repository';

export class RemoveTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  execute(id: string): void {
    this.taskRepository.remove(id);
  }
}

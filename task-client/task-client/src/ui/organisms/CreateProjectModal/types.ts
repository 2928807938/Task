export interface Team {
  id: string;
  name: string;
  description?: string;
}

export interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type ProjectStatusIndicator = 'success' | 'warning' | 'error' | 'stalled';

interface ProjectStatusInfo {
  indicator: ProjectStatusIndicator;
  message: string;
  color: string;
}

export const getProjectStatusInfo = (
  progress: number,
  dueDate: string,
  lastUpdateDate: string
): ProjectStatusInfo => {
  const now = new Date();
  const due = new Date(dueDate);
  const lastUpdate = new Date(lastUpdateDate);
  const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilDue = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = Math.floor((due.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
  const timeProgress = Math.round((1 - daysUntilDue / totalDays) * 100);

  // Проверяем на застопоренность
  if (daysSinceUpdate > 3) {
    return {
      indicator: 'stalled',
      message: 'Project stalled',
      color: 'bg-amber-100 text-amber-800'
    };
  }

  // Проверяем на критичность
  if (progress < 80 && timeProgress > 90) {
    return {
      indicator: 'error',
      message: 'Critical delay',
      color: 'bg-red-100 text-red-800'
    };
  }

  // Проверяем на риск
  if (progress < 50 && timeProgress > 50) {
    return {
      indicator: 'warning',
      message: 'At risk',
      color: 'bg-yellow-100 text-yellow-800'
    };
  }

  // Нормальное состояние
  if (progress > 70 && daysUntilDue > 0) {
    return {
      indicator: 'success',
      message: 'On track',
      color: 'bg-green-100 text-green-800'
    };
  }

  // По умолчанию
  return {
    indicator: 'warning',
    message: 'Needs attention',
    color: 'bg-yellow-100 text-yellow-800'
  };
}; 
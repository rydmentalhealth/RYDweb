/**
 * Task API Service
 * Contains all the functions to interact with the task API endpoints
 */

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  priority: string;
  status: string;
  assigneeId?: string | null;
  createdById?: string | null;
  projectId?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  } | null;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  } | null;
  project?: {
    id: string;
    name: string;
  } | null;
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number | null;
  createdAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  } | null;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  startTime: string;
  endTime?: string | null;
  duration?: number | null;
  description?: string | null;
  createdAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  location?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  priority?: string;
  status?: string;
  assigneeId?: string;
  projectId?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string | null;
  location?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  priority?: string;
  status?: string;
  assigneeId?: string | null;
  projectId?: string | null;
  completedAt?: string | Date | null;
}

export interface CreateTaskCommentData {
  taskId: string;
  content: string;
}

export interface CreateTimeEntryData {
  taskId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  description?: string;
}

// Get all tasks
export async function getAllTasks(filters?: Record<string, any>): Promise<Task[]> {
  let url = '/api/tasks';
  
  if (filters && Object.keys(filters).length > 0) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    url += `?${params.toString()}`;
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch tasks');
  }

  return response.json();
}

// Get a task by ID
export async function getTaskById(id: string): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch task');
  }

  return response.json();
}

// Create a new task
export async function createTask(data: CreateTaskData): Promise<Task> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create task');
  }

  return response.json();
}

// Update a task
export async function updateTask(id: string, data: UpdateTaskData): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update task');
  }

  return response.json();
}

// Delete a task
export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete task');
  }
}

// Add a comment to a task
export async function addTaskComment(data: CreateTaskCommentData): Promise<TaskComment> {
  const response = await fetch(`/api/tasks/${data.taskId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: data.content }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add comment');
  }

  return response.json();
}

// Get task comments
export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  const response = await fetch(`/api/tasks/${taskId}/comments`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch comments');
  }

  return response.json();
}

// Add a time entry to a task
export async function addTimeEntry(data: CreateTimeEntryData): Promise<TimeEntry> {
  const response = await fetch(`/api/tasks/${data.taskId}/time`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add time entry');
  }

  return response.json();
}

// Get task time entries
export async function getTaskTimeEntries(taskId: string): Promise<TimeEntry[]> {
  const response = await fetch(`/api/tasks/${taskId}/time`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch time entries');
  }

  return response.json();
} 
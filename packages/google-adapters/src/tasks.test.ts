/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoogleSheetsTasksService } from './tasks.js';
import type { GoogleSheetsAdapter, GoogleSheetTaskRecord } from './interfaces.js';
import { GoogleAdapterError } from './errors.js';

describe('GoogleSheetsTasksService', () => {
  let mockSheetsAdapter: GoogleSheetsAdapter;
  let service: GoogleSheetsTasksService;

  beforeEach(() => {
    mockSheetsAdapter = {
      readRows: vi.fn(),
      appendRow: vi.fn(),
    };
    
    service = new GoogleSheetsTasksService(mockSheetsAdapter, {
      spreadsheetId: 'test-spreadsheet-id'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws config error if spreadsheetId is missing', () => {
    expect(() => new GoogleSheetsTasksService(mockSheetsAdapter, { spreadsheetId: '' }))
      .toThrow(GoogleAdapterError);
  });

  it('successfully retrieves and maps tasks', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      {
        task_id: 'TASK-001',
        title: 'Complete milestone',
        description: 'Complete the backend implementation',
        department: 'Tech',
        assigned_to_user_id: 'user_123',
        assigned_to_name: 'John Doe',
        assigned_by: 'admin_1',
        deadline: '2026-09-10T00:00:00Z',
        priority: 'high',
        status: 'in_progress',
        progress_update: 'Started coding',
        latest_update_at: '2026-09-02T10:00:00Z',
        remark: 'Keep it up',
        created_at: '2026-09-01T10:00:00Z',
        updated_at: '2026-09-02T10:00:00Z',
        extra_column: 'should be ignored'
      }
    ]);

    const tasks = await service.getTasks();
    
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toEqual({
      task_id: 'TASK-001',
      title: 'Complete milestone',
      description: 'Complete the backend implementation',
      department: 'Tech',
      assigned_to_user_id: 'user_123',
      assigned_to_name: 'John Doe',
      assigned_by: 'admin_1',
      deadline: '2026-09-10T00:00:00Z',
      priority: 'high',
      status: 'in_progress',
      progress_update: 'Started coding',
      latest_update_at: '2026-09-02T10:00:00Z',
      remark: 'Keep it up',
      created_at: '2026-09-01T10:00:00Z',
      updated_at: '2026-09-02T10:00:00Z'
    });
    // Ensure extra_column is ignored
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    expect((tasks[0] as any).extra_column).toBeUndefined();
    
    expect(vi.mocked(mockSheetsAdapter.readRows)).toHaveBeenCalledWith('test-spreadsheet-id', 'GCC_TASKS!A:O');
  });

  it('handles empty sheet', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([]);
    const tasks = await service.getTasks();
    expect(tasks).toEqual([]);
  });

  it('throws MAPPING_ERROR if task_id is missing', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      { title: 'No ID Task' }
    ]);

    await expect(service.getTasks()).rejects.toThrowError(
      new GoogleAdapterError("Mapping error at row 2: Missing task_id", "MAPPING_ERROR", "sheets")
    );
  });

  it('appends a task correctly with exact 15-column mapping', async () => {
    const task: GoogleSheetTaskRecord = {
      task_id: 'TASK-002',
      title: 'New Feature',
      description: 'Implement new UI',
      department: 'Design',
      assigned_to_user_id: 'user_456',
      assigned_to_name: 'Jane Doe',
      assigned_by: 'admin_2',
      deadline: '2026-09-15T00:00:00Z',
      priority: 'medium',
      status: 'pending',
      progress_update: '',
      latest_update_at: '',
      remark: '',
      created_at: '2026-09-02T12:00:00Z',
      updated_at: '2026-09-02T12:00:00Z'
    };

    vi.mocked(mockSheetsAdapter.appendRow).mockResolvedValue();

    await service.appendTask(task);

    expect(vi.mocked(mockSheetsAdapter.appendRow)).toHaveBeenCalledWith(
      'test-spreadsheet-id',
      'GCC_TASKS!A:O',
      [
        'TASK-002', 'New Feature', 'Implement new UI', 'Design', 'user_456',
        'Jane Doe', 'admin_2', '2026-09-15T00:00:00Z', 'medium', 'pending',
        '', '', '', '2026-09-02T12:00:00Z', '2026-09-02T12:00:00Z'
      ]
    );
  });

  it('throws error when appending task without task_id', async () => {
    const invalidTask = { title: 'Missing ID' } as GoogleSheetTaskRecord;
    
    await expect(service.appendTask(invalidTask)).rejects.toThrowError(
      new GoogleAdapterError("Mapping error: Cannot append task without task_id", "MAPPING_ERROR", "sheets")
    );
  });

  it('successfully locates a task by id', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      {
        task_id: 'TASK-001',
        title: 'First task',
        description: '...',
        department: 'Tech',
        assigned_to_user_id: 'user_1',
        assigned_to_name: 'A',
        assigned_by: 'admin',
        deadline: '2026-09-10T00:00:00Z',
        priority: 'high',
        status: 'pending',
        progress_update: '',
        latest_update_at: '',
        remark: '',
        created_at: '2026-09-01T10:00:00Z',
        updated_at: '2026-09-01T10:00:00Z'
      },
      {
        task_id: 'TASK-002',
        title: 'Second task',
        description: '...',
        department: 'Design',
        assigned_to_user_id: 'user_2',
        assigned_to_name: 'B',
        assigned_by: 'admin',
        deadline: '2026-09-11T00:00:00Z',
        priority: 'low',
        status: 'completed',
        progress_update: 'done',
        latest_update_at: '2026-09-02T10:00:00Z',
        remark: 'good',
        created_at: '2026-09-01T11:00:00Z',
        updated_at: '2026-09-02T10:00:00Z'
      }
    ]);

    const task = await service.getTaskById('TASK-002');
    
    expect(task).not.toBeNull();
    expect(task?.title).toBe('Second task');
    expect(task?.department).toBe('Design');
  });

  it('returns null if task is not found by id', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      {
        task_id: 'TASK-001',
        title: 'Only task',
        description: '...',
        department: 'Tech',
        assigned_to_user_id: 'user_1',
        assigned_to_name: 'A',
        assigned_by: 'admin',
        deadline: '2026-09-10T00:00:00Z',
        priority: 'high',
        status: 'pending',
        progress_update: '',
        latest_update_at: '',
        remark: '',
        created_at: '2026-09-01T10:00:00Z',
        updated_at: '2026-09-01T10:00:00Z'
      }
    ]);

    const task = await service.getTaskById('TASK-MISSING');
    expect(task).toBeNull();
  });
  
  it('throws error when locating task without task_id provided', async () => {
    await expect(service.getTaskById('')).rejects.toThrowError(
      new GoogleAdapterError("Missing taskId for lookup", "CONFIG_ERROR", "sheets")
    );
  });
});

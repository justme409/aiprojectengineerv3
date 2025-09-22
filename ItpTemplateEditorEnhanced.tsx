'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
} from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import RowAttachmentUploader from './RowAttachmentUploader';
import { saveAssetContent, commitAssetRevision } from '@/lib/actions/asset-actions';
import { toast } from 'sonner';

// AutoResizingTextarea component
const AutoResizingTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, value, onChange, onBlur, ...props }, ref) => {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const combinedRef = ref || internalRef;

  const autoResize = useCallback(() => {
    const element = typeof combinedRef === 'function' ? null : combinedRef?.current;
    if (element) {
      element.style.height = 'auto';
      element.style.height = element.scrollHeight + 'px';
    }
  }, [combinedRef]);

  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  return (
    <textarea
      ref={combinedRef}
      className={cn("min-h-[24px] w-full resize-none overflow-hidden", className)}
      value={value}
      onChange={(e) => {
        onChange?.(e);
        autoResize();
      }}
      onBlur={(e) => {
        onBlur?.(e);
        autoResize();
      }}
      {...props}
    />
  );
});
AutoResizingTextarea.displayName = 'AutoResizingTextarea';

// Updated interfaces for adjacency list format
interface ItpItem {
  id: string;
  item_no: string;
  parentId: string | null;
  thinking?: string | null;
  section_name?: string | null;
  'Inspection/Test Point'?: string | null;
  'Acceptance Criteria'?: string | null;
  'Specification Clause'?: string | null;
  'Inspection/Test Method'?: string | null;
  Frequency?: string | null;
  Responsibility?: string | null;
  'Hold/Witness Point'?: string | null;
}

interface TemplateData {
  id: string;
  name: string | null;
  version: string | null;
  status: string | null;
  // Content can be either a raw adjacency list (array) or an object with items array
  content?: ItpItem[] | { items?: ItpItem[]; [key: string]: any };
}

interface ItpTemplateEditorEnhancedProps {
  templateData: TemplateData;
  projectId: string;
  templateId: string;
  onDataChange?: (hasChanges: boolean, data: TemplateData) => void;
  disabled?: boolean;
}

export function ItpTemplateEditorEnhanced({ 
  templateData, 
  projectId, 
  templateId, 
  onDataChange,
  disabled = false 
}: ItpTemplateEditorEnhancedProps) {
  const [data, setData] = useState(templateData);
  const [originalData, setOriginalData] = useState(templateData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [rowAttachments, setRowAttachments] = useState<Record<string, any[]>>({});
  
  const [columnSizingState, setColumnSizingState] = useState(() => {
    try {
      const saved = localStorage.getItem('itpTableSizingPreferences');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Save column sizing preferences
  useEffect(() => {
    if (Object.keys(columnSizingState).length > 0) {
      localStorage.setItem('itpTableSizingPreferences', JSON.stringify(columnSizingState));
    }
  }, [columnSizingState]);

  // Detect changes
  useEffect(() => {
    const hasChanges = JSON.stringify(data) !== JSON.stringify(originalData);
    setHasUnsavedChanges(hasChanges);
    onDataChange?.(hasChanges, data);
  }, [data, originalData, onDataChange]);

  // Process adjacency list into display rows (much simpler now!)
  const rows = React.useMemo(() => {
    if (!data.content) return [];
    const items: ItpItem[] = Array.isArray(data.content)
      ? data.content
      : Array.isArray((data.content as any).items)
        ? (data.content as any).items as ItpItem[]
        : [];

    return items.map((item, index) => ({
      id: item.id,
      isSection: item.parentId === null,
      item,
      originalIndex: index,
    }));
  }, [data]);

  const handleCellUpdate = useCallback((itemId: string, field: string, value: string) => {
    setData(prevData => {
      if (!prevData.content) return prevData;
      if (Array.isArray(prevData.content)) {
        const newItems = prevData.content.map(item => item.id === itemId ? { ...item, [field]: value } : item);
        return { ...prevData, content: newItems };
      }
      const prevObj = prevData.content as any;
      const items: ItpItem[] = Array.isArray(prevObj.items) ? prevObj.items : [];
      const newItems = items.map(item => item.id === itemId ? { ...item, [field]: value } : item);
      return { ...prevData, content: { ...prevObj, items: newItems } };
    });
  }, []);

  const handleAttachmentChange = useCallback((rowId: string, attachments: any[]) => {
    setRowAttachments(prev => {
      const current = prev[rowId] || [];
      if (JSON.stringify(current) === JSON.stringify(attachments)) {
        return prev;
      }
      
      setHasUnsavedChanges(true);
      return {
        ...prev,
        [rowId]: attachments
      };
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Preserve original content shape: if object with items, update items; if array, save array
      const contentForSave = Array.isArray(data.content)
        ? data.content
        : data.content && typeof data.content === 'object'
          ? data.content
          : [];
      const result = await saveAssetContent({
        assetId: templateId,
        content: contentForSave as any,
        projectId,
      });
      
      if (result.success) {
        setOriginalData(data);
        setHasUnsavedChanges(false);
        toast.success('Changes saved successfully');
      } else {
        toast.error((result as any).message || 'Failed to save changes');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('An unexpected error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleCommit = async () => {
    if (hasUnsavedChanges) {
      toast.error('Please save your changes before creating a new revision');
      return;
    }

    const changeLog = prompt('Enter a description of the changes for this revision:');
    if (!changeLog?.trim()) {
      toast.error('Change log is required to create a new revision');
      return;
    }

    setCommitting(true);
    try {
      const result = await commitAssetRevision({
        assetId: templateId,
        projectId,
        commitMessage: changeLog.trim(),
        isApproval: false,
      });
      
      if ((result as any).success) {
        toast.success('New revision created successfully');
      } else {
        toast.error((result as any).error || 'Failed to create new revision');
      }
    } catch (error) {
      console.error('Commit error:', error);
      toast.error('An unexpected error occurred while creating revision');
    } finally {
      setCommitting(false);
    }
  };

  // Listen to external toolbar events for Save/Commit
  useEffect(() => {
    const onSave = async () => {
      await handleSave();
    };
    const onCommit = async () => {
      await handleCommit();
    };
    document.addEventListener('itp:save', onSave as EventListener);
    document.addEventListener('itp:commit', onCommit as EventListener);
    return () => {
      document.removeEventListener('itp:save', onSave as EventListener);
      document.removeEventListener('itp:commit', onCommit as EventListener);
    };
  }, [handleSave]);

  // EditableCell component
  const EditableCell = ({ value, onChange, placeholder }: { 
    value: string; 
    onChange: (value: string) => void;
    placeholder?: string;
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [cellValue, setCellValue] = useState(value || '');

    useEffect(() => {
      setCellValue(value || '');
    }, [value]);

    const handleBlur = () => {
      setIsEditing(false);
      onChange(cellValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleBlur();
      }
      if (e.key === 'Escape') {
        setCellValue(value || '');
        setIsEditing(false);
      }
    };

    if (disabled) {
      return (
        <div className="w-full min-h-[24px] whitespace-pre-wrap py-1 text-gray-500">
          {cellValue || <span className="text-gray-400 italic">No data</span>}
        </div>
      );
    }

    if (isEditing) {
      return (
        <AutoResizingTextarea
          className="w-full h-auto bg-transparent border-0 focus:ring-0 resize-none overflow-hidden"
          value={cellValue}
          onChange={(e) => setCellValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      );
    }

    return (
      <div 
        className="w-full min-h-[24px] cursor-text whitespace-pre-wrap py-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-1 transition-colors"
        onClick={() => !disabled && setIsEditing(true)}
      >
        {cellValue || <span className="text-gray-400 italic">{placeholder || 'Click to edit'}</span>}
      </div>
    );
  };

  // Column definitions
  const columnHelper = createColumnHelper<any>();
  
  const columns = React.useMemo(() => [
    columnHelper.accessor('id', {
      id: 'itemNo',
      header: 'Item No.',
      cell: info => {
        const row = info.row.original;
        if (row.isSection) return null;
        return row.item.item_no;
      },
      size: 80,
      enableResizing: true,
    }),
    columnHelper.accessor('id', {
      id: 'inspectionPoint',
      header: 'Inspection/Test Point',
      cell: info => {
        const row = info.row.original;
        if (row.isSection) return null;
        
        return (
          <EditableCell
            value={row.item['Inspection/Test Point'] || ''}
            onChange={(value) => handleCellUpdate(row.id, 'Inspection/Test Point', value)}
            placeholder="Enter inspection/test point"
          />
        );
      },
      size: 250,
      enableResizing: true,
    }),
    columnHelper.accessor('id', {
      id: 'acceptanceCriteria',
      header: 'Acceptance Criteria',
      cell: info => {
        const row = info.row.original;
        if (row.isSection) return null;
        
        return (
          <EditableCell
            value={row.item['Acceptance Criteria'] || ''}
            onChange={(value) => handleCellUpdate(row.id, 'Acceptance Criteria', value)}
            placeholder="Enter acceptance criteria"
          />
        );
      },
      size: 300,
      enableResizing: true,
    }),
    columnHelper.accessor('id', {
      id: 'specificationClause',
      header: 'Specification/Clause',
      cell: info => {
        const row = info.row.original;
        if (row.isSection) return null;
        
        return (
          <EditableCell
            value={row.item['Specification Clause'] || ''}
            onChange={(value) => handleCellUpdate(row.id, 'Specification Clause', value)}
            placeholder="Enter specification"
          />
        );
      },
      size: 200,
      enableResizing: true,
    }),
    columnHelper.accessor('id', {
      id: 'inspectionTestMethod',
      header: 'Inspection/Test Method',
      cell: info => {
        const row = info.row.original;
        if (row.isSection) return null;
        
        return (
          <EditableCell
            value={row.item['Inspection/Test Method'] || ''}
            onChange={(value) => handleCellUpdate(row.id, 'Inspection/Test Method', value)}
            placeholder="Enter method"
          />
        );
      },
      size: 150,
      enableResizing: true,
    }),
    columnHelper.accessor('id', {
      id: 'frequency',
      header: 'Frequency',
      cell: info => {
        const row = info.row.original;
        if (row.isSection) return null;
        
        return (
          <EditableCell
            value={row.item.Frequency || ''}
            onChange={(value) => handleCellUpdate(row.id, 'Frequency', value)}
            placeholder="Enter frequency"
          />
        );
      },
      size: 120,
      enableResizing: true,
    }),
    columnHelper.accessor('id', {
      id: 'responsibility',
      header: 'Responsibility',
      cell: info => {
        const row = info.row.original;
        if (row.isSection) return null;
        
        return (
          <EditableCell
            value={row.item.Responsibility || ''}
            onChange={(value) => handleCellUpdate(row.id, 'Responsibility', value)}
            placeholder="Enter responsibility"
          />
        );
      },
      size: 120,
      enableResizing: true,
    }),
    columnHelper.accessor('id', {
      id: 'holdWitness',
      header: 'Hold/Witness Point',
      cell: info => {
        const row = info.row.original;
        if (row.isSection) return null;
        
        return (
          <EditableCell
            value={row.item['Hold/Witness Point'] || ''}
            onChange={(value) => handleCellUpdate(row.id, 'Hold/Witness Point', value)}
            placeholder="Enter hold/witness point"
          />
        );
      },
      size: 120,
      enableResizing: true,
    }),
    columnHelper.accessor('id', {
      id: 'attachments',
      header: 'Attachments',
      cell: info => {
        const row = info.row.original;
        if (row.isSection) return null;
        
        return (
          <RowAttachmentUploader
            templateId={templateId}
            rowId={row.id}
            projectId={projectId}
            onAttachmentsChange={(attachments) => handleAttachmentChange(row.id, attachments)}
            disabled={disabled}
          />
        );
      },
      size: 100,
      enableResizing: true,
    }),
  ], [handleCellUpdate, handleAttachmentChange, templateId, projectId, disabled]);

  // Initialize the table
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnSizing: columnSizingState,
    },
    onColumnSizingChange: setColumnSizingState,
    defaultColumn: {
      minSize: 80,
      maxSize: 1000,
      size: 150,
    },
    columnResizeMode: 'onChange',
    enableColumnResizing: true,
  });

  const isSectionRow = (row: any) => row.original.isSection;

  return (
    <div className="bg-background rounded-lg shadow-sm w-full">

      {/* Table */}
      <table 
        className="w-full border-collapse"
        style={{ 
          width: table.getTotalSize(),
          minWidth: '100%'
        }}
        data-resizing={Object.keys(table.getState().columnSizingInfo).length > 0 ? 'true' : 'false'}
      >
        <thead>
          <tr>
            {table.getFlatHeaders().map(header => (
              <th
                key={header.id}
                className="bg-blue-700 dark:bg-muted text-white dark:text-primary-foreground font-medium border-r border-blue-600/20 dark:border-border text-left"
                style={{
                  width: header.getSize(),
                  position: 'relative',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  padding: '0.375rem 1rem',
                  height: '32px',
                }}
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
                {header.column.getCanResize() && (
                  <div
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    className={`absolute top-0 right-0 h-full w-5 cursor-col-resize select-none touch-none z-10 ${
                      header.column.getIsResizing() 
                        ? 'bg-blue-500 dark:bg-accent resizing' 
                        : 'bg-blue-900 dark:bg-secondary opacity-0 hover:opacity-100'
                    }`}
                    data-resizer
                    title="Resize column"
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => {
            // For section headers
            if (isSectionRow(row)) {
              return (
                <tr key={row.id} className="section-row">
                  <td
                    colSpan={columns.length}
                    className="bg-muted font-semibold py-3 px-4 border-b dark:border-border dark:bg-[#252526]"
                    style={{
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                    }}
                  >
                    {row.original.item.section_name}
                  </td>
                </tr>
              );
            }
            
            // For regular rows
            return (
              <tr 
                key={row.id}
                className={cn(
                  "hover:bg-muted/50 dark:hover:bg-[#2a2d2e] transition-colors",
                  row.original.originalIndex % 2 === 0 ? 'bg-background dark:bg-[#1e1e1e]' : 'bg-muted/30 dark:bg-[#202020]'
                )}
              >
                {row.getVisibleCells().map(cell => (
                  <td 
                    key={cell.id}
                    className="align-top border-r dark:border-border px-4 py-3"
                    style={{ 
                      verticalAlign: 'top', 
                      height: '100%',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                    }}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Table styling */}
      <style jsx>{`
        .cursor-col-resize {
          cursor: col-resize !important;
        }
        
        table {
          border-spacing: 0;
          table-layout: fixed;
        }
        
        .react-table-resizing {
          cursor: col-resize;
        }
        
        table[data-resizing="true"] * {
          user-select: none;
        }
        
        [data-resizer].resizing::after {
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          height: 100vh;
          width: 2px;
          background-color: var(--accent, #0e639c);
          z-index: 1;
        }
        
        th:hover [data-resizer] {
          opacity: 0.5 !important;
        }
        
        [data-resizer]:hover {
          opacity: 1 !important;
          background-color: var(--primary, #3b82f6) !important;
        }
        
        [data-resizer] {
          position: absolute;
          right: 0;
          top: 0;
          height: 100%;
          width: 5px;
          cursor: col-resize;
          user-select: none;
          touch-action: none;
        }
        
        th, td {
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
          white-space: normal;
        }
        
        tbody tr {
          min-height: fit-content;
          height: auto;
        }
        
        td {
          min-height: 100%;
          height: auto;
        }
        
        textarea {
          font-size: 0.875rem;
          font-family: inherit;
          line-height: 1.5;
          background-color: transparent;
          color: inherit;
        }
        
        :global(.dark) textarea {
          color: var(--foreground);
          background-color: transparent;
        }
        
        :global(.dark) table {
          color: var(--foreground);
        }
        
        :global(.dark) th, :global(.dark) td {
          border-color: var(--border);
        }
        
        :global(.dark) .section-row td {
          background-color: #252526;
          color: white;
        }
        
        :global(.dark) tbody tr:nth-child(even) td {
          background-color: #1e1e1e;
        }
        
        :global(.dark) tbody tr:nth-child(odd) td {
          background-color: #202020;
        }
        
        :global(.dark) tbody tr:hover td {
          background-color: #2a2d2e;
        }
        
        :global(.dark) thead th {
          background-color: #252526;
          color: white;
        }
        
        :global(.dark) textarea:focus {
          background-color: rgba(14, 99, 156, 0.1);
        }
      `}</style>
    </div>
  );
} 
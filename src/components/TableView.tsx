import React, { useState, ChangeEvent, KeyboardEvent } from 'react';
import { Table, Record, ColumnDefinition } from '../types';
import '../styles/TableView.css';
import { usePermissions } from '../hooks/usePermissions';
import { downloadCSV, downloadExcel } from '../utils/exportUtils';

// 定義組件的 props 類型
interface TableViewProps {
  table: Table;                // 要顯示的表格數據
  onRecordUpdate: (recordId: string, data: Partial<Record>) => void;  // 更新記錄的回調函數
  currentUser: any;            // 當前用戶
  isLoading?: boolean;        // 加載狀態標誌
}

export const TableView: React.FC<TableViewProps> = ({ 
  table, 
  onRecordUpdate,
  currentUser,
  isLoading = false 
}) => {
  const { checkPermission } = usePermissions(currentUser);
  const canEdit = checkPermission('table', 'write');
  const canExport = checkPermission('table', 'read');

  // 管理當前正在編輯的單元格
  const [editingCell, setEditingCell] = useState<{
    recordId: string;
    columnId: string;
  } | null>(null);

  // 在組件內添加狀態
  const [isExporting, setIsExporting] = useState<'csv' | 'excel' | null>(null);

  // 渲染表格單元格的函數
  const renderCell = (record: Record, column: ColumnDefinition) => {
    // 判斷當前單元格是否處於編輯狀態
    const isEditing = editingCell?.recordId === record.id && 
                      editingCell?.columnId === column.id;

    if (isEditing && canEdit) {
      // 渲染編輯狀態的輸入框
      return (
        <input
          type="text"
          value={record[column.id] || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            onRecordUpdate(record.id, { [column.id]: e.target.value });
          }}
          onBlur={() => setEditingCell(null)}  // 失焦時退出編輯狀態
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              setEditingCell(null);  // 按回車時退出編輯狀態
            }
          }}
          autoFocus
        />
      );
    }

    // 渲染普通狀態的單元格
    return (
      <div
        className={`table-cell ${canEdit ? 'editable' : ''}`}
        onClick={() => canEdit && setEditingCell({ recordId: record.id, columnId: column.id })}
      >
        {record[column.id] || '-'}  // 顯示值，如果為空則顯示 '-'
      </div>
    );
  };

  // 更新導出處理函數
  const handleExport = async (format: 'csv' | 'excel') => {
    if (!canExport || isExporting) return;

    try {
      setIsExporting(format);
      const headers = table.columns.map(col => col.name);
      const data = table.records.map(record => 
        table.columns.map(col => record[col.id]?.toString() || '')
      );

      const fileName = `${table.name}_${new Date().toISOString().split('T')[0]}`;

      if (format === 'csv') {
        await downloadCSV(headers, data, fileName);
      } else {
        await downloadExcel(headers, data, fileName);
      }
    } catch (error) {
      console.error('導出失敗:', error);
      alert('導出失敗，請稍後再試');
    } finally {
      setIsExporting(null);
    }
  };

  // 顯示加載狀態
  if (isLoading) {
    return <div className="table-loading">載入中...</div>;
  }

  // 顯示空數據狀態
  if (!table.records.length) {
    return <div className="table-empty">暫無數據</div>;
  }

  // 渲染完整的表格
  return (
    <div className="table-view">
      <div className="table-header">
        <h2>{table.name}</h2>
        {canExport && (
          <div className="export-buttons">
            <button 
              className={`export-button ${isExporting === 'csv' ? 'loading' : ''}`}
              onClick={() => handleExport('csv')}
              disabled={isExporting !== null}
            >
              {isExporting === 'csv' ? '導出中...' : '下載 CSV'}
            </button>
            <button 
              className={`export-button ${isExporting === 'excel' ? 'loading' : ''}`}
              onClick={() => handleExport('excel')}
              disabled={isExporting !== null}
            >
              {isExporting === 'excel' ? '導出中...' : '下載 Excel'}
            </button>
          </div>
        )}
      </div>
      <table>
        <thead>
          <tr>
            {table.columns.map(column => (
              <th key={column.id} style={{ width: column.width }}>
                {column.name}
                {column.required && <span className="required">*</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.records.map(record => (
            <tr key={record.id}>
              {table.columns.map(column => (
                <td key={`${record.id}-${column.id}`}>
                  {renderCell(record, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 
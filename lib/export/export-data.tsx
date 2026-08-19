'use client';

import React, { useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, FileText, Database, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ExportColumn {
  key: string;
  label: string;
  format?: (value: any) => string;
}

export type ExportFormat = 'csv' | 'json' | 'excel' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  columns?: ExportColumn[];
}

/**
 * Export data to CSV format
 */
function exportToCSV(data: any[], columns: ExportColumn[], filename: string) {
  const headers = columns.map(col => col.label);
  const keys = columns.map(col => col.key);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      keys.map(key => {
        const value = row[key];
        const formatted = columns.find(c => c.key === key)?.format?.(value) || String(value || '');
        // Escape quotes and wrap in quotes if contains comma
        if (formatted.includes(',') || formatted.includes('"') || formatted.includes('\n')) {
          return `"${formatted.replace(/"/g, '""')}"`;
        }
        return formatted;
      }).join(',')
    )
  ].join('\n');

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.success(`Exported ${data.length} records to CSV`);
}

/**
 * Export data to JSON format
 */
function exportToJSON(data: any[], filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.success(`Exported ${data.length} records to JSON`);
}

/**
 * Export data to Excel format (simplified CSV approach)
 */
function exportToExcel(data: any[], columns: ExportColumn[], filename: string) {
  // For Excel, we'll use CSV with BOM for better Excel compatibility
  const headers = columns.map(col => col.label);
  const keys = columns.map(col => col.key);

  const csvContent = [
    headers.join('\t'), // Tab-separated for Excel
    ...data.map(row =>
      keys.map(key => {
        const value = row[key];
        const formatted = columns.find(c => c.key === key)?.format?.(value) || String(value || '');
        return formatted;
      }).join('\t')
    )
  ].join('\n');

  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xls`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.success(`Exported ${data.length} records to Excel`);
}

/**
 * Export data to PDF format (using print dialog)
 */
function exportToPDF(data: any[], columns: ExportColumn[], filename: string) {
  // Create a simple HTML table for printing
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
        body { font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .header { text-align: center; margin-bottom: 20px; }
        .footer { margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${filename}</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
      <table>
        <thead>
          <tr>
            ${columns.map(col => `<th>${col.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${columns.map(col => {
                const value = row[col.key];
                const formatted = col.format?.(value) || String(value || '');
                return `<td>${formatted}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p>Total records: ${data.length}</p>
      </div>
    </body>
    </html>
  `;

  // Open print dialog
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
    toast.success('PDF export dialog opened');
  } else {
    toast.error('Failed to open PDF export dialog');
  }
}

/**
 * Main export function
 */
export async function exportData(
  data: any[],
  options: ExportOptions
): Promise<void> {
  const {
    format,
    filename = 'export',
    columns = Object.keys(data[0] || {}).map(key => ({ key, label: key }))
  } = options;

  if (data.length === 0) {
    toast.error('No data to export');
    return;
  }

  try {
    switch (format) {
      case 'csv':
        exportToCSV(data, columns, filename);
        break;
      case 'json':
        exportToJSON(data, filename);
        break;
      case 'excel':
        exportToExcel(data, columns, filename);
        break;
      case 'pdf':
        exportToPDF(data, columns, filename);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Failed to export data');
  }
}

/**
 * Export button component
 */
interface ExportButtonProps {
  data: any[];
  columns?: ExportColumn[];
  filename?: string;
  formats?: ('csv' | 'json' | 'excel' | 'pdf')[];
  onExport?: (format: string) => void;
  className?: string;
}

export function ExportButton({
  data,
  columns,
  filename = 'export',
  formats = ['csv', 'json', 'excel', 'pdf'],
  onExport,
  className = ''
}: ExportButtonProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (format: ExportFormat) => {
    try {
      setExporting(format);
      await exportData(data, { format, filename, columns });
      if (onExport) {
        onExport(format);
      }
    } finally {
      setExporting(null);
    }
  };

  const formatIcons = {
    csv: FileSpreadsheet,
    json: Database,
    excel: FileSpreadsheet,
    pdf: FileText,
  };

  if (data.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {formats.map(format => {
        const Icon = formatIcons[format];
        const isExportingThis = exporting === format;

        return (
          <Button
            key={format}
            onClick={() => handleExport(format)}
            disabled={exporting !== null}
            size="sm"
            variant="outline"
            className="min-w-[100px]"
          >
            {isExportingThis ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Icon className="h-4 w-4 mr-2" />
                {format.toUpperCase()}
              </>
            )}
          </Button>
        );
      })}
    </div>
  );
}

/**
 * Quick export single format
 */
export function QuickExport({
  data,
  format = 'csv',
  filename,
  className = ''
}: {
  data: any[];
  format?: 'csv' | 'json' | 'excel' | 'pdf';
  filename?: string;
  className?: string;
}) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportData(data, { format, filename });
    } finally {
      setExporting(false);
    }
  };

  if (data.length === 0) {
    return null;
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
        exporting ? 'opacity-75' : ''
      } ${className}`}
      style={{
        background: 'linear-gradient(180deg, var(--primary) 0%, var(--accent) 100%)',
        color: '#FFFFFF',
        border: 'none'
      }}
    >
      {exporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Export {format.toUpperCase()}
        </>
      )}
    </button>
  );
}

/**
 * Export menu dropdown component
 */
export function ExportMenu({
  data,
  columns,
  filename = 'export',
  trigger,
  className = ''
}: {
  data: any[];
  columns?: ExportColumn[];
  filename?: string;
  trigger: ReactNode;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const formats = [
    { id: 'csv', label: 'CSV (Excel)', icon: FileSpreadsheet },
    { id: 'json', label: 'JSON (Data)', icon: Database },
    { id: 'excel', label: 'Excel File', icon: FileSpreadsheet },
    { id: 'pdf', label: 'PDF (Print)', icon: FileText },
  ];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
        style={{
          background: 'linear-gradient(180deg, var(--primary) 0%, var(--accent) 100%)',
          color: '#FFFFFF',
          border: 'none'
        }}
      >
        <Download className="h-4 w-4" />
        Export
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-lg border bg-card shadow-lg"
          >
            {formats.map(format => (
              <button
                key={format.id}
                onClick={() => {
                  exportData(data, { format: format.id as any, filename, columns });
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-muted flex items-center gap-3 transition-colors"
              >
                <format.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{format.label}</span>
              </button>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}
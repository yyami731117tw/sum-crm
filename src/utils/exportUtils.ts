// CSV 導出功能
export const downloadCSV = (headers: string[], data: string[][], fileName: string) => {
  const csvContent = [
    headers.join(','),
    ...data.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Excel 導出功能
export const downloadExcel = async (headers: string[], data: string[][], fileName: string) => {
  try {
    // 動態導入 xlsx 庫
    const XLSX = await import('xlsx');
    
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  } catch (error) {
    console.error('Excel 導出失敗:', error);
    alert('Excel 導出失敗，請稍後再試');
  }
}; 
import { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';

export function useTableSync(triggerToast) {
  const [selectedTable, setSelectedTable] = useState('Table 3');
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // URL Parameter Detection for table number
  useEffect(() => {
    const tableParam = searchParams.get('table');
    if (tableParam) {
      let formattedTable = tableParam.trim();
      if (/^\d+$/.test(formattedTable)) {
        formattedTable = `Table ${formattedTable}`;
      } else if (/^table\s*\d+$/i.test(formattedTable)) {
        const num = formattedTable.match(/\d+/)[0];
        formattedTable = `Table ${num}`;
      }
      setSelectedTable((prev) => {
        if (prev !== formattedTable) {
          triggerToast(`Table connection established: ${formattedTable}`, 'success');
          return formattedTable;
        }
        return prev;
      });
    }
  }, [searchParams, triggerToast]);

  return {
    selectedTable,
    setSelectedTable
  };
}

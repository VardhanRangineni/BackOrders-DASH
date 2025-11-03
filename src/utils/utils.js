export const formatDate = (dateStr) => {
  const date = new Date(dateStr.split(' ')[0]);
  return date.toLocaleDateString('en-CA');
};

export const dateDiffInDays = (a, b) => {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor(Math.abs(utc2 - utc1) / _MS_PER_DAY);
};

export const dateDiffInHours = (createdStr, updatedStr) => {
  const created = new Date(createdStr.replace(' ', 'T'));
  const updated = new Date(updatedStr.replace(' ', 'T'));
  return Math.abs(updated.getTime() - created.getTime()) / (1000 * 60 * 60);
};

export const exportToCSV = (data, headers, fileName) => {
  const headerKeys = Object.keys(headers);
  const headerNames = Object.values(headers);
  const csvRows = [];
  csvRows.push(headerNames.join(','));
  
  for (const row of data) {
    const values = headerKeys.map(key => {
      const val = row[key] !== undefined ? row[key] : '';
      return `"${val}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Completed':
      return 'bg-success';
    case 'Pending Sourcing':
      return 'bg-warning text-dark';
    case 'TO Created':
    case 'PO Created':
    case 'Accepted':
    case 'In Dispatch':
      return 'bg-primary';
    case 'Partially Fulfilled':
      return 'bg-info';
    case 'Market Purchase':
    case 'In Progress':
    case 'Approved':
      return 'bg-warning text-dark';
    case 'Exception':
    case 'Rejected':
    case 'Cancelled':
      return 'bg-danger';
    case 'Fulfilled':
      return 'bg-success';
    case 'Draft':
      return 'bg-warning text-dark';
    case 'Partial':
      return 'bg-info';
    default:
      return 'bg-secondary';
  }
};

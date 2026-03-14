

interface WorkshopTableProps {
  headers: string[];
  children: React.ReactNode;
}

export function WorkshopTable({ headers, children }: WorkshopTableProps) {
  return (
    <div className="sf-table-container">
      <table className="sf-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
}

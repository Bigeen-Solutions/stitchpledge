import { WorkshopTable } from "./WorkshopTable";

interface WorkshopTableSkeletonProps {
  headers: string[];
  rowCount?: number;
}

export function WorkshopTableSkeleton({ headers, rowCount = 6 }: WorkshopTableSkeletonProps) {
  const rows = Array.from({ length: rowCount });

  return (
    <WorkshopTable headers={headers}>
      {rows.map((_, i) => (
        <tr key={i} className="skeleton-pulse">
          <td>
            <div className="skeleton-shimmer" style={{ height: '1.25rem', width: '60px', marginBottom: '4px' }}></div>
            <div className="skeleton-shimmer" style={{ height: '0.75rem', width: '40px' }}></div>
          </td>
          <td>
            <div className="skeleton-shimmer" style={{ height: '1rem', width: '120px' }}></div>
          </td>
          <td>
            <div className="skeleton-shimmer" style={{ height: '1rem', width: '100px' }}></div>
          </td>
          <td>
            <div className="skeleton-shimmer" style={{ height: '1.5rem', width: '80px' }}></div>
          </td>
          <td>
            <div className="skeleton-badge skeleton-shimmer"></div>
          </td>
        </tr>
      ))}
    </WorkshopTable>
  );
}

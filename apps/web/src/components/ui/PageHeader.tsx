import { Link } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: { label: string; to?: string; onClick?: () => void };
  breadcrumbs?: { label: string; to?: string }[];
}

export default function PageHeader({ title, description, action, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumbs && (
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span>/</span>}
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-brand-600">{crumb.label}</Link>
              ) : (
                <span className="text-gray-900">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && <p className="text-gray-500 mt-1">{description}</p>}
        </div>
        {action && (
          action.to ? (
            <Link to={action.to} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              {action.label}
            </Link>
          ) : (
            <button onClick={action.onClick} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              {action.label}
            </button>
          )
        )}
      </div>
    </div>
  );
}

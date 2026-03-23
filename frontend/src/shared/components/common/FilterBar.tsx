"use client";

type FilterBarProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function FilterBar({ title, description, children }: FilterBarProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">{title}</h3>
          <p className="card-subtitle">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

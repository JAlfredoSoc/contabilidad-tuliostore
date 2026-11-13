export default function StatusBadge({ children, variant = "" }) {
  return <span className={`badge ${variant}`.trim()}>{children}</span>;
}

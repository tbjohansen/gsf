export default function Badge({
    name,
    color
}) {
  const colorClasses = {
    red: 'bg-red-50 text-red-600 inset-ring inset-ring-red-500/10',
    blue: 'bg-blue-50 text-blue-600 inset-ring inset-ring-blue-500/10',
    green: 'bg-green-50 text-green-600 inset-ring inset-ring-green-500/10',
    yellow: 'bg-yellow-50 text-yellow-600 inset-ring inset-ring-yellow-500/10',
    // add more colors as needed
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${colorClasses[color] || colorClasses.red}`}>
      {name}
    </span>
  )
}

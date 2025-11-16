export default function Badge({
    name,
    color
}) {
  return (
    <>
      <span className={`inline-flex items-center rounded-md bg-${color}-50 px-2 py-1 text-xs font-medium text-${color}-600 inset-ring inset-ring-${color}-500/10`}>
        {name}
      </span>
    </>
  )
}

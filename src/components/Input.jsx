

export function Input({
  label,
  type,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  className = "",
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm/6 font-medium text-gray-900">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type || "text"}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={className}
        style={{
          border: error ? "1px solid red" : "1px solid #ccc",
        }}
      />
      {error && <div style={{ color: "red", marginTop: "0.25rem" }}>{error}</div>}
    </div>
  );
}

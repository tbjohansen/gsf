const LIMIT = 1000;

export default function TextareaWithLimit({
  value = "",
  onChange,
  placeholder = "Start writing here…",
  limit = LIMIT,
}) {
  const chars = value.length;
  const pct = Math.min((chars / limit) * 100, 100);
  const remaining = limit - chars;

  const isOver = chars >= limit;
  const isNear = chars >= limit * 0.9 && !isOver;

  const handleChange = (e) => {
    if (e.target.value.length <= limit) {
      onChange?.(e);
    }
  };

  const handleClear = () => {
    onChange?.({ target: { value: "" } });
  };

  const barColor = isOver
    ? "bg-red-500"
    : isNear
    ? "bg-amber-400"
    : "bg-emerald-500";

  const counterColor = isOver
    ? "text-red-600"
    : isNear
    ? "text-amber-600"
    : "text-gray-400";

  const hintColor = isOver
    ? "text-red-500 font-medium"
    : isNear
    ? "text-amber-500"
    : "text-gray-400";

  const borderColor = isOver
    ? "border-red-400 ring-2 ring-red-100"
    : "border-gray-200 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100";

  return (
    <div className="w-full">
      <label className="block text-xs  tracking-widest uppercase text-gray-400 mb-2">
        Your Announcement
      </label>

      <div className={`relative rounded-xl border bg-white transition-all duration-150 ${borderColor}`}>
        <textarea
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          spellCheck
          className="w-full min-h-56 resize-y rounded-xl px-5 pt-4 pb-14 text-base leading-relaxed text-gray-800 placeholder:text-gray-300 placeholder:italic bg-transparent outline-none"
        />

        {/* Footer bar */}
        <div className="absolute bottom-0 left-0 right-0 h-12 flex items-center justify-between px-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <span className={`font-mono text-sm font-medium transition-colors duration-200 ${counterColor}`}>
            {chars} / {limit}
          </span>

          {/* Progress bar */}
          <div className="flex-1 mx-4 h-[3px] bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-150 ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Clear button */}
          {chars > 0 && (
            <button
              onClick={handleClear}
              className="font-mono text-xs text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              clear
            </button>
          )}
        </div>
      </div>

      {/* Hint text */}
      <p className={`mt-1.5 font-mono text-xs min-h-3 transition-colors duration-200 ${hintColor}`}>
        {isOver
          ? "Character limit reached"
          : isNear
          ? `${remaining} character${remaining !== 1 ? "s" : ""} remaining`
          : chars > 0
          ? `${remaining} characters remaining`
          : ""}
      </p>
    </div>
  );
}

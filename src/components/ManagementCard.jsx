import { FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { currencyFormatter } from "../../helpers";

const ManagementCard = ({
  title,
  icon: Icon,
  items,
  onClick,
  route,
  header,
  header1,
  headerValue,
  header1Value,
  tableHeader,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (route) {
      navigate(route);
    }
  };

  const formatDisplayValue = (value) => {
    if (typeof value === "string") {
      // Capitalize the first letter of each word
      return value.replace(/\b\w/g, (char) => char.toUpperCase());
    }
    return value;
  };

  // Helper function to get value from item using headerValue
  const getItemValue = (item, field) => {
    if (!field || !item) return "";

    // Handle nested properties (e.g., "user.name")
    if (field.includes(".")) {
      return field.split(".").reduce((obj, key) => obj?.[key], item) || "";
    }

    return item[field] || "";
  };

  // Helper function to get display name from item
  const getItemName = (item) => {
    return (
      item?.name ||
      item?.description ||
      item?.Hostel_Name ||
      item?.Customer_Name ||
      item?.Item_Name ||
      item?.Category_Name ||
      item?.customer?.Customer_Name ||
      item?.Production_Date ||
      item?.Transaction_Date ||
      ""
    );
  };

  // Helper function to determine status color
  const getStatusColor = (status) => {
    const statusValue = String(status).toLowerCase();

    if (statusValue === "inactive" || statusValue === "expired") {
      return "text-red-600 bg-red-50";
    } else if (
      statusValue === "completed" ||
      statusValue === "active" ||
      statusValue === "received" ||
      statusValue === "paid"
    ) {
      return "text-green-600 bg-green-50";
    } else {
      return "text-yellow-600 bg-yellow-50";
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-all hover:border-sky-200 group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-sky-50 text-sky-600 group-hover:bg-sky-100 transition-colors">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            <p className="text-xs text-slate-400">Total: {items?.length}</p>
          </div>
        </div>
        <FiArrowRight className="w-5 h-5 text-slate-400 group-hover:text-sky-600 transition-colors" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 text-left">
                {tableHeader ? tableHeader : "Name"}
              </th>
              {header1 && (
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">
                  {header1}
                </th>
              )}
              <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">
                {header}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 3).map((item) => (
              <tr
                key={item?.id}
                className="border-t border-slate-100 last:border-b-0"
              >
                <td className="py-3 font-medium text-slate-700">
                  {getItemName(item)}
                </td>
                {header1 && (
                  <td className="py-3 font-medium text-slate-700 text-right">
                    {header1 === "Status" ? (
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(
                          getItemValue(item, header1Value)
                        )}`}
                      >
                        {formatDisplayValue(getItemValue(item, header1Value))}
                      </span>
                    ) : header1 === "Price" || header1 === "Amount" ? (
                      currencyFormatter.format(
                        getItemValue(item, header1Value) || 0
                      )
                    ) : (
                      getItemValue(item, header1Value)
                    )}
                  </td>
                )}
                <td className="py-3 font-medium text-slate-700 text-right">
                  {header === "Status" ? (
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(
                        getItemValue(item, headerValue)
                      )}`}
                    >
                      {formatDisplayValue(getItemValue(item, headerValue))}
                    </span>
                  ) : header === "Price" || header === "Amount" ? (
                    currencyFormatter.format(
                      getItemValue(item, headerValue) || 0
                    )
                  ) : (
                    getItemValue(item, headerValue)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {items.length > 3 && (
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs text-sky-600 font-medium text-center group-hover:text-sky-700">
            View all {items.length} {title.toLowerCase()} →
          </p>
        </div>
      )}
    </div>
  );
};

export default ManagementCard;

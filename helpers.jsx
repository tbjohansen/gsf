import moment from "moment/moment";

/**
 * Formats a date object or string to the format of year-month-date.
 * @param date
 * @returns {string}
 */
export const formatDateForDb = (date) => {
  if (typeof date === "string") date = new Date(date);
  return moment(date).format("YYYY-MM-DD");
};

/**
 * Formats a date object or string to the format of year-month-date hour:minute:second.
 * @param date
 * @returns {string}
 */
export const formatDateTimeForDb = (date) => {
  if (typeof date === "string") date = new Date(date);
  return moment(date).format("YYYY-MM-DD HH:mm:ss");
};

export const formatDate = (date, format = "YYYY-MM-DD") => {
  if (typeof date === "string") date = new Date(date);
  return moment(date).format(format);
};

/**
 * Formats a date object or string to the format of hour:minute:second.
 * @param date
 * @returns {string}
 */
export const formatTimeForDb = (date) => {
  if (typeof date === "string") date = new Date(date);
  return moment(date).format("HH:mm:ss");
};

/**
 * Formats a date object or string to the format of year-month.
 * @param date
 * @returns {string}
 */
export const formatDateForYearAndMonth = (date) => {
  if (typeof date === "string") date = new Date(date);
  return moment(date).format("YYYY-MM");
};

/**
 * Formats a date object or string to the format of "YYYY Month".
 * @param date
 * @returns {string}
 */
export const formatDateForYearAndMonthName = (date) => {
  if (typeof date === "string") date = new Date(date);
  return moment(date).format("YYYY MMM");
};

/**
 * Formats a date object or string to the format of "YYYY".
 * @param date
 * @returns {string}
 */
export const formatDateForYearName = (date) => {
  if (typeof date === "string") date = new Date(date);
  return moment(date).format("YYYY");
};

/**
 * Returns an array of dates between two dates.
 * @param startDate
 * @param endDate
 * @returns {Array}
 */
export const getDaysBetweenDates = (startDate, endDate) => {
  let now = startDate.clone(),
    dates = [];

  while (now.isSameOrBefore(endDate)) {
    dates.push(now.format("YYYY-MM-DD"));
    now.add(1, "days");
  }

  return dates;
};

/**
 * Return number of days between today and provided date
 *
 */

export const getNumberOfDays = (targetDate) => {
  // Today's date
  const today = new Date();

  const theDate = new Date(targetDate);

  // Difference in days
  const difference = Math.floor((today - theDate) / (1000 * 60 * 60 * 24));
  return difference + " days";
};

/**
 * Capitalizes each first letter of each word in a `text`.
 * @param text {String}
 * @returns {String}
 */
export const capitalize = (text) => {
  text = text || "";
  if (typeof text === "string") {
    return text
      .split(" ")
      .map((e) => e.charAt(0).toUpperCase() + e.substr(1).toLowerCase())
      .join(" ");
  }
  return "";
};

export const formatter = new Intl.NumberFormat("en-US");

export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "TZS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const validatePhoneNumber = (phoneNumber) => {
    // Check if the input contains only digits
    if (!/^\d+$/.test(phoneNumber)) {
        return false;
    }
    
    // Check if the number has exactly 10 characters
    if (phoneNumber.length !== 10) {
        return false;
    }
    
    // Check if it starts with 0
    if (phoneNumber.charAt(0) !== '0') {
        return false;
    }
    
    // Check if the second digit is 5, 6, or 7
    const secondDigit = phoneNumber.charAt(1);
    if (secondDigit !== '5' && secondDigit !== '6' && secondDigit !== '7') {
        return false;
    }
    
    return true;
}

export const validPhoneNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') return false;
  
  return phoneNumber.length === 10 && 
    ["05", "06", "07"].includes(phoneNumber.slice(0, 2));
}

export function removeUnderscore(str) {
  if (!str) return "";
  return str.replace(/_/g, " ");
}

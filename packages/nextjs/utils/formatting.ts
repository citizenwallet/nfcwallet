export const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatUrl = (url: string) => {
  return `${url.slice(0, 26)}...${url.slice(-4)}`;
};

export const formatCurrency = (value: string, allowDecimals: boolean = true) => {
  // Remove all non-digit or non-decimal point characters
  value = value.replace(/[^0-9.]/g, "");

  // Split the value into whole number and decimal parts
  const parts = value.split(".");

  // If there's a decimal part and decimals are allowed
  if (parts.length > 1 && allowDecimals) {
    // Limit the decimal part to two digits
    parts[1] = parts[1].substring(0, 2);

    // Join the parts back together
    value = parts[0] + "." + parts[1];
  } else {
    value = parts[0];
  }

  return value;
};

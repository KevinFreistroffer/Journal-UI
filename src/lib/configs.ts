const ENV = process.env.NODE_ENV;

if (
  !process.env.NEXT_PUBLIC_API_URL_DEV ||
  !process.env.NEXT_PUBLIC_API_URL_PROD
) {
  throw new Error("Environment variables for API URLs are not defined.");
}

const API_URL =
  ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL_PROD
    : process.env.NEXT_PUBLIC_API_URL_DEV;
console.log(API_URL)
export const Config = {
  API_URL,
  ENV,
};

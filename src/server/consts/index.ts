export const ADMIN = "admin";
export const APP_INSTALLED = "app_installed";
export const WRONG_INFO = "WRONG_INFO";
export const USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS";
export const LOCAL_PATH = process.env.NODE_ENV === "production" 
  ? "https://awesome-templates.dev/"
  : "http://localhost:3000/";
export enum APILevel {
  BASIC = "BASIC",
  MEDIUM = "MEDIUM",
  ADVANCED = "ADVANCED",
}

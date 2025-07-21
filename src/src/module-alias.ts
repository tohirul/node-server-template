import { addAliases } from "module-alias";
import path from "path";

addAliases({
  "@": path.join(__dirname),
  "@/app": path.join(__dirname, "app"),
  "@/config": path.join(__dirname, "config"),
  "@/core": path.join(__dirname, "core"),
  "@/database": path.join(__dirname, "database"),
  "@/routes": path.join(__dirname, "routes"),
});

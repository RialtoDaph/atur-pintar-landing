import { Navigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminPanel() {
  return <Navigate to={createPageUrl("AdminUsers")} replace />;
}
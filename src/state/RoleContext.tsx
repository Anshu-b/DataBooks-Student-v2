import { createContext, useContext, useState} from "react";
import type {ReactNode} from "react";

type Role = "student" | "teacher" | null;

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  isTeacher: boolean;
  isStudent: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        isTeacher: role === "teacher",
        isStudent: role === "student",
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within RoleProvider");
  }
  return context;
}

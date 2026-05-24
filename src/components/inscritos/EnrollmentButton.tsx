"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { EnrollmentModal } from "./EnrollmentModal";

export function EnrollmentButton({ idLead, statusLead }: { idLead: string, statusLead: string }) {
  const [isOpen, setIsOpen] = useState(false);

  if (statusLead === "Inscrito") {
    return (
      <div className="mt-6 flex items-center justify-center p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl font-medium">
        <GraduationCap className="w-5 h-5 mr-2" />
        Este prospecto ya está inscrito
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mt-6 w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-sm"
      >
        <GraduationCap className="w-5 h-5 mr-2" />
        Inscribir Prospecto
      </button>

      {isOpen && (
        <EnrollmentModal
          idLead={idLead}
          onClose={() => setIsOpen(false)}
          onSuccess={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

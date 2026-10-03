"use client";

import { LayoutGrid, List } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function ViewToggle({ currentView }: { currentView: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleToggle = (view: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
      <button 
        type="button"
        onClick={() => handleToggle("grid")}
        className={`p-2 rounded-lg transition-colors flex items-center justify-center ${currentView === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        title="Vista de Tarjetas"
      >
        <LayoutGrid className="w-5 h-5" />
      </button>
      <button 
        type="button"
        onClick={() => handleToggle("list")}
        className={`p-2 rounded-lg transition-colors flex items-center justify-center ${currentView === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        title="Vista de Lista"
      >
        <List className="w-5 h-5" />
      </button>
    </div>
  );
}

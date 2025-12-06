import type { ReactElement } from "react";
import { Link } from "react-router";
type SidebarItemProps = {
    icon: ReactElement;
    label: string;
    active: boolean;
    path: string;
}

function SidebarItem({ icon: IconElement, label, active, path }: SidebarItemProps){
  return (
  <Link
    to={ path }
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
      active 
        ? 'bg-indigo-50 text-indigo-700 font-medium' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    {IconElement}
    <span>{label}</span>
  </Link>
)}

export default SidebarItem;

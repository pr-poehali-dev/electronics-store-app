import Icon from "@/components/ui/icon";
import { Page } from "@/lib/constants";

export interface Crumb {
  label: string;
  page?: Page;
}

interface Props {
  crumbs: Crumb[];
  onNavigate: (p: Page) => void;
}

export default function Breadcrumbs({ crumbs, onNavigate }: Props) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5 flex-wrap">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <Icon name="ChevronRight" size={12} className="opacity-40 shrink-0" />}
            {isLast || !crumb.page ? (
              <span className={isLast ? "text-white font-medium truncate max-w-[200px]" : ""}>{crumb.label}</span>
            ) : (
              <button
                onClick={() => onNavigate(crumb.page!)}
                className="hover:text-white transition-colors hover:underline underline-offset-2 whitespace-nowrap">
                {crumb.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}

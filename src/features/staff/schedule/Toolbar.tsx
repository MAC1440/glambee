
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ToolbarProps, View } from "react-big-calendar";

export function CustomToolbar(toolbar: ToolbarProps) {
  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  const goToCurrent = () => {
    toolbar.onNavigate('TODAY');
  };

  const view = (view: View) => {
    toolbar.onView(view);
  };

  const views: {name: string, view: View}[] = [
    { name: 'Day', view: 'day' },
    { name: 'Week', view: 'week' },
  ];

  return (
    <div className="rbc-toolbar flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={goToBack}><ChevronLeft className="h-4 w-4" /></Button>
        <Button variant="outline" onClick={goToCurrent}>Today</Button>
        <Button variant="outline" size="icon" onClick={goToNext}><ChevronRight className="h-4 w-4" /></Button>
      </div>
      <span className="rbc-toolbar-label order-first md:order-none">{toolbar.label}</span>
      <div className="rbc-btn-group">
        {views.map((v) => (
          <Button
            key={v.view}
            variant={toolbar.view === v.view ? 'default' : 'outline'}
            onClick={() => view(v.view)}
          >
            {v.name}
          </Button>
        ))}
      </div>
    </div>
  );
}

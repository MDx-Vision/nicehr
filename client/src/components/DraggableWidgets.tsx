import { useState, ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface Widget {
  id: string;
  content: ReactNode;
  visible: boolean;
}

interface SortableWidgetProps {
  id: string;
  children: ReactNode;
  isDragEnabled: boolean;
}

function SortableWidget({ id, children, isDragEnabled }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isDragEnabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative",
        isDragging && "opacity-50 ring-2 ring-primary rounded-lg"
      )}
      data-testid={`widget-${id}`}
    >
      {isDragEnabled && (
        <button
          className="absolute top-2 left-2 z-10 p-1 rounded bg-muted/80 hover:bg-muted cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
          data-testid={`drag-handle-${id}`}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
      {children}
    </div>
  );
}

interface DraggableWidgetsProps {
  widgets: Widget[];
  onReorder: (newOrder: string[]) => void;
  isDragEnabled?: boolean;
  className?: string;
  columns?: 1 | 2;
}

export function DraggableWidgets({
  widgets,
  onReorder,
  isDragEnabled = false,
  className,
  columns = 2,
}: DraggableWidgetsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const visibleWidgets = widgets.filter((w) => w.visible);
  const widgetIds = visibleWidgets.map((w) => w.id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = widgetIds.indexOf(active.id as string);
      const newIndex = widgetIds.indexOf(over.id as string);
      const newOrder = arrayMove(widgetIds, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={widgetIds} strategy={rectSortingStrategy}>
        <div
          className={cn(
            "grid gap-4",
            columns === 2 ? "lg:grid-cols-2" : "grid-cols-1",
            className
          )}
        >
          {visibleWidgets.map((widget) => (
            <SortableWidget
              key={widget.id}
              id={widget.id}
              isDragEnabled={isDragEnabled}
            >
              {widget.content}
            </SortableWidget>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

// Hook for managing widget order with localStorage persistence
export function useWidgetOrder(
  defaultOrder: string[],
  storageKey: string = "dashboard-widget-order"
) {
  const [order, setOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate that all default items are present
        const hasAllItems = defaultOrder.every((id) => parsed.includes(id));
        if (hasAllItems) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error loading widget order:", e);
    }
    return defaultOrder;
  });

  const updateOrder = (newOrder: string[]) => {
    setOrder(newOrder);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newOrder));
    } catch (e) {
      console.error("Error saving widget order:", e);
    }
  };

  const resetOrder = () => {
    setOrder(defaultOrder);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.error("Error resetting widget order:", e);
    }
  };

  return { order, updateOrder, resetOrder };
}

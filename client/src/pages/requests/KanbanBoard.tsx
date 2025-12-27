import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { api, ApiError } from '@/lib/api';
import { MaintenanceRequest, RequestStatus, STATUS_LABELS } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, User, Wrench, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';

const STATUSES: RequestStatus[] = ['NEW', 'IN_PROGRESS', 'REPAIRED', 'SCRAP'];

const statusColors: Record<RequestStatus, string> = {
  NEW: 'bg-blue-500',
  IN_PROGRESS: 'bg-yellow-500',
  REPAIRED: 'bg-green-500',
  SCRAP: 'bg-red-500',
};

interface DraggableCardProps {
  request: MaintenanceRequest;
  onClick: () => void;
}

function DraggableCard({ request, onClick }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: request.id,
    data: { request },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(isDragging && 'opacity-50')}
    >
      <Card 
        className="mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow border-l-4"
        style={{ borderLeftColor: `hsl(var(--status-${request.status.toLowerCase().replace('_', '-')}))` }}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-semibold line-clamp-2">
              {request.subject}
            </CardTitle>
            <Badge 
              variant={request.request_type === 'PREVENTIVE' ? 'default' : 'destructive'}
              className="text-xs shrink-0"
            >
              {request.request_type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Wrench className="h-3 w-3" />
            <span className="truncate">{request.equipment_name || `#${request.equipment}`}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(request.scheduled_date), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>{request.duration}</span>
          </div>
          {request.technician_name && (
            <div className="flex items-center gap-2">
              <User className="h-3 w-3" />
              <span className="truncate">{request.technician_name}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface DroppableColumnProps {
  status: RequestStatus;
  requests: MaintenanceRequest[];
  onCardClick: (id: number) => void;
}

function DroppableColumn({ status, requests, onCardClick }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { status },
  });

  const statusColors: Record<RequestStatus, string> = {
    NEW: 'bg-blue-500',
    IN_PROGRESS: 'bg-yellow-500',
    REPAIRED: 'bg-green-500',
    SCRAP: 'bg-red-500',
  };

  return (
    <div className="flex flex-col bg-muted/30 rounded-lg p-4 min-h-[500px]">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b">
        <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
        <h3 className="font-semibold text-sm uppercase tracking-wide">
          {STATUS_LABELS[status]}
        </h3>
        <Badge variant="secondary" className="ml-auto">
          {requests.length}
        </Badge>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 overflow-y-auto space-y-3 scrollbar-thin rounded-lg transition-colors p-2',
          isOver && 'bg-accent/50 ring-2 ring-primary ring-offset-2'
        )}
      >
        {requests.map((request) => (
          <DraggableCard
            key={request.id}
            request={request}
            onClick={() => onCardClick(request.id)}
          />
        ))}

        {requests.length === 0 && (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
            Drop requests here
          </div>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [showScrapWarning, setShowScrapWarning] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{ id: number; status: RequestStatus } | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['requests-kanban'],
    queryFn: () => api.getRequests({ page: 1 }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: RequestStatus }) =>
      api.updateRequestStatus(id, status),
    onSuccess: (_, variables) => {
      toast({ 
        title: 'Status updated',
        description: `Request moved to ${STATUS_LABELS[variables.status]}`
      });
      queryClient.invalidateQueries({ queryKey: ['requests-kanban'] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      setShowScrapWarning(false);
      setPendingUpdate(null);
    },
    onError: (error: ApiError) => {
      toast({
        title: 'Failed to update status',
        description: error.getAllErrors().join(', '),
        variant: 'destructive',
      });
      refetch(); // Revert the optimistic update
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const requests = data?.results || [];
  const requestsByStatus = STATUSES.reduce((acc, status) => {
    acc[status] = requests.filter((req) => req.status === status);
    return acc;
  }, {} as Record<RequestStatus, MaintenanceRequest[]>);

  const activeRequest = activeId
    ? requests.find((req) => req.id === activeId)
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const requestId = active.id as number;
    const newStatus = over.id as RequestStatus;
    const request = requests.find((req) => req.id === requestId);

    if (!request || request.status === newStatus) return;

    const validTransitions: Record<RequestStatus, RequestStatus[]> = {
      NEW: ['IN_PROGRESS'],
      IN_PROGRESS: ['REPAIRED', 'SCRAP'],
      REPAIRED: ['SCRAP'],
      SCRAP: [],
    };

    if (!validTransitions[request.status].includes(newStatus)) {
      toast({
        title: 'Invalid transition',
        description: `Cannot move from ${STATUS_LABELS[request.status]} to ${STATUS_LABELS[newStatus]}`,
        variant: 'destructive',
      });
      return;
    }

    if (newStatus === 'SCRAP') {
      setPendingUpdate({ id: requestId, status: newStatus });
      setShowScrapWarning(true);
      return;
    }

    updateStatusMutation.mutate({ id: requestId, status: newStatus });
  };

  const confirmScrap = () => {
    if (pendingUpdate) {
      updateStatusMutation.mutate(pendingUpdate);
    }
  };

  if (isLoading) return <LoadingState message="Loading kanban board..." />;
  if (error) return <ErrorState retry={() => refetch()} />;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Maintenance Kanban Board"
        description="Drag and drop requests to update their status"
        actions={
          <Button onClick={() => navigate('/requests/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
            {STATUSES.map((status) => (
              <DroppableColumn
                key={status}
                status={status}
                requests={requestsByStatus[status]}
                onCardClick={(id) => navigate(`/requests/${id}`)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeRequest && (
              <div className="opacity-90 rotate-3 scale-105">
                <Card 
                  className="cursor-grabbing shadow-xl border-l-4"
                  style={{ borderLeftColor: `hsl(var(--status-${activeRequest.status.toLowerCase().replace('_', '-')}))` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold line-clamp-2">
                        {activeRequest.subject}
                      </CardTitle>
                      <Badge 
                        variant={activeRequest.request_type === 'PREVENTIVE' ? 'default' : 'destructive'}
                        className="text-xs shrink-0"
                      >
                        {activeRequest.request_type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-3 w-3" />
                      <span className="truncate">{activeRequest.equipment_name || `#${activeRequest.equipment}`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(activeRequest.scheduled_date), 'MMM d, yyyy')}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      <ConfirmDialog
        open={showScrapWarning}
        onOpenChange={setShowScrapWarning}
        title="Mark as Scrap"
        description="Marking this request as SCRAP will automatically set the associated equipment as UNUSABLE. This action cannot be reversed. Are you sure?"
        confirmLabel="Mark as Scrap"
        variant="warning"
        onConfirm={confirmScrap}
        loading={updateStatusMutation.isPending}
      />
    </div>
  );
}

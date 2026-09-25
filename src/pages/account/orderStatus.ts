import type React from 'react';
import { Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';

export const statusIcon: Record<string, React.ElementType> = {
  processing: Clock,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

export const statusVariant: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  processing: 'warning',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'destructive',
};

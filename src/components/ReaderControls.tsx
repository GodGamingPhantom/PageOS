'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ReaderControlsProps = {
    onPrev: () => void;
    onNext: () => void;
    isFirst: boolean;
    isLast: boolean;
};

const ReaderControls = ({ onPrev, onNext, isFirst, isLast }: ReaderControlsProps) => (
  <div className="flex items-center gap-4">
    <Button onClick={onPrev} disabled={isFirst} size="icon" variant="outline" className="h-12 w-12 rounded-full">
      <ChevronLeft className="h-6 w-6" />
    </Button>
    <Button onClick={onNext} disabled={isLast} size="icon" variant="outline" className="h-12 w-12 rounded-full">
      <ChevronRight className="h-6 w-6" />
    </Button>
  </div>
);

export default ReaderControls;

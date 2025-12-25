'use client';

import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    hoverEffect?: boolean;
}

export default function GlassCard({
    children,
    className,
    hoverEffect = false,
    ...props
}: GlassCardProps) {
    return (
        <div
            className={cn(
                "bg-surface border border-white/5 rounded-2xl p-6",
                hoverEffect && "hover:border-primary/30 transition-colors cursor-pointer",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

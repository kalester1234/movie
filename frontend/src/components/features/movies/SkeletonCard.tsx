import { cn } from '@/utils/helpers'

interface SkeletonCardProps {
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'w-[140px]',
  md: 'w-[185px]',
  lg: 'w-[240px]',
}

export default function SkeletonCard({ size = 'md' }: SkeletonCardProps) {
  return (
    <div className={cn('shrink-0 animate-pulse', sizeMap[size])}>
      <div className="aspect-[2/3] rounded-xl bg-[--color-card]" />
      <div className="mt-2.5 space-y-1.5 px-0.5">
        <div className="h-3.5 rounded bg-[--color-card] w-3/4" />
        <div className="h-3 rounded bg-[--color-card] w-1/3" />
      </div>
    </div>
  )
}

export function SkeletonHero() {
  return (
    <div className="relative w-full h-[75vh] min-h-[500px] bg-[--color-card] animate-pulse">
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 lg:p-24 space-y-4">
        <div className="h-4 w-24 rounded bg-[--color-surface]" />
        <div className="h-12 w-80 rounded bg-[--color-surface]" />
        <div className="h-4 w-96 rounded bg-[--color-surface]" />
        <div className="h-4 w-72 rounded bg-[--color-surface]" />
        <div className="flex gap-3 mt-4">
          <div className="h-12 w-36 rounded-xl bg-[--color-surface]" />
          <div className="h-12 w-36 rounded-xl bg-[--color-surface]" />
        </div>
      </div>
    </div>
  )
}

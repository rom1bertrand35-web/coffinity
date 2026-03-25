import React from 'react';

export function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="bento-card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full skeleton" />
            <div className="flex flex-col gap-2">
              <div className="w-24 h-3 skeleton" />
              <div className="w-16 h-2 skeleton" />
            </div>
          </div>
          <div className="h-40 w-full skeleton rounded-2xl" />
          <div className="flex flex-col gap-2">
            <div className="w-full h-3 skeleton" />
            <div className="w-2/3 h-3 skeleton" />
          </div>
          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <div className="w-12 h-6 skeleton rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 pt-10">
      <div className="flex justify-between items-start">
        <div className="w-32 h-8 skeleton" />
        <div className="w-8 h-8 skeleton rounded-full" />
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-full skeleton" />
        <div className="w-40 h-6 skeleton" />
        <div className="w-24 h-4 skeleton rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="h-20 skeleton rounded-3xl" />
        <div className="h-20 skeleton rounded-3xl" />
        <div className="h-20 skeleton rounded-3xl" />
      </div>
      <div className="flex flex-col gap-4">
        <div className="w-32 h-6 skeleton" />
        <div className="h-16 w-full skeleton rounded-2xl" />
        <div className="h-16 w-full skeleton rounded-2xl" />
      </div>
    </div>
  );
}

export function DiscoverSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="w-full h-12 skeleton rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-48 skeleton rounded-[2rem]" />
        ))}
      </div>
    </div>
  );
}

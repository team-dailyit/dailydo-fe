'use client';

import Image from 'next/image';

import { FadeIn } from '@/shared/ui/fade-in';
import { SectionHeading } from '@/shared/ui/section-heading';

const rows = [
  { start: 1, count: 10 },
  { start: 11, count: 10 },
  { start: 21, count: 10 },
  { start: 31, count: 10 },
];

export const LandingCollectionSection = () => {
  return (
    <section className="overflow-hidden bg-green-200 py-16">
      <FadeIn>
        <SectionHeading
          label="마이컬렉션"
          title="일상 속 미션이 컬렉션이 되다"
          description={
            <>
              여러 미션들을 수행하며
              <br />
              컬렉션을 모으는 재미를 느껴보세요.
            </>
          }
        />
      </FadeIn>

      {/* 대표 컬렉션 배지 */}
      <FadeIn delay={150} className="relative mt-12 flex flex-col items-center">
        <span className="z-10 -mb-3 rounded-full bg-white px-3 py-1 text-sm font-semibold tracking-tight text-green-700 shadow">
          나의 대표 컬렉션
        </span>
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-green-500">
          <div className="relative h-30 w-30 rounded-full border-6 border-green-400 bg-green-100">
            <Image
              src="/landing/collections/deco-0.png"
              alt=""
              fill
              className="object-contain"
              sizes="120px"
            />
          </div>
        </div>
        <span className="z-10 -mt-4 rounded-full bg-green-600 px-3 py-1 text-sm font-semibold tracking-tight text-white shadow">
          무지개를 손에 넣은 자
        </span>
      </FadeIn>

      <div className="mt-12 flex flex-col gap-4">
        {rows.map(({ start, count }, index) => {
          const isEven = index % 2 === 0;
          const images = Array.from({ length: count }, (_, i) => start + i);

          return (
            <div key={start} className="flex overflow-hidden">
              <div
                className={`flex shrink-0 items-center gap-15 ${isEven ? 'animate-marquee-right' : 'animate-marquee-left'}`}
              >
                {[...images, ...images].map((num, i) => (
                  <Image
                    key={i}
                    src={`/landing/collections/deco-${num}.png`}
                    alt=""
                    width={80}
                    height={80}
                    sizes="240px"
                    className="h-20 w-20"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

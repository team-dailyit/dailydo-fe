import Image from 'next/image';

import { FadeIn } from '@/shared/ui/fade-in';
import { SectionHeading } from '@/shared/ui/section-heading';

export const LandingMylogSection = () => {
  return (
    <section className="bg-white px-5 pt-16 pb-50">
      <FadeIn>
        <SectionHeading
          align="left"
          label="마이로그"
          title={
            <>
              미션들을 수행하고
              <br />
              자유롭게 로그를 작성해보세요
            </>
          }
          description={
            <>
              미션을 진행하며 느낀 것들을 자유롭게 작성하세요.
              <br />
              다른 누구도 아닌, 오직 나를 위한 기록이에요.
            </>
          }
        />
      </FadeIn>

      <div className="relative mt-30 flex flex-col">
        <FadeIn delay={150} className="absolute -top-20">
          <Image
            src="/landing/decoration-1.png"
            alt=""
            width={120}
            height={120}
            className="h-30 w-30"
          />
        </FadeIn>
        <FadeIn delay={200} className="flex items-center justify-end">
          <Image
            src="/landing/bubble-1.png"
            alt=""
            width={180}
            height={70}
            className="h-17.5 w-45"
          />
        </FadeIn>
        <FadeIn delay={250} className="flex items-center">
          <Image
            src="/landing/bubble-2.png"
            alt=""
            width={220}
            height={70}
            className="h-17.5 w-55"
          />
        </FadeIn>
      </div>

      <div className="relative mt-10 h-80 w-80 rounded-2xl bg-gray-50">
        <FadeIn delay={300} className="absolute -top-10 -right-17.5">
          <Image
            src="/landing/decoration-2.png"
            alt=""
            width={120}
            height={120}
            className="h-30 w-30"
          />
        </FadeIn>
        <FadeIn
          delay={350}
          className="relative top-10 h-100 w-[80%] justify-self-center"
        >
          <Image
            src="/landing/mylog.png"
            alt=""
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 80vw"
          />
        </FadeIn>
      </div>
    </section>
  );
};

import React from "react";
import { skills } from "../components/utils/consts";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Deepak Kumar | Skills",
  description: "Deepak Kumar | Software Engineer | Node Js | React Js | Javascript",
  keywords: skills.join(","),
};

const Skills = () => {
  return (
    <div>
      <section className='relative not-prose scroll-mt-[72px]' id='skills'>
        <div className='absolute inset-0 pointer-events-none -z-[1]' aria-hidden='true'>
          <div className='absolute inset-0'></div>
        </div>
        <div className='relative mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-10 lg:py-12 text-default'>
          <div className='mb-8 md:mx-auto md:mb-12 text-center max-w-3xl'>
            <h2 className='font-bold leading-tighter tracking-tighter font-heading text-heading text-3xl md:text-4xl'>
              Technical Skills
            </h2>
          </div>

          <div id='wc309' className='wc-root relative mx-auto px-4 md:px-6 pb-6 m-0 text-default max-w-7xl bg-blue-50'>
            <div className='grid gap-3'>
              <div className='flex col-span-2 md:gap-16 '>
                <div className='tag-cloud flex justify-center flex-wrap gap-2 p-4 max-w-fit mx-auto'>
                  {skills.map((skill: any) => (
                    <button
                      key={skill}
                      className='tag px-2 py-1 rounded bg-neutral-200 text-neutral-focus text-md hover:bg-gray-300 transition duration-200 ease-in-out '
                      data-wc-key='ci-cd'>
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Skills;

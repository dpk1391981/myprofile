import React from "react";
import { skills } from "../components/utils/consts";

const Skills = () => {
  return (
    <div>
      <section className='relative not-prose scroll-mt-[72px]' id='about'>
        <div className='relative mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-10 lg:py-12 text-default '>
          <section className='relative md:-mt-[76px] not-prose ' id='about-hero'>
            <div className='absolute inset-0 pointer-events-none ' aria-hidden='true'></div>
            <div className='relative max-w-7xl mx-auto px-4 sm:px-6 pt-0 md:pt-[30px] pointer-events-none'>
              <div className='py-12 md:py-20 '>
                <div className='text-center pb-10 md:pb-16 max-w-5xl mx-auto'>
                  <div className='relative mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-10 lg:py-12 text-default'>
                    <div className='mb-8 md:mx-auto md:mb-12 text-center max-w-3xl'>
                      <h2 className='font-bold leading-tighter tracking-tighter font-heading text-heading text-3xl md:text-4xl'>
                        Technical Skills
                      </h2>
                    </div>

                    <div
                      id='wc309'
                      className='wc-root relative mx-auto px-4 md:px-6 pb-6 m-0 text-default max-w-7xl bg-blue-50'>
                      <div className='grid gap-3'>
                        <div className='flex col-span-2 md:gap-16 '>
                          <div className='tag-cloud flex justify-center flex-wrap gap-2 p-4 max-w-fit mx-auto'>
                            {skills.map((skill: any) => (
                              <button
                                key={skill}
                                className='tag px-2 py-1 rounded bg-neutral-200 text-neutral-focus text-md hover:bg-gray-300 transition duration-200 ease-in-out '>
                                {skill}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div></div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};

export default Skills;

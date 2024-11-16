"use client";
import type { Metadata } from "next";
import React from "react";
import SocailLinks from "./utils/SocailLinks";
import { totalExperianceYears } from "./utils/date";
import { NEXT_SEO_DEFAULT } from "@/app/seo_config";
import { IconCirclesRelation } from "@tabler/icons-react";

const AboutMeta = {
  ...NEXT_SEO_DEFAULT,
  ...{
    title: "Deepak Kumar | About",
    description:
      "Discover Deepak Kumar, a seasoned software engineer with a wealth of experience spanning over six years. Delve into his journey, where technical expertise meets a passion for innovation, as he continues to drive excellence in software development.",
    keywords: "JAVASCRIPT | FULL STACK | NODE JS | REACT JS | MYSQL | NOSQL | Deepak Kutniyal",
  },
};
export const metadata: Metadata = AboutMeta;

const openContactModal = () => {
  const myModalElement: HTMLDialogElement | null = document.getElementById("my_modal_1") as HTMLDialogElement | null;

  if (myModalElement) {
    myModalElement.showModal();
  } else {
    console.error("Element with ID 'my_modal_1' not found.");
  }
};

const About = () => {
  return (
    <section className='relative not-prose scroll-mt-[72px]' id='about'>
      <div className='relative mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-10 lg:py-12 text-default '>
        <section className='relative md:-mt-[76px] not-prose ' id='about-hero'>
          <div className='absolute inset-0 pointer-events-none ' aria-hidden='true'></div>
          <div className='relative max-w-7xl mx-auto px-4 sm:px-6 '>
            <div className='pt-0 md:pt-[76px] pointer-events-none'></div>
            <div className='py-12 md:py-20 '>
              <div className='text-center pb-10 md:pb-16 max-w-5xl mx-auto'>
                <h1
                  title='Deepak Kumar'
                  className='text-5xl md:text-6xl font-bold leading-tighter tracking-tighter mb-4 font-heading dark:text-gray-200'>
                  Deepak Kumar
                </h1>

                <p className='text-base  text-blue-700 font-bold tracking-wide uppercase mb-4'>
                  JavaScript | Full Stack | Node js | React js | Angular Js | MySql | NoSql
                </p>

                <div className='max-w-3xl mx-auto'>
                  <p className='text-xl text-muted mb-6 dark:text-slate-300 font-normal'>
                    Experienced Software Engineer with
                    <span className='text-blue-700 font-bold tracking-wide mb-4'> {totalExperianceYears()}</span>
                    of hands-on expertise, showcasing a unique combination of leadership skills, technical proficiency,
                    and strategic vision. Possesses a decade-long track record of successfully leading and developing
                    technology teams. Adept at delivering impactful solutions in the dynamic landscape of software
                    development.
                  </p>
                  <div className='flex flex-col-reverse max-w-xs sm:max-w-md m-auto gap-2'>
                    <div className='sm:w-full m-auto'>
                      <a
                        className='btn bg-blue-700 hover:bg-blue-700 text-white w-full text-lg sm:mb-0'
                        onClick={openContactModal}>
                        Contact me <IconCirclesRelation />
                      </a>
                    </div>
                    <div className=' m-auto text-blue-700'>
                      <SocailLinks />
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
  );
};

export default About;

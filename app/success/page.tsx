"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { IconArrowBackUp } from "@tabler/icons-react";

const page = () => {
  let router = useRouter();
  return (
    <section className='bg-white dark:bg-gray-900 '>
      <div className='py-8 lg:py-16 px-4 mx-auto max-w-screen-md '>
        <div id='experience-wrapper' className='topic-summar '>
          <div className='relative not-prose scroll-mt-[72px]' id='experience-details'>
            <div className='relative mx-auto px-4 md:px-6 py-8 md:py-10 lg:py-12 text-default max-w-6xl'>
              <div className='flex flex-col gap-8 md:gap-12'>
                <div className='md:py-4 md:self-center w-full'>
                  {" "}
                  <h2 className='mb-4 text-4xl tracking-tight font-extrabold text-center text-blue-700 dark:text-white'>
                    Thank you for reaching out to me!
                  </h2>
                  <p className='text-center p-4 font-bold text-lg'>Your inquiry has been successfully received.</p>
                  <div className='flex flex-col-reverse max-w-xs sm:max-w-md m-auto gap-2'>
                    <div className='sm:w-full m-auto'>
                      <a
                        className='btn btn-outline bg-blue-700 hover:bg-blue-700 text-white w-full text-lg sm:mb-0'
                        onClick={() => router.push("/")}>
                        Go back to home <IconArrowBackUp />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default page;

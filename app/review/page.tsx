import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import { IconBrandLinkedin } from "@tabler/icons-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Deepak Kumar | Review",
  description:
    "Deepak Kumar | Software Engineer | Node Js | React Js | Javascript | Review | References | Recommendations",
  keywords: "JAVASCRIPT | FULL STACK | NODE JS | REACT JS | MYSQL | NOSQL",
};

const page = () => {
  return (
    <div className='relative mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-10 lg:py-12 text-default '>
      <section className='relative not-prose scroll-mt-[72px]'>
        <div className='absolute inset-0 pointer-events-none -z-[1]' aria-hidden='true'>
          <div className='absolute inset-0'></div>
        </div>
        <div className='mb-8 md:mx-auto md:mb-12 text-center max-w-3xl'>
          <h2 className='font-bold leading-tighter tracking-tighter font-heading text-heading text-3xl md:text-4xl'>
            Recommendations
          </h2>
        </div>

        <section className='bg-gray-50 dark:bg-gray-800 mt-20'>
          <div className=' px-4 py-8 mx-auto text-center lg:py-10 lg:px-6'>
            <div className='carousel w-full'>
              <div id='slide1' className='carousel-item relative w-full'>
                <figure className='max-w-screen-md mx-auto'>
                  <svg
                    className='h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600'
                    viewBox='0 0 24 27'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z'
                      fill='currentColor'></path>
                  </svg>
                  <blockquote>
                    <p className='text-xl font-medium text-gray-900 md:text-2xl dark:text-white'>
                      "Hard Working, Intelligent, Committed, Sharp and an Excellent team player are just a couple of
                      words that can aptly describe Deepak. I worked with him for almost 3 years on the same project. He
                      is technically very sound , always ready to learn new things, accept new challenges and the best
                      part about him is that he always have simple solution to the complex problem which makes him stand
                      out from the crowd. His analytical skills are also great and I wish him all the best for the
                      future I know he will prove to be an asset for any organization he joins."
                    </p>
                  </blockquote>
                  <div className='flex items-center justify-center mt-6 space-x-3'>
                    <Image
                      src='/assets/images/amit.jpeg'
                      alt='Thumbnail image of Amit Saraswat'
                      title='Avatar Amit Saraswat'
                      className='avatar w-12 rounded-full'
                      width={50}
                      height={50}
                      loading='lazy'
                      decoding='async'
                    />
                    <div className='flex items-center divide-x-2 divide-gray-500 dark:divide-gray-700'>
                      <div className='pr-3 font-medium text-gray-900 dark:text-white'>Amit Saraswat</div>
                      <div className='pl-3 text-sm font-light text-gray-500 dark:text-gray-400'>
                        System Analyst at Instant Systems Inc
                      </div>
                    </div>
                    <Link href='https://www.linkedin.com/in/amitmsaraswat/' className='ml-2' target='_blank'>
                      <IconBrandLinkedin />
                    </Link>
                  </div>
                </figure>
                <div className='absolute flex justify-between transform -translate-y-1/2 left-2 right-2 top-1/2'>
                  <a href='#slide1'>{/* ❮ */}</a>
                  <a href='#slide2' className='btn btn-circle  sm:visible invisible'>
                    ❯
                  </a>
                </div>
              </div>
              <div id='slide2' className='carousel-item relative w-full'>
                <figure className='max-w-screen-md mx-auto'>
                  <svg
                    className='h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600'
                    viewBox='0 0 24 27'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z'
                      fill='currentColor'></path>
                  </svg>
                  <blockquote>
                    <p className='text-xl font-medium text-gray-900 md:text-3xl dark:text-white'>
                      "We did a lot together and Deepak is really very talented, he learns new technology quickly and is
                      very hard working. I felt very good after working with him, he is a person of very good
                      personality."
                    </p>
                  </blockquote>
                  <div className='flex items-center justify-center mt-6 space-x-3'>
                    <Image
                      src='/assets/images/maya.jpeg'
                      alt='Thumbnail image of Maya Tripathi'
                      title='Avatar Maya Tripathi'
                      className='avatar w-12 rounded-full'
                      width={50}
                      height={50}
                      loading='lazy'
                      decoding='async'
                    />
                    <div className='flex items-center divide-x-2 divide-gray-500 dark:divide-gray-700'>
                      <div className='pr-3 font-medium text-gray-900 dark:text-white'>Maya Tripathi</div>
                      <div className='pl-3 text-sm font-light text-gray-500 dark:text-gray-400'>
                        Full-Stack Developer at Teamwork Arts
                      </div>
                    </div>
                    <Link href='https://www.linkedin.com/in/maya-tripathi-34a16b2b/' className='ml-2' target='_blank'>
                      <IconBrandLinkedin />
                    </Link>
                  </div>
                </figure>
                <div className='absolute flex justify-between transform -translate-y-1/2 left-2 right-2 top-1/2'>
                  <a href='#slide1' className='btn btn-circle sm:visible invisible'>
                    ❮
                  </a>
                  {/* <a href='#slide2' className='btn btn-circle  sm:visible invisible'>
                    ❯
                  </a> */}
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
};

export default page;

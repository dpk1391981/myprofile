import React from "react";
import Image from "next/image";

const Education = () => {
  return (
    <>
      <section className='relative not-prose scroll-mt-[72px] ' id='education'>
        <div className='absolute inset-0 pointer-events-none -z-[1]' aria-hidden='true'>
          <div className='absolute inset-0'></div>
        </div>
        <div className='relative mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-10 lg:py-12 text-default '>
          <div className='mb-8 md:mx-auto md:mb-12 text-center max-w-3xl'>
            <h2 className='font-bold leading-tighter tracking-tighter font-heading text-heading text-3xl md:text-4xl'>
              Education
            </h2>
          </div>
          <div className='relative mx-auto  pb-6 m-0 text-default max-w-7xl px-4 md:px-6 py-8 md:py-10 lg:py-12 bg-blue-50'>
            <div className='grid lg:grid-cols-2 md:grid-cols-2'>
              <div className='flex'>
                <div className='flex'>
                  <div className='flex flex-col items-center mr-4 rtl:mr-0 rtl:ml-4'>
                    <div>
                      <div className='flex items-center justify-center'>
                        <Image
                          src='/assets/projects/jain-deemed.png'
                          alt='alt'
                          decoding='async'
                          loading='lazy'
                          width='50'
                          height='50'
                        />
                      </div>
                    </div>
                  </div>
                  <div className='pt-1 pb-8'>
                    <p className='text-xl font-bold'>
                      Post Graduate Computer Application
                      <br />
                      <span className='text-muted'>Artificial Intellegence &Machine Learning</span>
                      <br />
                      <span className='font-normal'>
                        University Grants Commission (UGC)
                        <br />
                      </span>
                      <span className='text-sm font-normal'>(Expected May 2024)</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className='flex'>
                <div className='flex'>
                  <div className='flex flex-col items-center mr-4 rtl:mr-0 rtl:ml-4'>
                    <div>
                      <div className='flex items-center justify-center'>
                        <Image
                          src='/assets/projects/du.png'
                          alt='alt'
                          decoding='async'
                          loading='lazy'
                          width='50'
                          height='50'
                        />
                      </div>
                    </div>
                  </div>
                  <div className='pt-1 pb-8'>
                    <p className='text-xl font-bold'>
                      Graduate University of Delhi (DU)
                      <br />
                      <span className='font-normal'>Bachelor in commerce</span>
                      <br />
                      <span className='text-sm font-normal'>June 2013 - June 2017</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className='flex'>
                <div className='flex'>
                  <div className='flex flex-col items-center mr-4 rtl:mr-0 rtl:ml-4'>
                    <div>
                      <div className='flex items-center justify-center'>
                        <Image
                          src='/assets/projects/bte.jpeg'
                          alt='alt'
                          decoding='async'
                          loading='lazy'
                          width='50'
                          height='50'
                        />
                      </div>
                    </div>
                  </div>
                  <div className='pt-1 pb-8'>
                    <p className='text-xl font-bold'>
                      Diploma/ Jr Engineering
                      <br />
                      <span className='text-muted'>Computer Science/IT</span>
                      <br />
                      <span className='font-normal'>Board of Technical Education (BTE)</span>
                      <br />
                      <span className='text-sm font-normal'>May 2023 - May 2016</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className='flex'>
                <div className='flex'>
                  <div className='flex flex-col items-center mr-4 rtl:mr-0 rtl:ml-4'>
                    <div>
                      <div className='flex items-center justify-center'>
                        <Image
                          src='/assets/projects/aws.png'
                          alt='alt'
                          decoding='async'
                          loading='lazy'
                          width='50'
                          height='50'
                        />
                      </div>
                    </div>
                  </div>
                  <div className='pt-1 pb-8'>
                    <p className='text-xl font-bold'>
                      AWS Certified Solutions Architect Associate (Udemy)
                      <br />
                      <span className='font-normal'>Ultimate AWS Certified Solutions Architect Associate SAA-C03</span>
                      <br />
                      <span className='text-sm font-normal'>oct 2023 - nov 2023</span>
                    </p>
                    <footer className='mt-5'>
                      <ul className='text-sm'>
                        <li className='font-medium w-20 tag px-2 py-1 rounded bg-neutral-200 text-neutral-focus text-md hover:bg-gray-300 transition duration-200 ease-in-out '>
                          <a
                            href='https://www.udemy.com/certificate/UC-25c5f6ca-9233-45dd-97e0-1c7571ff91a6/'
                            target='_blank'>
                            certificate
                          </a>
                        </li>
                      </ul>
                    </footer>
                  </div>
                </div>
              </div>
              <div className='flex'>
                <div className='flex'>
                  <div className='flex flex-col items-center mr-4 rtl:mr-0 rtl:ml-4'>
                    <div>
                      <div className='flex items-center justify-center'>
                        <Image
                          src='/assets/projects/mern.png'
                          alt='alt'
                          decoding='async'
                          loading='lazy'
                          width='50'
                          height='50'
                        />
                      </div>
                    </div>
                  </div>
                  <div className='pt-1 pb-8'>
                    <p className='text-xl font-bold'>
                      MERN Stack (Udemy)
                      <br />
                      <span className='font-normal'>MERN Stack Front To Back: Full Stack React, Redux & Node.js </span>
                      <br />
                      <span className='text-sm font-normal'>sep 2021 - nov 2021</span>
                    </p>
                    <footer className='mt-5'>
                      <ul className='text-sm'>
                        <li className='font-medium w-20 tag px-2 py-1 rounded bg-neutral-200 text-neutral-focus text-md hover:bg-gray-300 transition duration-200 ease-in-out '>
                          <a
                            href='https://www.udemy.com/certificate/UC-7170ecb4-3c8a-420a-b0e9-7cb9b5b22b77/'
                            target='_blank'>
                            certificate
                          </a>
                        </li>
                      </ul>
                    </footer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Education;

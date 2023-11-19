import React from "react";
import Image from "next/image";
import { currentYrsExp } from "./utils/date";
import { IconLink } from "@tabler/icons-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deepak Kumar | Experience",
  description: "Deepak Kumar | Experience | Software Engineer | Node Js | React Js | Javascript",
  keywords: "Instant system inc, node js, deepak kumar, ceekr, synqy",
};

const Experience = () => {
  const diffExprs = currentYrsExp();
  return (
    <section className='relative not-prose scroll-mt-[72px]' id='experience'>
      <div className='relative mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-10 lg:py-12 text-default '>
        <div className='mb-8 md:mx-auto md:mb-12 text-center max-w-3xl'>
          <h2 className='font-bold leading-tighter tracking-tighter font-heading text-heading text-3xl md:text-4xl'>
            Technical Experience
          </h2>
        </div>
        <div id='experience-wrapper' className='topic-summary bg-blue-50 '>
          <div className='relative not-prose scroll-mt-[72px]' id='experience-details'>
            <div className='relative mx-auto px-4 md:px-6 py-8 md:py-10 lg:py-12 text-default max-w-6xl'>
              <div className='flex flex-col gap-8 md:gap-12'>
                <div className='md:py-4 md:self-center w-full'>
                  <div className=''>
                    <div className='flex'>
                      <div className='flex flex-col items-center mr-4 rtl:mr-0 rtl:ml-4'>
                        <div className='flex items-center justify-center'>
                          <Image
                            src='/assets/projects/instant_systems_inc_logo.jpeg'
                            alt='alt'
                            decoding='async'
                            loading='lazy'
                            className='rounded-full border-slate-200 border-solid border-2'
                            width={200}
                            height={200}
                          />
                        </div>
                        <div className='w-px h-full bg-black/10 dark:bg-slate-400/50'></div>
                      </div>

                      <div className='pt-1 pb-8'>
                        <div className='text-xl font-bold flex'>
                          Instant System Inc
                          <a href='https://instantsys.com/' className='ml-2' target='_blank'>
                            <IconLink />
                          </a>
                        </div>

                        <p className='text-lg font-normal'>Sr Software Engineer ( {`${diffExprs.years()}+ yrs`})</p>
                        <p className='text-sm font-normal'>2017 - current</p>

                        <div className='text-muted mt-2'>
                          <span className='text-base font-medium'>
                            Instant Systems Inc is a unique software product incubator that helps ambitious start-ups
                            with building of innovative products and passionate teams around the world, along with fund
                            raising and back-office support. We take game changing ideas and products from our ventures
                            to global enterprises and leading governments to help them gain agility and speed. Our teams
                            have a track record of success in delivering SaaS, mobile, big data, and social web
                            solutions for consumer, enterprise and government markets. We help turn innovative ideas
                            into market-dominating products!
                          </span>

                          <div className='flex mt-4'>
                            <div className='flex flex-col items-center mr-4 rtl:mr-0 rtl:ml-4'>
                              <div className='flex items-center justify-center'>
                                <Image
                                  src='/assets/projects/humanizeglobal_logo.jpeg'
                                  alt='alt'
                                  decoding='async'
                                  loading='lazy'
                                  className='rounded-full border-slate-200 border-solid border-2'
                                  width={100}
                                  height={100}
                                />
                              </div>
                              <div className='w-px h-full bg-black/10 dark:bg-slate-400/50'></div>
                            </div>

                            <div className='pt-1 pb-8'>
                              <div className='text-xl font-bold flex'>
                                Humanize
                                <a href='https://humanize.com/' className='ml-2' target='_blank'>
                                  <IconLink />
                                </a>
                              </div>

                              <span className='text-lg font-normal'>Sr Software Engineer (Current)</span>
                              <br />
                              <span className='text-sm font-normal'>2023 (June) - current</span>
                              <div className='text-muted mt-2'>
                                <div className='text-base font-normal'>
                                  Humanize offers a healthy digital global platform supporting personal development
                                  through an innovative science-based curriculum and inter-subjective dyadic practices
                                  with high level teachers, regular coaching, and a community to support ongoing and
                                  sustainable practice and inner transformation.
                                  <p className='text-base font-bold mt-2'>
                                    Tools: React Js ,Node Js, Nest Js, Mongo DB, Javascript, GIT, Jira, AWS Services,
                                    mailgun
                                  </p>
                                </div>

                                <ul className='list-disc mt-4 ml-4'>
                                  <li className='topic-item mt-4 topic-summary topic-tech topic-team'>
                                    RESTful APIs for seamless communication between the frontend and backend
                                  </li>
                                  <li className='topic-item mt-4 topic-summary topic-team topic-lead'>
                                    Scalable architecture to accommodate growing user bases and increased data loads.
                                  </li>
                                  <li className='topic-item mt-4 topic-summary'>
                                    Secure data handling and user authentication to protect sensitive information.
                                  </li>
                                  <li className='topic-item mt-4 topic-summary'>
                                    Integration with third-party services for extended functionality.
                                  </li>
                                  <li className='topic-item mt-4 topic-summary'>
                                    Real-time updates and dynamic content rendering for a lively interface.
                                  </li>
                                  <li className='topic-item mt-4 topic-summary'>
                                    Accessibility features to ensure inclusivity and compliance with industry standards.
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div className='flex'>
                            <div className='flex flex-col items-center mr-4 rtl:mr-0 rtl:ml-4'>
                              <div className='flex items-center justify-center'>
                                <Image
                                  src='/assets/projects/synqy.png'
                                  alt='SYNQY'
                                  decoding='async'
                                  loading='lazy'
                                  className='rounded-full border-slate-200 border-solid border-2'
                                  width={50}
                                  height={50}
                                />
                              </div>
                              <div className='w-px h-full bg-black/10 dark:bg-slate-400/50'></div>
                            </div>
                            <div className='pt-1 pb-8'>
                              <div className='text-xl font-bold flex'>
                                SYNQY Corporation
                                <a href='https://synqy.com/' className='ml-2' target='_blank'>
                                  <IconLink />
                                </a>
                              </div>

                              <p className='text-lg font-normal'>Sr Software Engineer (4+yrs)</p>
                              <p className='text-sm font-normal'>2019 - 2023(June)</p>

                              <div className='text-muted mt-2'>
                                <div className='text-base font-normal'>
                                  SYNQY's Enhanced Product Listings are a new type of advertising designed to replace or
                                  complement your existing retail media.
                                  <p className='text-base font-bold mt-2'>
                                    Tools: React Js ,Node Js, Serverless architecture, Javascript,MySql, DynamoDB, GIT,
                                    Jira, AWS Services, React Chart.
                                  </p>
                                </div>

                                <ul className='list-disc mt-4 ml-4'>
                                  <li className='topic-item mt-4 topic-summary topic-tech topic-team'>
                                    Develop and maintain RESTful APIs to facilitate seamless communication between the
                                    frontend and backend systems.
                                  </li>
                                  <li className='topic-item mt-4 topic-summary topic-team topic-lead'>
                                    Implement robust data management strategies, including database design,
                                    optimization, and maintenance
                                  </li>
                                  <li className='topic-item mt-4 topic-summary'>
                                    Integrate backend services with third-party APIs to enhance functionality and
                                    support additional features.
                                  </li>
                                  <li className='topic-item mt-4 topic-summary'>
                                    Collaborate with frontend developers, UX/UI designers, and other team members to
                                    ensure seamless end-to-end functionality.
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div className='flex'>
                            <div className='flex flex-col items-center mr-4 rtl:mr-0 rtl:ml-4'>
                              <div className='flex items-center justify-center'>
                                <Image
                                  src='/assets/projects/ceekr_logo.jpeg'
                                  alt='alt'
                                  decoding='async'
                                  loading='lazy'
                                  className='rounded-full border-slate-200 border-solid border-2'
                                  width={200}
                                  height={200}
                                />
                              </div>
                              <div className='w-px h-full bg-black/10 dark:bg-slate-400/50'></div>
                            </div>
                            <div className='pt-1 pb-8'>
                              <div className='text-xl font-bold flex'>
                                Ceekr
                                <a href='https://www.ceekr.com/' className='ml-2' target='_blank'>
                                  <IconLink />
                                </a>
                              </div>
                              <p className='text-lg font-normal'>
                                Jr Software Engineer (1.6+yrs).<span className='text-sm'></span>
                              </p>
                              <p className='text-sm font-normal'>2017 - 2019</p>

                              <div className='text-muted mt-2'>
                                <div className='text-base font-normal'>
                                  At Ceekr, they develop deep into the intricacies of the human choice making mind,
                                  offering a transformative journey that empowers individuals to master their cognitive
                                  and emotional faculties and optimise their physiology. Our ground-breaking
                                  initiatives, rooted in extensive Yoga and Vedanta research and innovative AI
                                  protocols, are designed to foster a profound understanding of the relationship between
                                  attention, energy, and cognition.
                                  <p className='text-base font-bold mt-2'>
                                    Tools: React Js , HTML, CSS, PHP, Javascript,JQuery, MySql, GIT, Jira, AWS Services.
                                  </p>
                                </div>
                                <ul className='list-disc mt-4 ml-4'>
                                  <li className='topic-item mt-4 topic-summary topic-tech topic-team'>
                                    Develop and maintain server-side logic using PHP, ensuring high performance,
                                    responsiveness, and scalability.
                                  </li>
                                  <li className='topic-item mt-4 topic-summary topic-team topic-lead'>
                                    Create and maintain robust and scalable APIs to facilitate seamless communication
                                    between the frontend and backend components.
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='flex'>
                      <div className='flex flex-col items-center mr-4 rtl:mr-0 rtl:ml-4'>
                        <div>
                          <div className='flex items-center justify-center'>
                            <Image
                              src='/assets/projects/phoenix.jpeg'
                              alt='alt'
                              decoding='async'
                              loading='lazy'
                              className='rounded-full border-slate-200 border-solid border-2'
                              width={100}
                              height={100}
                            />
                          </div>
                        </div>
                        <div className='w-px h-full bg-black/10 dark:bg-slate-400/50'></div>
                      </div>
                      <div className='pt-1 pb-8'>
                        <p className='text-xl font-bold flex'>
                          Phoenix Media Pvt. Ltd
                          <a
                            href='https://www.linkedin.com/company/phoenix-media-pvt--ltd-/about/'
                            className='ml-2'
                            target='_blank'>
                            <IconLink />
                          </a>
                        </p>
                        <p className='text-lg font-normal'>Software Engineer</p>
                        <p className='text-sm font-normal'>2016 (Dec) - 2017 (May)</p>

                        <div className='text-muted mt-2'>
                          <span className='text-base'>
                            Phoenix group is a complete advertising agency offering a full suite of marketing services
                            for progressive businesses globally. Our offline and online marketing campaigns are designed
                            to create worldwide brand exposure and generate highest ROI for our clients.
                          </span>
                          <ul className='list-disc mt-4 ml-4'>
                            <li className='topic-item mt-4 topic-summary'>
                              As a software engineer at Phoenix Media Pvt Ltd Company, my 6+ month experience has been
                              nothing short of remarkable. Working as a junior in the company, I was given the
                              opportunity to explore a wide range of projects and learn from experienced professionals
                              in the field.
                            </li>
                            <li className='topic-item mt-4 topic-summary'>
                              In my first month, I was assigned to work on a project that involved developing an
                              e-commerce platform for a client. This project taught me how to collaborate effectively
                              with team members, how to write clean and efficient code, and how to work with different
                              technologies and tools.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className='flex'>
                      <div className='flex flex-col items-center mr-4 rtl:mr-0 rtl:ml-4'>
                        <div>
                          <div className='flex items-center justify-center'>
                            <Image
                              src='/assets/projects/galaxy.jpeg'
                              alt='alt'
                              decoding='async'
                              loading='lazy'
                              className='rounded-full border-slate-200 border-solid border-2'
                              width={100}
                              height={100}
                            />
                          </div>
                        </div>
                        <div className='w-px h-full bg-black/10 dark:bg-slate-400/50'></div>
                      </div>
                      <div className='pt-1 pb-8'>
                        <div className='text-xl font-bold flex'>
                          Galaxy Tourism Pvt. Ltd
                          <a href='https://www.galaxytourism.com/index.html' className='ml-2' target='_blank'>
                            <IconLink />
                          </a>
                        </div>
                        <p className='text-lg font-normal'>Web Developer</p>
                        <p className='text-sm font-normal'>(Training 6 month)</p>

                        <div className='text-muted mt-2'>
                          <div className='text-base'>
                            Galaxy tourism is counted as a leading B2B Destination Management Company (DMC) offering the
                            best services, hotel reservation systems and packages, sightseeing and adventure tours
                            making the tourists experience the true beauty and the unseen of Dubai, Singapore and
                            Malaysia.
                            <p className='text-base font-bold mt-2'>
                              Tools: HTML, CSS, PHP, MySQL, JQuery, Javascript.
                            </p>
                          </div>
                          <ul className='list-disc mt-4 ml-4'>
                            <li className='topic-item mt-4 topic-summary'>
                              Dive into the world of PHP and gain proficiency in developing server-side logic,
                              leveraging popular PHP frameworks such as codeigniter or cakephp
                            </li>
                            <li className='topic-item mt-4 topic-summary'>
                              Learn to design and manage databases using MySQL, honing your skills in database
                              architecture, optimization, and security.
                            </li>
                            <li className='topic-item mt-4 topic-summary'>
                              Master JavaScript, the language of the web, to create dynamic and interactive user
                              interfaces.
                            </li>
                            <li className='topic-item mt-4 topic-summary'>
                              Explore modern JavaScript frameworks and libraries, enhancing your ability to build
                              responsive and feature-rich frontend applications.
                            </li>
                          </ul>
                        </div>
                      </div>
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

export default Experience;

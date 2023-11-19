"use client";
import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowBackUp } from "@tabler/icons-react";

const page = () => {
  let router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Define your form fields here
    // For example:
    organisation: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      // Make a POST request to your API route
      setLoading(true);
      const response = await fetch("/api/hire/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result.data);
        if (result.data) {
          router.push("/success");
          setLoading(false);
          setFormData({
            organisation: "",
            email: "",
            subject: "",
            message: "",
          });
        }
      } else {
        console.error("Form submission failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setLoading(false);
    }
  };

  return (
    <section className='bg-white dark:bg-gray-900'>
      <div className='py-8 lg:py-16 px-4 mx-auto max-w-screen-md'>
        <h2 className='mb-4 text-4xl tracking-tight font-extrabold text-center text-blue-700 dark:text-white'>
          Hire me !
        </h2>
        <p className='mb-8 lg:mb-16 font-light text-center text-blue-500 dark:text-gray-400 sm:text-xl'>
          Innovative Software Developer Ready to Elevate Your Tech Vision
        </p>
        <div className='md:hidden text-center'>
          <div className='sm:w-full m-auto'>
            <a className='btn btn-outline btn-primary w-50 text-lg mb-10' onClick={() => router.push("/")}>
              Go back
              <IconArrowBackUp />
            </a>
          </div>
        </div>
        {loading ? (
          <div className='flex mr-15 text-center'>
            <span className='loading loading-ball loading-xs text-blue-500'></span>
            <span className='loading loading-ball loading-sm text-blue-500'></span>
            <span className='loading loading-ball loading-md text-blue-500'></span>
            <span className='loading loading-ball loading-lg text-blue-500'></span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-8'>
            <div>
              <label aria-label='email' className='block mb-2 md:text-lg font-medium text-gray-900 dark:text-gray-300'>
                Your email
              </label>
              <input
                type='email'
                name='email'
                id='email'
                className='shadow-sm bg-gray-50 border border-gray-300 text-gray-900 md:text-lg rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light'
                placeholder='abc@abc.com'
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label
                aria-label='oragnisation'
                className='block mb-2 md:text-lg font-medium text-gray-900 dark:text-gray-300'>
                Your organisation
              </label>
              <input
                type='text'
                id='organisation'
                name='organisation'
                className='shadow-sm bg-gray-50 border border-gray-300 text-gray-900 md:text-lg rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light'
                placeholder='your organisation'
                value={formData.organisation}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label
                aria-label='subject'
                className='block mb-2 md:text-lg font-medium text-gray-900 dark:text-gray-300'>
                Subject
              </label>
              <input
                type='text'
                id='subject'
                name='subject'
                className='block p-3 w-full md:text-lg text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light'
                placeholder='your subject'
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div className='sm:col-span-2'>
              <label
                aria-label='message'
                className='block mb-2 md:text-lg font-medium text-gray-900 dark:text-gray-400'>
                Your message
              </label>
              <textarea
                value={formData.message}
                name='message'
                onChange={handleChange}
                id='message'
                rows={5}
                className='block p-2.5 w-full md:text-lg text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500'
                placeholder='Please detail your requirement...'></textarea>
            </div>

            {/* <div className='sm:col-span-2'>
          <input
            type='file'
            placeholder='Attach your requirement'
            className=' text-blue-500 bg-blue-100 file-input file-input-bordered w-full max-w-xs'
          />
        </div> */}

            <button
              type='submit'
              className='px-5 md:text-lg font-medium text-center btn btn-outline btn-primary rounded-lg  sm:w-fit hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'>
              Send query
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default page;

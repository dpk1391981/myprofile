"use client";
import { useState } from "react";
import {
  IconMessage,
  IconBrandLinkedin,
  IconFileDownload,
  IconBuildingBank,
  IconUserScan,
  IconBallpen,
  IconChartBubble,
  IconHome2,
  IconX,
  IconMenu2,
  IconMoodDollar,
} from "@tabler/icons-react";
import Image from "next/image";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Nav = () => {
  let router = useRouter();
  const [showError, setShowError] = useState(false);
  const [openNav, setOpenNav] = useState(false);

  function axiosDownloadFile(url: any, fileName: any) {
    return axios({
      url,
      method: "GET",
      responseType: "blob",
    })
      .then((response) => {
        const href = window.URL.createObjectURL(response.data);

        const anchorElement = document.createElement("a");

        anchorElement.href = href;
        anchorElement.download = fileName;

        document.body.appendChild(anchorElement);
        anchorElement.click();

        document.body.removeChild(anchorElement);
        window.URL.revokeObjectURL(href);
      })
      .catch((error) => {
        console.log("error: ", error);
        setShowError(true);
      });
  }

  const onButtonClick = () => {
    try {
      const fileURL = "https://myprofiledk.s3.ap-south-1.amazonaws.com/resume.pdf";

      axiosDownloadFile(fileURL, "Deepak-Resume.pdf");
    } catch (error) {
      console.log(`Error`, error);
    }
  };

  const openContactModal = () => {
    const myModalElement: HTMLDialogElement | null = document.getElementById("my_modal_1") as HTMLDialogElement | null;

    if (myModalElement) {
      myModalElement.showModal();
    } else {
      console.error("Element with ID 'my_modal_1' not found.");
    }
  };

  const RightTopBlock = ({ pName, cName }: any) => {
    return (
      <div className={pName}>
        <div className={cName}>
          <a
            className='text-muted dark:text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:text-blue-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 inline-flex items-center'
            aria-label='LinkedIn Profile'
            href='https://www.linkedin.com/in/dpk1391981/'
            title='linkedin profile'
            target='_linkedin'>
            <IconBrandLinkedin />
          </a>
          <a
            className='text-muted dark:text-gray-400 hover:bg-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 inline-flex items-center'
            aria-label='Download CV Summary'
            href='#'
            title='Download Resume'
            onClick={onButtonClick}>
            <IconFileDownload />
          </a>
          <a
            className='text-muted dark:text-gray-400 hover:bg-gray-100 hover:text-green-600 dark:hover:text-green-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 inline-flex items-center'
            aria-label='connect me'
            href='#'
            title='connect me'
            onClick={openContactModal}>
            <IconMessage />
          </a>
          <a
            className='text-muted dark:text-gray-400 hover:bg-gray-100 hover:text-white-600 dark:hover:text-green-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 inline-flex items-center'
            aria-label='hire me'
            href='#'
            title='hire me'
            onClick={() => router.push("/hireme")}>
            <IconMoodDollar />
          </a>
        </div>
      </div>
    );
  };

  return (
    <header
      className='sticky top-0 z-40   w-full border-b border-gray-10/0 transition-[opacity] ease-in-out bg-blue-50'
      id='header'>
      {showError && (
        <div className='toast'>
          <div className='alert alert-warning'>
            <span>
              Error in download!
              <p>Please send query to</p>
              <a className='font-bold' href='mailto:dpk1391981@gmail.com'>
                &nbsp; dpk1391981@gmail.com
              </a>
            </span>
            <span
              className='cursor-pointer'
              onClick={() => {
                setShowError(false);
              }}>
              X
            </span>
          </div>
        </div>
      )}

      <div className='relative text-default py-3 px-3 md:px-6 mx-auto w-full md:flex md:justify-between max-w-7xl'>
        <div className='flex justify-between'>
          <span className='self-center ml-2 rtl:ml-0 rtl:mr-2 text-2xl md:text-xl font-bold text-gray-900 whitespace-nowrap dark:text-white'>
            <div className='avatar'>
              <div className='w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2'>
                <Image
                  src='/assets/images/profile-pic-removebg-preview.png'
                  alt='Thumbnail image of Deepak Kumar'
                  title='Avatar Deepak Kumar'
                  style={{ display: "inline" }}
                  width={100}
                  height={100}
                  loading='lazy'
                  decoding='async'
                />
              </div>
            </div>
          </span>

          <div className='flex flex-col'>
            <div className='ml-4 mt-2 text-2xl font-bold' title='Deepak Kumar | dpk1391981@gmail.com'>
              Deepak Kumar
              <p className='text-sm font-medium text-blue-700 text-center sm: mr-10'>dpk1391981@gmail.com</p>
            </div>
            <RightTopBlock
              cName={`md:hidden mx:hidden items-center flex justify-between w-full md:w-auto sm: mr-2`}
              pName={`md:self-center flex md:flex items-center  md:static justify-end`}
            />
          </div>

          <div className='flex items-center md:hidden '>
            <button
              className='flex flex-col h-12 w-12 rounded justify-center items-center cursor-pointer group'
              aria-label='Toggle Menu'
              onClick={() => setOpenNav(!openNav)}>
              {openNav ? <IconX /> : <IconMenu2 className='font-medium' />}
            </button>
          </div>
        </div>
        <nav
          className={`items-center w-full  md:w-auto ${
            !openNav && `hidden`
          } md:flex  overflow-y-auto overflow-x-hidden md:overflow-y-visible md:overflow-x-auto md:mx-7`}
          aria-label='Main navigation'>
          <div className='divider'></div>
          <ul className='flex flex-col md:flex-row md:self-center w-full md:w-auto  md:text-[0.9500rem] tracking-[0.01rem] font-medium'>
            <li className='text-lg ' title='Home'>
              <Link className='px-4 py-3 flex' onClick={() => setOpenNav(false)} href='/'>
                / | <IconHome2 className='m-0' />
              </Link>
            </li>
            <li className='text-lg ' title='About me'>
              <Link
                className='px-4 py-3 flex'
                onClick={() => setOpenNav(false)}
                href={`${openNav ? `/about` : "#about"}`}>
                Me | <IconUserScan className='m-1' />
              </Link>
            </li>
            <li className='text-lg ' title='My Experience'>
              <Link
                onClick={() => setOpenNav(false)}
                className='px-4 py-3 flex'
                href={`${openNav ? `/experience` : "#experience"}`}>
                Experience | <IconBuildingBank className='m-0' />
              </Link>
            </li>
            <li className='text-lg ' title='My Education'>
              <Link
                onClick={() => setOpenNav(false)}
                className='px-4 py-3 flex'
                href={`${openNav ? `/education` : "#education"}`}>
                Education | <IconBallpen className='m-1' />
              </Link>
            </li>
            <li className='text-lg ' title='Skills'>
              <Link
                onClick={() => setOpenNav(false)}
                className='px-4 py-3 flex'
                href={`${openNav ? `/skills` : "#skills"}`}>
                Skills | <IconChartBubble />
              </Link>
            </li>
          </ul>
        </nav>
        <RightTopBlock
          cName={`md:self-center flex md:flex items-center md:mb-0 fixed w-full md:w-auto md:static justify-end left-0 rtl:left-auto rtl:right-0 bottom-0 p-3 md:p-0`}
          pName={`hidden md:flex items-center  justify-between w-full md:w-auto`}
        />
      </div>
    </header>
  );
};

export default Nav;

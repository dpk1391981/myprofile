"use client";
import React from "react";
import { IconPhone, IconMail } from "@tabler/icons-react";
import SocailLinks from "./utils/SocailLinks";

const Footer = () => {
  const MOBILE = " +91-8285257636",
    EMAIL = "dpk1391981@gmail.com";

  return (
    <>
      <footer className='footer footer-center p-10  text-base-content rounded font-medium text-lg bg-blue-50'>
        <nav className='sticky bottom-0 grid md:grid-flow-col md:gap-2'>
          <a className='flex link link-hover' href={`tel:${MOBILE}`} target='tel'>
            <IconPhone /> {MOBILE}
          </a>
          |
          <a className='flex link link-hover' href={`mailto:${EMAIL}`} target='email'>
            <IconMail /> {EMAIL}
          </a>
        </nav>
        <nav>
          <div className='grid grid-flow-col gap-2'>
            <SocailLinks />
          </div>
        </nav>
        <aside>
          <p>Copyright © 2023 - All right reserved by @deepak</p>
        </aside>
      </footer>
    </>
  );
};

export default Footer;

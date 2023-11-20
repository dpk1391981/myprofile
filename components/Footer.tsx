"use client";
import React from "react";
import SocailLinks from "./utils/SocailLinks";

const Footer = () => {
  return (
    <>
      <footer className='footer footer-center p-10  text-base-content rounded font-medium text-lg bg-blue-50'>
        <nav className='sticky bottom-0 grid lg:grid-flow-col lg:gap-2'>
          <span>Empowering Innovation through Elegant Code | Deepak Kumar - Software Engineer</span>
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

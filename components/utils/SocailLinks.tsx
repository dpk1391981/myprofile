import React from "react";
import {
  IconBrandLinkedin,
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandSkype,
  IconBrandBitbucket,
  IconBrandZoom,
  IconBrandGithub,
} from "@tabler/icons-react";

const socialLinks = [
  {
    title: "Deepak LinkedIn",
    label: "LinkedIn",
    icon: <IconBrandLinkedin />,
    url: "https://www.linkedin.com/in/dpk1391981/",
  },
  {
    title: "Deepak Facebook",
    label: "Facebook",
    icon: <IconBrandFacebook />,
    url: "https://www.facebook.com/dpk1391981/",
  },
  {
    title: "Deepak Twitter",
    label: "Twitter",
    icon: <IconBrandTwitter />,
    url: "https://twitter.com/deepakkutniyal/",
  },
  {
    title: "Deepak Skype",
    label: "Skype",
    icon: <IconBrandSkype />,
    url: "https://join.skype.com/invite/j5UHRguIGhYq/",
  },

  {
    title: "Deepak Github",
    label: "Github",
    icon: <IconBrandGithub />,
    url: "https://github.com/dpk1391981/",
  },
  {
    title: "Deepak Bitbucket",
    label: "Bitbucket",
    icon: <IconBrandBitbucket />,
    url: "https://bitbucket.org/dpk1391981/",
  },
  {
    title: "Deepak zoom",
    label: "zoom",
    icon: <IconBrandZoom />,
    url: "https://us04web.zoom.us/j/4191528385?pwd=dENtU1cxYVA3dytVazdKMWZOQmMyQT09/",
  },
];

const SocailLinks = () => {
  return (
    <ul className='flex mb-4 md:order-1 -ml-2 md:ml-4 md:mb-0 rtl:ml-0 rtl:-mr-2 rtl:md:ml-0 rtl:md:mr-4'>
      {socialLinks.map((social) => (
        <li key={social["label"]} title={social["title"]}>
          <a
            className='text-muted dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 inline-flex items-center'
            aria-label={social["label"]}
            target='_blank'
            href={social["url"]}>
            {social["icon"]}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default SocailLinks;

import React from "react";
import { IconPhone, IconMail } from "@tabler/icons-react";

const ContactModal = () => {
  return (
    <dialog id='my_modal_1' className='modal'>
      <div className='modal-box'>
        <form method='dialog'>
          <button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>✕</button>
        </form>
        <h3 className='font-bold text-xl'>Connect with Me!</h3>
        <div className='divider divider-start'></div>
        <table className='table-auto text-lg mt-5'>
          <tbody>
            <tr>
              <th>
                <IconPhone />
              </th>
              <td className='pl-2 font-medium'>
                <a href='tel:+91-8285257636' target='tel'>
                  +91-8285257636
                </a>
              </td>
            </tr>

            <tr>
              <th>
                <IconMail />
              </th>
              <td className='pl-4 font-medium'>
                <a href='mailto:dpk1391981@gmail.com' target='email'>
                  dpk1391981@gmail.com
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </dialog>
  );
};

export default ContactModal;

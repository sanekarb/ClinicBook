import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <div className="md:mx-10">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10  mt-40 text-sm">
        <div>
          <h1
            onClick={() => navigate("/")}
            className="text-2xl sm:text-3xl font-bold text-primary cursor-pointer tracking-wide"
          >
            ClinicBook<span className="text-gray-500">.</span>
          </h1>
          <p className="w-full md:w-2/3 text-gray-600 leading-6">
            ClinicBook is your trusted platform for hassle-free doctor
            appointments. We connect patients with top healthcare professionals,
            ensuring seamless scheduling, secure records, and quality care at
            your fingertips.
          </p>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy policy</li>
          </ul>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>+91-800-123-4567</li>
            <li>support@clinicbook.com</li>
          </ul>
        </div>
      </div>

      <div>
        <hr />
        <p className="py-5 text-sm text-center">
          Copyright 2026 @ ClinicBook.com - All Right Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;

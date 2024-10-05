import React from 'react';
import { FaGithub, FaLink } from 'react-icons/fa';

const Footer: React.FC = () => {
    return (
        <footer className="flex justify-between items-center p-4 border-t-2 border-gray-600">
            <span className='text-white sm:text-xs md:text-sm'>© 2024 Phillip Chandy. All rights reserved. Various trademarks held by their respective owners.</span>
            <div className="flex space-x-4">
                <a href="https://github.com/philchandy" target="_blank" rel="noopener noreferrer">
                    <FaGithub className="text-xl text-white hover:text-blue-500" />
                </a>
                <a href="https://phillipchandy.app" target="_blank" rel="noopener noreferrer">
                    <FaLink className="text-xl text-white hover:text-blue-500" />
                </a>
            </div>
        </footer>
    );
};

export default Footer;
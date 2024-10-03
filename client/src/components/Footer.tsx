import React from 'react';
import { FaGithub, FaLink } from 'react-icons/fa';

const Footer: React.FC = () => {
    return (
        <footer className="flex justify-between items-center p-4 border-t bg-white">
            <span>Created by Phillip Chandy</span>
            <div className="flex space-x-4">
                <a href="https://github.com/philchandy" target="_blank" rel="noopener noreferrer">
                    <FaGithub className="text-xl text-gray-700 hover:text-blue-500" />
                </a>
                <a href="https://yourpersonalwebsite.com" target="_blank" rel="noopener noreferrer">
                    <FaLink className="text-xl text-gray-700 hover:text-blue-500" />
                </a>
            </div>
        </footer>
    );
};

export default Footer;
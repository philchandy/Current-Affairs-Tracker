import React from 'react';

interface ToggleSwitchProps {
    checked: boolean,
    onChange: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => {
    return (
        <label className="flex items-center cursor-pointer">
            <span className="mx-2 text-white">{checked ? 'Media Score' : 'Severity Score'}</span>
            <div className="relative">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="sr-only"
                />
                <div className="block bg-gray-300/15 w-14 h-8 rounded-full"></div>
                <div
                    className={`absolute left-1 top-1 w-6 h-6 rounded-full transition-transform duration-300 ease-in-out transform ${checked ? 'translate-x-6 bg-blue-500' : 'bg-red-500'}`}
                ></div>
            </div>
        </label>
    );
};

export default ToggleSwitch;
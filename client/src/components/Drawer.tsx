import React from 'react';
import { FaGithub, FaLink, FaArrowDown } from 'react-icons/fa'
import Footer from './Footer';

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const Drawer: React.FC<DrawerProps> = ({isOpen, onClose}) => {
    return (
        <>
            <div className={`fixed inset-0 z-[1001] bg-gray-800 transition-transform transform ${isOpen ? 'translate-y-0' : 'translate-y-full'} shadow-lg flex flex-col `}>
                <div className="h-full relative flex-1 overflow-y-auto no-scrollbar">
                    <div className='flex flex-row justify-between items-center sticky top-0 bg-gray-800 p-4 border-b-2 border-gray-600'>
                        {/* Header */}
                        <h2 className="text-2xl md:text-3xl font-bold text-white">Current Affairs Tracker</h2>
                         {/* Close Button */}
                         <button onClick={onClose} className=" text-gray-400 hover:text-gray-200 flex items-center gap-2 ">
                            
                            <FaArrowDown className="text-xl md:text-2xl text-white" />
                        </button>
                    </div>
                    <div className='p-4'>
                        <p className="text-sm md:text-lg text-gray-200 mt-2 md:mt-4">
                            This application provides real-time information about current events around the world, using various data sources to assess severity and media attention.
                        </p>
                        <p className="text-sm md:text-lg text-gray-200 mt-2">
                            The primary goal of this application is to highlight the contrast between the <i>media attention</i> an event receives and its actual <i>severity</i>. 
                        </p>
                        <p className="text-sm md:text-lg text-gray-200 mt-2">
                            By providing a clear comparison between these two scores, the app raises awareness of underreported yet highly severe crises, while also encouraging users to stay informed about global events.
                        </p>
                        <p className="text-sm md:text-lg text-gray-200 mt-2">
                            Ultimately, this tool aims to drive greater attention to events that may not be making headlines but deserve focus due to their human, social, and environmental impact.
                        </p>

                        {/* Data Sources */}
                        <h3 className="text-lg md:text-2xl font-semibold text-white mt-6">Data Sources</h3>
                        <ul className="list-disc list-inside text-sm md:text-base text-gray-300 mt-3">
                            <li>All events are sourced from <i>Crisis Watch</i>, a platform that tracks global crisis events.</li>
                            <li><i>The Google Search API</i> is utilized to gather media attention data for the events, allowing for a comprehensive analysis of public interest.</li>
                        </ul>

                        {/* Severity Score */}
                        <h3 className="text-lg md:text-2xl font-semibold text-white mt-6">Severity Score</h3>
                        <p className="text-sm md:text-base text-gray-300 mt-2">
                            The Severity Score is calculated based on the presence of certain keywords in the event descriptions. The following process is used to determine the score:
                        </p>
                        <ul className="list-disc list-inside text-sm md:text-base text-gray-300 mt-3">
                            <li>Keywords related to severity (e.g., "violence", "conflict") are assigned points.</li>
                            <li>Keywords related to impact (e.g., "humanitarian crisis", "displacement") also contribute points.</li>
                            <li>The total score is scaled up and capped at 100 to reflect the severity of the event accurately.</li>
                        </ul>

                        {/* Media Score */}
                        <h3 className="text-lg md:text-2xl font-semibold text-white mt-6">Media Score</h3>
                        <p className="text-sm md:text-base text-gray-300 mt-2">
                            The Media Score reflects the attention an event receives across various media platforms:
                        </p>
                        <ul className="list-disc list-inside text-sm md:text-base text-gray-300 mt-3">
                            <li>The score is calculated based on the number of search results for a given event description.</li>
                            <li>Using logarithmic scaling, the score is capped at 100 to normalize it and ensure consistency across different events.</li>
                        </ul>

                        {/* Normalized Score Difference */}
                        <h3 className="text-lg md:text-2xl font-semibold text-white mt-6">Normalized Score Difference</h3>
                        <p className="text-sm md:text-base text-gray-300 mt-2">
                            You can calculate the normalized difference between the severity score and media score for each event. This metric shows how closely aligned the two scores are for each event.
                        </p>
                        <p className="text-sm md:text-base text-gray-300 mt-2">
                            <strong>Formula:</strong>
                        </p>
                        <p className="text-sm md:text-base text-gray-300 mt-2">
                            <code>Score Difference = (Severity Score - Media Score) / Max(Severity Score, Media Score)</code>
                        </p>
                        <p className="text-sm md:text-base text-gray-300 mt-2">
                            This results in a value between -1 and 1, where:
                        </p>
                        <ul className="list-disc list-inside text-sm md:text-base text-gray-300 mt-3">
                            <li><strong>0:</strong> Both scores are equal.</li>
                            <li><strong>Positive Values:</strong> The severity score is higher than the media score.</li>
                            <li><strong>Negative Values:</strong> The media score is higher than the severity score.</li>
                        </ul>

                        {/* Correlation */}
                        <h3 className="text-lg md:text-2xl font-semibold text-white mt-6">Correlation</h3>
                        
                        <p className="text-sm md:text-base text-gray-300 mt-2">
                            The correlation value indicates the relationship between media attention and event severity scores for each region. 
                        </p>
                        <ul className="list-disc list-inside text-sm md:text-base text-gray-300 mt-3">
                            <li><strong>0:</strong> Indicates no clear pattern between media attention and severity.</li>
                            <li><strong>Positive Values:</strong> Countries experiencing more severe events are also receiving more media attention.</li>
                            <li><strong>Negative Values:</strong> Countries with severe events are receiving less media attention, indicating a potential oversight in media coverage.</li>
                        </ul>

                        {/* Color Intensity */}
                        <h3 className="text-lg md:text-2xl font-semibold text-white mt-6">Color Intensity</h3>
                        <p className="text-sm md:text-base text-gray-300 mt-2">
                            Events are visually represented on the map using varying shades of <i>red</i>, <i>blue</i>, and <i>purple</i>, corresponding to the <i>Severity Score</i>, <i>Media Score</i>, and <i>Normalized Difference</i>, respectively:
                        </p>
                        <ul className="list-disc list-inside text-sm md:text-base text-gray-300 mt-3">
                            <li><span className="text-red-500"><i>Red</i></span>: Represents the Severity Score. The deeper the red, the more severe the event.</li>
                            <li><span className="text-blue-500"><i>Blue</i></span>: Represents the Media Score. The deeper the blue, the more media attention the event is receiving.</li>
                            <li><span className="text-purple-500"><i>Purple</i></span>: Represents the Normalized Difference. A stronger purple color indicates a greater disparity between media attention and severity.</li>
                        </ul>
                        <p className="text-sm md:text-base text-gray-300 mt-3">
                            For events with a <i>high severity</i> score, you'll notice a strong, deep red color, indicating significant violence, crisis, or unrest.
                        </p>
                        <p className="text-sm md:text-base text-gray-300 mt-3">
                            Events with <i>high media attention</i> will have a deep blue color, showcasing that the event is heavily covered by global media.
                        </p>
                        <p className="text-sm md:text-base text-gray-300 mt-3">
                            The <i>Normalized Difference</i> is calculated to identify the disparity between the media attention score and the severity score, allowing users to quickly assess the relative importance of events.
                        </p>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}

export default Drawer;
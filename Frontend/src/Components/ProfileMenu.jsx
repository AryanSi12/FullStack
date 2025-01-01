import { useState } from "react";
import {useSelector} from "react-redux"
import { Link } from "react-router-dom";
const ProfileMenu = ({ userDetails, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    console.log(userDetails);
    
    console.log(userDetails);
    
    const toggleMenu = () => {
        console.log(5);
        
        setIsMenuOpen((prev) => !prev);
        console.log(isMenuOpen);
    };

    return (
        <div className="relative">
            {/* Avatar */}
            <div 
                className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden cursor-pointer" 
                onClick={toggleMenu}
            >
                <img
                    src={userDetails.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Dropdown Menu */}
            {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                    <ul className="text-gray-700">
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        <Link to={`/my-account/${userDetails.username}`} className="block w-full h-full">
                        My Account
                        </Link>
                    </li>

                        <li 
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer" 
                            onClick={onLogout}
                        >
                            Logout
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ProfileMenu;

import React, { useState, useEffect } from "react";
import logout_icon from './logout.png';
import { BsCart3, BsGrid1X2Fill, BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, BsListCheck, BsMenuButtonWideFill, BsFillGearFill } from 'react-icons/bs';

function Sidebar({ openSidebarToggle, OpenSidebar, onShowEntryForm, onShowExpenseForm, onShowSummary }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem("isAdminLoggedIn", "true");
  };
  useEffect(() => {
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    const storedAdminLoginStatus = localStorage.getItem("isAdminLoggedIn");
    if (storedLoginStatus === "true") setIsLoggedIn(true);
    if (storedAdminLoginStatus === "true") setIsAdminLoggedIn(true);
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdminLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isAdminLoggedIn");
    window.location.href = "/";
  };
  return (
    <aside id="sidebar" className={openSidebarToggle ? "sidebar-responsive" : ""}>
      <div className="sidebar-title">
        <div className="sidebar-brand">
          <BsCart3 className="icon_header" /> Admin Panel
        </div>
        <span className="icon close_icon" onClick={OpenSidebar}>X</span>
      </div>

      <ul className="sidebar-list">
        <li className="sidebar-list-item">
          <a href="#" onClick={(e) => { e.preventDefault(); onShowEntryForm(); }}>
            <BsPeopleFill className="icon" /> Users
          </a>
        </li>
        <li className="sidebar-list-item">
          <a href="#" onClick={(e) => { e.preventDefault(); onShowExpenseForm(); }}>
            <BsFillArchiveFill className="icon" /> Add Expense
          </a>
        </li>
        <li className="sidebar-list-item">
          <a href="#" onClick={(e) => { e.preventDefault(); onShowSummary(); }}>
            <BsListCheck className="icon" /> Summary
          </a>
        </li>
        
        <li className='sidebar-list-item'>
        <img src={logout_icon} alt="" />
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </li>
        {/* Additional sidebar items can remain as is */}
      </ul>
    </aside>
  );
}

export default Sidebar;

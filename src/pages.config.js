/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Beranda from './pages/Beranda';
import CertificateLetter from './pages/CertificateLetter';
import DownloadPage from './pages/DownloadPage';
import EventPage from './pages/EventPage';
import FinancialReport from './pages/FinancialReport';
import MasterData from './pages/MasterData';
import MemberManagement from './pages/MemberManagement';
import MutationLetter from './pages/MutationLetter';
import PendingApproval from './pages/PendingApproval';
import Registration from './pages/Registration';
import SettingsPage from './pages/SettingsPage';
import UserManagement from './pages/UserManagement';
import MeetingInvitation from './pages/MeetingInvitation';
import MeetingAttendancePage from './pages/MeetingAttendancePage';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Beranda": Beranda,
    "CertificateLetter": CertificateLetter,
    "DownloadPage": DownloadPage,
    "EventPage": EventPage,
    "FinancialReport": FinancialReport,
    "MasterData": MasterData,
    "MemberManagement": MemberManagement,
    "MutationLetter": MutationLetter,
    "PendingApproval": PendingApproval,
    "Registration": Registration,
    "SettingsPage": SettingsPage,
    "UserManagement": UserManagement,
    "MeetingInvitation": MeetingInvitation,
    "MeetingAttendancePage": MeetingAttendancePage,
}

export const pagesConfig = {
    mainPage: "Beranda",
    Pages: PAGES,
    Layout: __Layout,
};
import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, AlertTriangle, Trash2, Users, Search, Menu, X, ChevronRight, 
  ThumbsUp, MessageCircle, Share2, Flag, CheckCircle, Clock, Shield, 
  Filter, Plus, User, LogOut, ArrowLeft, Heart, Briefcase, Bell, 
  Calendar, Download, BarChart2, FileText, Smartphone, Camera, 
  Award, ExternalLink, Globe, LayoutDashboard, Activity, CheckSquare, AlertOctagon, Video,
  Navigation, Edit, Trophy, Medal, Star, Zap, Mail, Info, BookOpen, PhoneCall, Copy, Reply,
  Facebook, Twitter, Link as LinkIcon
} from 'lucide-react';
import { createReport, fetchReports, mapReportRowToPost, updateReport, uploadEvidence } from './lib/reports';
import { signIn, signOut, signUp, getCurrentUser, onAuthStateChange, updateMyProfile, listProfiles, signInWithProvider } from './lib/auth';
import { listComments, createComment, updateComment as updateCommentRecord, deleteComment as deleteCommentRecord } from './lib/comments';
import { toggleVote, toggleVouch, flagReport } from './lib/engagement';
import { listChapters, createChapter, joinChapter, listMyChapterIds } from './lib/chapters';
import { subscribe as subscribeAlerts, unsubscribe as unsubscribeAlerts, listSubscriptions } from './lib/alerts';
import { listNotifications, createNotification } from './lib/notifications';
import { listResourceLinks, DEFAULT_RESOURCES } from './lib/resources';
import { deleteReportAdmin, verifyReportAdmin, resolveReportAdmin, updateUserStatusAdmin } from './lib/admin';

/* -------------------------------------------------------------------------- */
/* MOCK DATA & CONFIG                                 */
/* -------------------------------------------------------------------------- */

const STATES = [
  { id: 'MH', name: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'], coords: { x: 28, y: 58 }, geoCoords: [75.7139, 19.7515], severity: 'high', stats: { scam: 45, cleanliness: 80, bribe: 20, volunteer: 15 } },
  { id: 'KA', name: 'Karnataka', cities: ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru'], coords: { x: 32, y: 78 }, geoCoords: [75.7139, 15.3173], severity: 'med', stats: { scam: 60, cleanliness: 40, bribe: 15, volunteer: 30 } },
  { id: 'DL', name: 'Delhi NCR', cities: ['New Delhi', 'Gurgaon', 'Noida', 'Faridabad'], coords: { x: 35, y: 28 }, geoCoords: [77.1025, 28.7041], severity: 'high', stats: { scam: 55, cleanliness: 90, bribe: 35, volunteer: 25 } },
  { id: 'TN', name: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Salem'], coords: { x: 38, y: 88 }, geoCoords: [78.6569, 11.1271], severity: 'med', stats: { scam: 30, cleanliness: 50, bribe: 10, volunteer: 40 } },
  { id: 'UP', name: 'Uttar Pradesh', cities: ['Lucknow', 'Agra', 'Varanasi', 'Kanpur'], coords: { x: 50, y: 32 }, geoCoords: [80.9462, 26.8467], severity: 'high', stats: { scam: 25, cleanliness: 85, bribe: 45, volunteer: 10 } },
  { id: 'WB', name: 'West Bengal', cities: ['Kolkata', 'Darjeeling', 'Siliguri'], coords: { x: 75, y: 48 }, geoCoords: [87.8550, 22.9868], severity: 'med', stats: { scam: 40, cleanliness: 60, bribe: 25, volunteer: 20 } },
  { id: 'GJ', name: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'], coords: { x: 20, y: 45 }, geoCoords: [71.1924, 22.2587], severity: 'med', stats: { scam: 35, cleanliness: 45, bribe: 15, volunteer: 25 } },
  { id: 'RJ', name: 'Rajasthan', cities: ['Jaipur', 'Udaipur', 'Jodhpur', 'Kota'], coords: { x: 25, y: 35 }, geoCoords: [74.2179, 27.0238], severity: 'low', stats: { scam: 20, cleanliness: 35, bribe: 20, volunteer: 15 } },
  { id: 'KL', name: 'Kerala', cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode'], coords: { x: 32, y: 92 }, geoCoords: [76.2711, 10.8505], severity: 'low', stats: { scam: 15, cleanliness: 25, bribe: 5, volunteer: 50 } },
  { id: 'TS', name: 'Telangana', cities: ['Hyderabad', 'Warangal'], coords: { x: 38, y: 65 }, geoCoords: [79.0193, 18.1124], severity: 'med', stats: { scam: 50, cleanliness: 45, bribe: 20, volunteer: 30 } },
  { id: 'MP', name: 'Madhya Pradesh', cities: ['Bhopal', 'Indore', 'Gwalior'], coords: { x: 40, y: 48 }, geoCoords: [78.6569, 22.9734], severity: 'low', stats: { scam: 25, cleanliness: 40, bribe: 25, volunteer: 10 } },
  { id: 'PB', name: 'Punjab', cities: ['Ludhiana', 'Amritsar', 'Chandigarh'], coords: { x: 30, y: 20 }, geoCoords: [75.3412, 31.1471], severity: 'med', stats: { scam: 30, cleanliness: 30, bribe: 15, volunteer: 20 } },
  { id: 'HR', name: 'Haryana', cities: ['Gurugram', 'Faridabad', 'Panipat'], coords: { x: 32, y: 25 }, geoCoords: [76.0856, 29.0588], severity: 'high', stats: { scam: 40, cleanliness: 50, bribe: 30, volunteer: 15 } },
  { id: 'BR', name: 'Bihar', cities: ['Patna', 'Gaya', 'Bhagalpur'], coords: { x: 58, y: 38 }, geoCoords: [85.3131, 25.0961], severity: 'high', stats: { scam: 35, cleanliness: 70, bribe: 50, volunteer: 10 } },
  { id: 'AP', name: 'Andhra Pradesh', cities: ['Visakhapatnam', 'Vijayawada'], coords: { x: 42, y: 72 }, geoCoords: [79.7400, 15.9129], severity: 'med', stats: { scam: 30, cleanliness: 45, bribe: 20, volunteer: 25 } },
  { id: 'OD', name: 'Odisha', cities: ['Bhubaneswar', 'Cuttack'], coords: { x: 60, y: 55 }, geoCoords: [85.0985, 20.9517], severity: 'low', stats: { scam: 20, cleanliness: 40, bribe: 15, volunteer: 15 } },
  { id: 'JH', name: 'Jharkhand', cities: ['Ranchi', 'Jamshedpur'], coords: { x: 55, y: 45 }, geoCoords: [85.3096, 23.6102], severity: 'med', stats: { scam: 25, cleanliness: 55, bribe: 30, volunteer: 10 } },
  { id: 'CG', name: 'Chhattisgarh', cities: ['Raipur', 'Bhilai'], coords: { x: 48, y: 52 }, geoCoords: [81.8661, 21.2787], severity: 'low', stats: { scam: 15, cleanliness: 35, bribe: 20, volunteer: 10 } },
  { id: 'AS', name: 'Assam', cities: ['Guwahati', 'Silchar'], coords: { x: 85, y: 35 }, geoCoords: [92.9376, 26.2006], severity: 'med', stats: { scam: 20, cleanliness: 40, bribe: 15, volunteer: 15 } },
  { id: 'UK', name: 'Uttarakhand', cities: ['Dehradun', 'Haridwar'], coords: { x: 42, y: 22 }, geoCoords: [79.0193, 30.0668], severity: 'low', stats: { scam: 15, cleanliness: 25, bribe: 10, volunteer: 30 } },
  { id: 'HP', name: 'Himachal Pradesh', cities: ['Shimla', 'Dharamshala'], coords: { x: 38, y: 18 }, geoCoords: [77.1734, 31.1048], severity: 'low', stats: { scam: 10, cleanliness: 20, bribe: 5, volunteer: 25 } },
  { id: 'JK', name: 'Jammu & Kashmir', cities: ['Srinagar', 'Jammu'], coords: { x: 32, y: 10 }, geoCoords: [74.7973, 33.7782], severity: 'med', stats: { scam: 15, cleanliness: 30, bribe: 10, volunteer: 10 } },
  { id: 'GA', name: 'Goa', cities: ['Panaji'], coords: { x: 26, y: 72 }, geoCoords: [74.1240, 15.2993], severity: 'low', stats: { scam: 25, cleanliness: 15, bribe: 10, volunteer: 40 } },
];

const INITIAL_POSTS = [];
const MOCK_USERS = [
  {
    id: 'admin_master',
    name: 'Super Admin',
    email: 'admin@indiaact.org',
    role: 'admin',
    status: 'active',
    joinedDate: 'Jan 2024',
    points: 10000,
    city: 'New Delhi',
    phone: '9999999999'
  }
];

const BADGE_DEFINITIONS = [
  { id: 'verified', label: 'Verified Reporter', icon: Shield, desc: '5+ Verified Reports', color: 'text-blue-600 bg-blue-50', border: 'border-blue-100' },
  { id: 'hero', label: 'City Hero', icon: Trophy, desc: 'Top 1% Contributor', color: 'text-yellow-600 bg-yellow-50', border: 'border-yellow-100' },
  { id: 'whistle', label: 'Whistleblower', icon: AlertTriangle, desc: 'Exposed Major Issue', color: 'text-red-600 bg-red-50', border: 'border-red-100' },
  { id: 'eco', label: 'Eco Warrior', icon: Trash2, desc: '10+ Cleanliness Drives', color: 'text-green-600 bg-green-50', border: 'border-green-100' },
  { id: 'leader', label: 'Community Leader', icon: Users, desc: 'Organized 5 Drives', color: 'text-purple-600 bg-purple-50', border: 'border-purple-100' },
];

const MONTHLY_HEROES = [];
const IMPROVED_AREAS = [];

const CATEGORIES = [
  { id: 'scam', label: 'Scam Alert', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  { id: 'bribe', label: 'Report Bribe', icon: Briefcase, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  { id: 'cleanliness', label: 'Cleanliness', icon: Trash2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  { id: 'volunteer', label: 'Volunteer Drive', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
];

// Helper to generate mock drill-down data
const getDrillDownItems = (level) => {
  if (level === 'country') return STATES;
  return [];
};

const CIVIC_DATA = {
  general: {
    emergency: '112',
    police: '100',
    fire: '101',
    ambulance: '102',
    women: '1091',
    child: '1098'
  },
  knowYourRights: [
    { 
        title: 'During a Police Encounter', 
        icon: Shield,
        points: [
            'You have the right to know the reason for your arrest and see the warrant (unless it\'s a cognizable offense).',
            'A woman cannot be arrested after sunset and before sunrise, except in exceptional cases with a magistrate\'s permission.',
            'You have the right to inform a family member or friend of your arrest.',
            'You are entitled to free legal aid from the Legal Services Authority.'
        ]
    },
    {
        title: 'As a Consumer',
        icon: Briefcase,
        points: [
            'Right to Safety: Protection from hazardous goods.',
            'Right to Information: About quality, quantity, and price.',
            'Right to Choose: Access to a variety of goods at competitive prices.',
            'Right to Redressal: To seek compensation for unfair trade practices.'
        ]
    }
  ],
  categories: {
    scam: {
      title: 'Cyber Fraud & Scams',
      steps: [
        'Do not delete the suspicious message/email.',
        'Take screenshots of the transaction/chat.',
        'Call 1930 immediately (National Cyber Crime Helpline).',
        'File a complaint at cybercrime.gov.in within 24 hours.'
      ],
      links: [
        { label: 'National Cyber Crime Portal', url: 'https://cybercrime.gov.in' },
        { label: 'RBI Ombudsman', url: 'https://cms.rbi.org.in' }
      ]
    },
    bribe: {
      title: 'Corruption & Bribery',
      steps: [
        'Do not pay the bribe if possible.',
        'Record audio/video evidence discreetly.',
        'Note down the officer\'s name and designation.',
        'Contact the Anti-Corruption Bureau (ACB) of your state.'
      ],
      links: [
        { label: 'Central Vigilance Commission', url: 'https://portal.cvc.gov.in' },
        { label: 'IPaidABribe (Reporting)', url: 'https://www.ipaidabribe.com' }
      ],
      rti: true
    },
    cleanliness: {
      title: 'Garbage & Sanitation',
      steps: [
        'Take a clear photo with geotag.',
        'Post on Swachhata App (MoHUA).',
        'Tag your local municipality on Twitter (X).',
        'File a grievance on CPGRAMS if unresolved.'
      ],
      links: [
        { label: 'Swachhata App (Android)', url: 'https://play.google.com/store/apps/details?id=com.ichangemycity.swachhbharat' },
        { label: 'CPGRAMS Grievance', url: 'https://pgportal.gov.in' }
      ]
    },
    volunteer: {
      title: 'Community Drives',
      steps: [
        'Ensure safety gear (gloves, masks) is used.',
        'Obtain necessary permissions for large gatherings.',
        'Dispose of collected waste at designated municipal points.'
      ],
      links: [
        { label: 'UN Volunteers India', url: 'https://www.in.undp.org' }
      ]
    }
  },
  rti: {
    title: 'Right to Information (RTI)',
    desc: 'Use RTI to demand answers from government departments about stalled work or funds utilization.',
    template: `To,\nThe Public Information Officer (PIO),\n[Department Name], [City].\n\nSubject: Request for Information under RTI Act, 2005.\n\nRespected Sir/Madam,\nI, [Your Name], a citizen of India, request the following details regarding [Issue Description] at [Location]:\n1. Current status of the work.\n2. Name and designation of the officer responsible.\n3. Timeline for completion as per official records.\n\nI am attaching the application fee of Rs. 10/-.\n\nSincerely,\n[Your Name]\n[Date]`
  },
  voterInfo: {
    title: 'Voter & Election Information',
    desc: 'Your vote is your voice. Ensure you are registered and well-informed before every election.',
    links: [
        { label: 'National Voters\' Services Portal', url: 'https://voters.eci.gov.in/' },
        { label: 'Check Your Name in Electoral Roll', url: 'https://electoralsearch.eci.gov.in/' },
        { label: 'Register as a New Voter (Form 6)', url: 'https://voters.eci.gov.in/frm6' }
    ]
  },
  cityHelplines: {
    'Mumbai': { police: '100 / 022-22620111', disaster: '1916 (BMC)', municipal: 'MyBMC (Twitter: @mybmc)', cyber: '022-26504008' },
    'Bengaluru': { police: '100 / 080-22942222', disaster: '080-22221188', municipal: '080-22660000 (BBMP)', cyber: '080-22375522' },
    'New Delhi': { police: '100 / 011-23469526', disaster: '1077', municipal: '155304 (MCD)', cyber: '011-20892111' },
    'Chennai': { police: '100 / 044-28447200', disaster: '1913', municipal: '1913 (GCC)', cyber: '044-23452348' },
    'Kolkata': { police: '100 / 033-22143230', disaster: '1070', municipal: '1800-345-3375 (KMC)', cyber: '033-22143000' },
    'Hyderabad': { police: '100 / 040-27852435', disaster: '040-21111111', municipal: '040-21111111 (GHMC)', cyber: '1930' },
    'Pune': { police: '100 / 020-26126296', disaster: '1077', municipal: '1800-103-0222 (PMC)', cyber: '020-29710097' },
    'Ahmedabad': { police: '100 / 079-25630100', disaster: '1077', municipal: '155303 (AMC)', cyber: '100' },
    'Jaipur': { police: '100 / 0141-2374400', disaster: '1070', municipal: '0141-2742900 (JMC)', cyber: '1930' },
    'Lucknow': { police: '112', disaster: '1070', municipal: '1533 (LMC)', cyber: '1930' },
    'Chandigarh': { police: '112', disaster: '1077', municipal: '0172-2787200 (MC)', cyber: '1930' }
  },
  safetyTips: [
    {
      title: 'Digital Safety',
      icon: Smartphone,
      tips: [
        'Enable 2-Factor Authentication (2FA) on all accounts.',
        'Never share OTPs or UPI PINs with anyone.',
        'Check URL legitimacy before clicking links (look for https).',
        'Use strong, unique passwords for banking apps.'
      ]
    },
    {
      title: 'Women Safety',
      icon: Heart,
      tips: [
        'Share live location with trusted contacts during travel.',
        'Use 112 India App for emergency SOS.',
        'Be aware of "Zero FIR" - you can file an FIR at any police station regardless of jurisdiction.',
        'Carry pepper spray or safety alarms if travelling alone at night.'
      ]
    }
  ]
};

/* -------------------------------------------------------------------------- */
/* UTILS                                                                      */
/* -------------------------------------------------------------------------- */

// Auto-masking utility for privacy safety
const maskSensitiveData = (text) => {
  // Regex to find 10 digit Indian mobile numbers
  const phoneRegex = /[6-9]\d{9}/g;
  return text.replace(phoneRegex, (match) => match.substring(0, 2) + 'XXXXX' + match.substring(7));
};

const getTrustScore = (vouchCount, evidence) => {
  if (vouchCount > 20 || (vouchCount > 5 && evidence)) return 'High';
  if (vouchCount > 5) return 'Med';
  return 'Low';
};

const Spinner = ({ size = 20, className = '' }) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width={size}
    height={size}
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

/* -------------------------------------------------------------------------- */
/* SHARED COMPONENTS                                                          */
/* -------------------------------------------------------------------------- */

const FeatureInfo = ({ title, content, className = "" }) => {
  const [show, setShow] = useState(false);

  return (
    <div className={`inline-flex items-center ml-2 align-middle ${className}`}>
      <button 
        onClick={(e) => { e.stopPropagation(); setShow(!show); }}
        className="text-gray-400 hover:text-[#0071e3] transition-colors p-1 rounded-full hover:bg-blue-50"
        title="Learn more"
      >
        <Info size={16} />
      </button>
      {show && (
        <>
          <div className="fixed inset-0 z-100 bg-black/20 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); setShow(false); }}></div>
          <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-101 w-[90vw] max-w-xs bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 animate-in fade-in zoom-in-95 text-left">
             <div className="flex justify-between items-start mb-3">
               <h4 className="font-bold text-[#1d1d1f] text-base flex items-center gap-2">
                 <Info size={18} className="text-[#0071e3]" /> {title}
               </h4>
               <button onClick={(e) => { e.stopPropagation(); setShow(false); }} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"><X size={18} /></button>
             </div>
             <p className="text-sm text-[#86868b] leading-relaxed font-medium">{content}</p>
          </div>
        </>
      )}
    </div>
  );
};

const Badge = ({ children, className }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium uppercase tracking-wider ${className}`}>
    {children}
  </span>
);

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, disabled = false, loading = false }) => {
  const baseStyle = "flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed text-sm tracking-tight";
  const variants = {
    primary: "bg-[#0071e3] text-white hover:bg-[#0077ed] shadow-sm",
    secondary: "bg-[#e8e8ed] text-[#1d1d1f] hover:bg-[#d2d2d7]",
    danger: "bg-[#ff3b30] text-white hover:bg-[#ff453a]",
    ghost: "bg-transparent text-[#0071e3] hover:bg-[#f5f5f7]",
    outline: "border border-[#86868b] text-[#1d1d1f] hover:border-[#1d1d1f] bg-transparent",
    whatsapp: "bg-[#25D366] text-white hover:bg-[#128C7E]"
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} disabled={disabled || loading}>
      {loading && <Spinner size={18} />}
      {!loading && Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const Toast = ({ message, type = 'success', onClose }) => (
  <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce-in z-100 backdrop-blur-md
    ${type === 'error' ? 'bg-red-900 text-white' : 'bg-gray-900 text-white'}`}>
    <div className={`${type === 'error' ? 'bg-red-500' : 'bg-green-500'} rounded-full p-1`}>
      {type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
    </div>
    <p className="text-sm font-medium">{message}</p>
    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={18} /></button>
  </div>
);

const GlobalBanner = ({ message }) => {
  if (!message) return null;
  return (
    <div className="bg-indigo-600 text-white text-center py-2 px-4 text-sm font-medium animate-in slide-in-from-top">
      <span className="inline-block mr-2">📢</span> {message}
    </div>
  );
};

const CivicResourcesPage = () => {
  const [selectedCity, setSelectedCity] = useState('New Delhi');
  const [activeCategory, setActiveCategory] = useState('scam');

  const cityData = CIVIC_DATA.cityHelplines[selectedCity] || CIVIC_DATA.cityHelplines['New Delhi'];
  const categoryData = CIVIC_DATA.categories[activeCategory];

  return (
    <div className="max-w-245 mx-auto py-12 px-6">
       {/* Motivational Banner */}
       <div className="p-0.75 rounded-4xl bg-linear-to-r from-orange-500 via-white to-green-500 mb-12 shadow-2xl">
       <div className="bg-linear-to-r from-[#1d1d1f] to-[#434344] rounded-[30px] p-8 md:p-12 text-white relative overflow-hidden h-full">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="relative z-10 max-w-3xl">
             <Badge className="bg-white/20 text-white border-none mb-6 backdrop-blur-md">Be The Change</Badge>
             <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight tracking-tight">
                We have to fix our own problems.<br/>
                <span className="text-blue-300">No one else will do it for us.</span>
             </h1>
             <p className="text-lg md:text-xl text-gray-300 font-medium leading-relaxed">Stop complaining and start acting. Your country needs you. Your city needs you. Stand up, speak out, and let's build a cleaner, safer world together.</p>
          </div>
       </div>
       </div>

       {/* Header */}
       <div className="mb-10">
         <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">Helpful Resources & Guide</h1>
         <p className="text-[#86868b]">What you need to know to take action.</p>
       </div>

       {/* Emergency Numbers */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {Object.entries(CIVIC_DATA.general).map(([key, val]) => (
             <div key={key} className="bg-red-50 p-4 rounded-2xl border border-red-100 text-center">
                <div className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">{key}</div>
                <div className="text-2xl font-bold text-red-900">{val}</div>
             </div>
          ))}
       </div>

       {/* Know Your Rights */}
       <div className="mb-12">
         <h2 className="text-xl font-bold text-[#1d1d1f] mb-6">Know Your Rights</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {CIVIC_DATA.knowYourRights.map(section => (
             <div key={section.title} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                   <section.icon size={20} className="text-gray-600" />
                 </div>
                 <h3 className="font-semibold text-[#1d1d1f]">{section.title}</h3>
               </div>
               <ul className="space-y-2 text-sm text-[#86868b]">
                 {section.points.map((point, i) => (
                   <li key={i} className="flex gap-2">
                     <CheckCircle size={14} className="text-green-500 shrink-0 mt-1" />
                     <span>{point}</span>
                   </li>
                 ))}
               </ul>
             </div>
           ))}
         </div>
       </div>

       {/* Safety Tips */}
       <div className="mb-12">
         <h2 className="text-xl font-bold text-[#1d1d1f] mb-6">Essential Safety Tips</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {CIVIC_DATA.safetyTips.map(section => (
             <div key={section.title} className="bg-blue-50 p-6 rounded-3xl border border-blue-100 shadow-sm">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm">
                   <section.icon size={20} />
                 </div>
                 <h3 className="font-semibold text-[#1d1d1f]">{section.title}</h3>
               </div>
               <ul className="space-y-2 text-sm text-[#86868b]">
                 {section.tips.map((tip, i) => (
                   <li key={i} className="flex gap-2 items-start">
                     <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                     <span>{tip}</span>
                   </li>
                 ))}
               </ul>
             </div>
           ))}
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar / Tabs for Categories */}
          <div className="space-y-2">
             <h3 className="font-bold text-[#1d1d1f] mb-4 px-2">How to Report</h3>
             {Object.entries(CIVIC_DATA.categories).map(([key, data]) => (
                <button 
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeCategory === key ? 'bg-[#1d1d1f] text-white shadow-lg' : 'bg-white text-[#86868b] hover:bg-[#f5f5f7]'}`}
                >
                  {data.title}
                </button>
             ))}
             <button 
                onClick={() => setActiveCategory('rti')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeCategory === 'rti' ? 'bg-[#1d1d1f] text-white shadow-lg' : 'bg-white text-[#86868b] hover:bg-[#f5f5f7]'}`}
             >
                Right to Information (RTI)
             </button>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-2">
             <div className="bg-white rounded-[30px] p-8 shadow-sm border border-gray-100 min-h-100">
                {activeCategory === 'rti' ? (
                   <div>
                      <h3 className="text-2xl font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
                         <FileText className="text-[#0071e3]" /> {CIVIC_DATA.rti.title}
                      </h3>
                      <p className="text-[#86868b] mb-6">{CIVIC_DATA.rti.desc}</p>
                      <div className="bg-[#f5f5f7] p-6 rounded-2xl font-mono text-sm text-[#1d1d1f] whitespace-pre-wrap">
                         {CIVIC_DATA.rti.template}
                      </div>
                   </div>
                ) : (
                   <div>
                      <h3 className="text-2xl font-bold text-[#1d1d1f] mb-6 flex items-center gap-2">
                         <Shield className="text-[#0071e3]" /> {categoryData.title}
                      </h3>
                      
                      <div className="space-y-6">
                         <div>
                            <h4 className="font-semibold text-[#1d1d1f] mb-3">Steps to take</h4>
                            <ul className="space-y-3">
                               {categoryData.steps.map((step, i) => (
                                  <li key={i} className="flex gap-3 text-sm text-[#86868b]">
                                     <span className="shrink-0 w-6 h-6 bg-[#e8e8ed] text-[#1d1d1f] rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                     {step}
                                  </li>
                               ))}
                            </ul>
                         </div>

                         <div>
                            <h4 className="font-semibold text-[#1d1d1f] mb-3">Official Links</h4>
                            <div className="flex flex-wrap gap-3">
                               {categoryData.links.map((link, i) => (
                                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#f5f5f7] rounded-full text-sm font-medium text-[#0071e3] hover:bg-[#e8e8ed] transition-colors">
                                     {link.label} <ExternalLink size={14} />
                                  </a>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                )}
             </div>
          </div>
       </div>

       {/* Voter Information */}
       <div className="my-12">
          <div className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-sm">
             <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">{CIVIC_DATA.voterInfo.title}</h3>
             <p className="text-[#86868b] text-sm mb-6">{CIVIC_DATA.voterInfo.desc}</p>
             <div className="flex flex-wrap gap-3">
                {CIVIC_DATA.voterInfo.links.map((link, i) => (
                   <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#f5f5f7] rounded-full text-sm font-medium text-[#0071e3] hover:bg-[#e8e8ed] transition-colors">
                      {link.label} <ExternalLink size={14} />
                   </a>
                ))}
             </div>
          </div>
       </div>

       {/* City Helplines */}
       <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-xl font-bold text-[#1d1d1f]">City Helplines</h3>
             <select 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 cursor-pointer"
             >
                {Object.keys(CIVIC_DATA.cityHelplines).map(c => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <div className="text-xs font-bold text-[#86868b] uppercase mb-1">Police</div>
                <div className="text-lg font-mono font-bold text-[#1d1d1f]">{cityData.police}</div>
             </div>
             <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <div className="text-xs font-bold text-[#86868b] uppercase mb-1">Disaster Mgmt</div>
                <div className="text-lg font-mono font-bold text-[#1d1d1f]">{cityData.disaster}</div>
             </div>
             <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <div className="text-xs font-bold text-[#86868b] uppercase mb-1">Municipal Corp</div>
                <div className="text-lg font-mono font-bold text-[#1d1d1f]">{cityData.municipal}</div>
             </div>
             <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <div className="text-xs font-bold text-[#86868b] uppercase mb-1">Cyber Crime</div>
                <div className="text-lg font-mono font-bold text-[#1d1d1f]">{cityData.cyber}</div>
             </div>
          </div>
       </div>
    </div>
  );
};

const PointsBreakdown = () => {
  const pointCategories = [
    {
      category: 'Reporting & Verification',
      items: [
        { action: 'File a new report', points: '+10', detail: 'For every valid issue you report.' },
        { action: 'Report gets a vouch', points: '+5', detail: 'Each time another user vouches for your report (max 25 pts).' },
        { action: 'Report is verified by a moderator', points: '+25', detail: 'When a moderator confirms your report is legitimate.' },
        { action: 'Issue gets resolved', points: '+50', detail: 'When an issue you reported is successfully resolved.' },
      ],
    },
    {
      category: 'Community & Drives',
      items: [
        { action: 'Join a volunteer drive', points: '+30', detail: 'For participating in a scheduled cleanup or event.' },
        { action: 'Organize a successful drive', points: '+200', detail: 'For creating and leading a drive that resolves an issue.' },
        { action: 'Vouch for another user\'s report', points: '+2', detail: 'To encourage community verification (max 10 pts/day).' },
      ],
    },
    {
      category: 'Bonuses & Multipliers',
      items: [
        { action: 'Whistleblower Bonus', points: '+100', detail: 'For bribe/corruption reports that get verified.' },
        { action: 'High-Impact Multiplier', points: '2x', detail: 'Resolution points are doubled for issues marked as "High Impact".' },
        { action: 'Weekly Streak', points: '+50', detail: 'Report at least one issue every day for 7 days.' },
      ],
    },
    {
      category: 'Chapter Points',
      items: [
        { action: 'Member Contribution', points: 'Sum', detail: 'A chapter\'s score is the sum of all its members\' scores.' },
        { action: 'Host a Verified Drive', points: '+500', detail: 'Awarded to the chapter for organizing a successful drive.' },
        { action: 'Win a Live Challenge', points: '+2000', detail: 'Bonus points for winning inter-chapter competitions.' },
      ],
    },
  ];

  return (
    <div className="bg-white rounded-[30px] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100 my-12">
      <div className="p-8">
        <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-1 flex items-center gap-2">
          <Trophy size={22} className="text-yellow-500" />
          How Civic Points Work
        </h2>
        <p className="text-[#86868b] text-sm mb-6">Earn points by contributing to your community. Here's the breakdown:</p>
        
        <div className="space-y-8">
          {pointCategories.map(cat => (
            <div key={cat.category}>
              <h3 className="font-semibold text-lg text-[#1d1d1f] mb-4 pb-2 border-b border-gray-100">{cat.category}</h3>
              <div className="space-y-4">
                {cat.items.map(item => (
                  <div key={item.action} className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-[#1d1d1f]">{item.action}</p>
                      <p className="text-xs text-[#86868b]">{item.detail}</p>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <span className={`font-bold text-lg ${item.points.includes('+') ? 'text-green-600' : 'text-blue-600'}`}>{item.points}</span>
                      <p className="text-xs text-gray-400">Points</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Interactive Map Component
const IndiaMapVisual = ({ items, onRegionSelect, filter, heatmapMode, level, focusRegion }) => {
  // Helper to control map zoom/pan programmatically
  const MapController = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
      map.flyTo(center, zoom, { duration: 1.5 });
    }, [center, zoom, map]);
    return null;
  };

  const getPinColor = (state) => {
    if (heatmapMode) {
      if (state.severity === 'high') return '#EF4444'; // red-500
      if (state.severity === 'med') return '#F97316'; // orange-500
      return '#22C55E'; // green-500
    }
    // Filter based colors
    if (filter === 'scam') return '#F97316';
    if (filter === 'cleanliness') return '#22C55E';
    if (filter === 'bribe') return '#EF4444';
    if (filter === 'volunteer') return '#3B82F6';
    return '#3B82F6';
  };

  // Determine center and zoom based on level
  const mapCenter = focusRegion 
    ? [focusRegion.geoCoords[1], focusRegion.geoCoords[0]] // Leaflet uses [Lat, Lng]
    : [22.5937, 78.9629]; // India Center
  
  const mapZoom = level === 'country' ? 5 : level === 'state' ? 7 : 10;

  return (
    <div className="relative w-full aspect-4/3 bg-slate-100 rounded-[30px] overflow-hidden border border-gray-200 shadow-inner z-0">
      {/* Inline style to force Leaflet container height */}
      <style>{`.leaflet-container { height: 100%; width: 100%; background: transparent; }`}</style>
      
      <MapContainer 
        center={[22.5937, 78.9629]} 
        zoom={5} 
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <MapController center={mapCenter} zoom={mapZoom} />

        {items.map((item) => (
          <CircleMarker 
            key={item.id}
            center={[item.geoCoords[1], item.geoCoords[0]]} // [Lat, Lng]
            radius={heatmapMode ? 15 : 8}
            pathOptions={{ 
              color: 'white', 
              weight: 2, 
              fillColor: getPinColor(item), 
              fillOpacity: heatmapMode ? 0.6 : 0.9 
            }}
            eventHandlers={{
              click: () => onRegionSelect(item),
              mouseover: (e) => e.target.openTooltip(),
              mouseout: (e) => e.target.closeTooltip(),
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} className="font-bold text-xs">
              {item.name}
              {filter !== 'all' && <span className="block font-normal text-gray-500">{item.stats?.[filter] || 0} reports</span>}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-3 rounded-xl text-xs text-gray-600 border border-gray-200 shadow-sm z-20">
        <div className="font-bold mb-1">Map Legend</div>
        {heatmapMode ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_red]"></div> High Severity</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_5px_orange]"></div> Medium Severity</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_green]"></div> Low Severity</div>
          </div>
        ) : (
          <div>Click a pin to explore {level === 'country' ? 'State' : level === 'state' ? 'City' : 'Area'}</div>
        )}
      </div>
    </div>
  );
};

const BrandLogo = ({ size = 'md', className = '' }) => {
  const [loadError, setLoadError] = useState(false);
  const sizeClass = size === 'sm' ? 'h-12' : size === 'lg' ? 'h-28' : 'h-16';

  if (loadError) {
    return (
      <div className={`font-bold tracking-tight text-gray-900 ${className}`}>
        ACT INDIA
      </div>
    );
  }

  return (
    <img
      src="/act-india-logo.png"
      alt="Act India logo"
      className={`${sizeClass} w-auto object-contain mix-blend-multiply ${className}`}
      onError={() => setLoadError(true)}
    />
  );
};

// Navbar
const Navbar = ({ onViewChange, currentView, user, onLoginClick, notifications, showNotifications, setShowNotifications }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 transition-all duration-300">
      <div className="max-w-245 mx-auto px-4 h-16 md:h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center cursor-pointer" onClick={() => onViewChange('home')}>
            <BrandLogo size="sm" />
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-normal text-[#1d1d1f]/80">
          <button onClick={() => onViewChange('home')} className={`transition-colors hover:text-[#1d1d1f] ${currentView === 'home' ? 'text-[#1d1d1f] font-medium' : ''}`}>Home</button>
          <button onClick={() => onViewChange('explore')} className={`transition-colors hover:text-[#1d1d1f] ${currentView === 'explore' ? 'text-[#1d1d1f] font-medium' : ''}`}>Map</button>
          <button onClick={() => onViewChange('chapters')} className={`transition-colors hover:text-[#1d1d1f] ${currentView === 'chapters' ? 'text-[#1d1d1f] font-medium' : ''}`}>Chapters</button>
          <button onClick={() => onViewChange('leaderboard')} className={`transition-colors hover:text-[#1d1d1f] ${currentView === 'leaderboard' ? 'text-[#1d1d1f] font-medium' : ''}`}>Leaderboard</button>
          <button onClick={() => onViewChange('impact')} className={`transition-colors hover:text-[#1d1d1f] ${currentView === 'impact' ? 'text-[#1d1d1f] font-medium' : ''}`}>Impact</button>
          <button onClick={() => onViewChange('resources')} className={`transition-colors hover:text-[#1d1d1f] ${currentView === 'resources' ? 'text-[#1d1d1f] font-medium' : ''}`}>Resources</button>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100">
            <Globe size={14} /> EN
          </button>

          {user && (
            <div className="relative">
              <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 relative transition-colors" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={20} />
                {notifications.some(n => !n.read) && <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden z-60 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(n => (
                      <div key={n.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`}>
                        <p className="text-sm text-gray-800 leading-snug mb-1">{n.text}</p>
                        <p className="text-xs text-gray-400">{n.time}</p>
                      </div>
                    )) : <div className="p-8 text-center text-gray-400 text-sm">No new alerts.</div>}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <button onClick={() => onViewChange('dashboard')} className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm hover:ring-blue-200 transition-all">
                {user.name.charAt(0)}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={onLoginClick} className="py-1! px-3! text-xs">Login</Button>
              <Button variant="primary" onClick={() => onViewChange('signup')} className="py-1! px-3! text-xs">Sign Up</Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-xl z-40 animate-in slide-in-from-top-5">
          <div className="flex flex-col p-4 space-y-2">
            {['home', 'explore', 'chapters', 'leaderboard', 'impact', 'resources'].map((item) => (
              <button 
                key={item}
                onClick={() => { onViewChange(item); setIsMenuOpen(false); }}
                className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-in-out capitalize ${currentView === item ? 'bg-blue-50 text-blue-700 translate-x-2 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:translate-x-1'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

// Hero Component
const Hero = ({ onViewChange }) => (
  <div className="max-w-245 mx-auto py-12 px-6">
    <div className="p-0.75 rounded-4xl bg-linear-to-r from-orange-500 via-white to-green-500 mb-12 shadow-2xl">
      <div className="bg-[#1d1d1f] rounded-[30px] p-10 md:p-16 text-white text-center relative overflow-hidden h-full">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
      
      <div className="relative z-10">
        <Badge className="bg-blue-500/20 text-blue-300 border-none mb-6 inline-flex items-center gap-1 px-3 py-1">
          <span className="text-sm">🇮🇳</span> Live in India
        </Badge>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-6 leading-tight">
          Fix Your City. <br className="hidden md:block"/>
          <span className="text-[#86868b]">Made Simple.</span>
        </h1>
        <p className="text-xl md:text-2xl font-medium text-[#86868b] mb-10 max-w-2xl mx-auto leading-relaxed">
          Turn complaints into real solutions. <br/>
          <span className="text-white/80">Your voice + Our help = A Cleaner India.</span>
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="primary" className="w-full sm:w-auto px-8 py-3 text-[17px]" onClick={() => onViewChange('explore')}>
            Explore Map
          </Button>
          <Button variant="outline" className="w-full sm:w-auto px-8 py-3.5 text-base border-[#86868b] text-white hover:bg-[#333] hover:border-[#333]" onClick={() => onViewChange('create')}>
            Report Incident
          </Button>
        </div>
      </div>
    </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
      {CATEGORIES.map((cat) => (
        <div key={cat.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer group" onClick={() => onViewChange('create')}>
          <cat.icon className={`mb-4 text-[#1d1d1f] group-hover:scale-110 transition-transform`} size={32} />
          <h3 className="font-semibold text-[#1d1d1f] text-lg">{cat.label}</h3>
          <p className="text-xs text-[#86868b] mt-2 flex items-center gap-1 group-hover:gap-2 transition-all">Report now <ArrowLeft size={10} className="rotate-180" /></p>
        </div>
      ))}
    </div>
  </div>
);

const HERO_DATA = {
  name: '',
  city: '',
  avatar: '',
  role: '',
  description: '',
  points: 0,
  weeklyPoints: 0,
  stats: { resolved: 0, drives: 0, volunteers: 0 },
  drives: []
};

const CITY_OF_WEEK = {
  name: '',
  state: '',
  score: 0,
  badge: '',
  description: '',
  image: '',
  stats: { points: '0', movements: 0, impacts: 'Low' }
};

const STATE_OF_WEEK = {
  name: '',
  score: 0,
  badge: '',
  description: '',
  image: '',
  stats: { points: '0', movements: 0, impacts: 'Low' }
};

const HeroDetailsModal = ({ hero, onClose }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-200 flex items-center justify-center p-4 animate-in fade-in">
    <div className="bg-white rounded-[30px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
      <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Trophy size={18} className="text-yellow-500" /> Hero Impact Journey
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
      </div>
      
      <div className="p-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-3xl font-bold text-orange-600 border-4 border-white shadow-lg">
            {hero.avatar}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{hero.name}</h2>
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <MapPin size={14} /> {hero.city} • {hero.role}
            </div>
            <div className="flex gap-4 text-sm">
               <span className="font-bold text-gray-900">{hero.stats.resolved} <span className="font-normal text-gray-500">Fixed</span></span>
               <span className="font-bold text-gray-900">{hero.stats.drives} <span className="font-normal text-gray-500">Drives</span></span>
               <span className="font-bold text-gray-900">{hero.stats.volunteers} <span className="font-normal text-gray-500">Mobilized</span></span>
            </div>
          </div>
        </div>

        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Activity size={18} className="text-blue-600"/> Recent Drives & Outcomes</h4>
        <div className="space-y-6">
          {hero.drives.map(drive => (
            <div key={drive.id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
              <div className="h-40 w-full relative">
                 <img src={drive.image} alt={drive.title} className="w-full h-full object-cover" />
                 <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4 pt-12">
                    <h5 className="text-white font-bold">{drive.title}</h5>
                    <p className="text-white/80 text-xs">{drive.date}</p>
                 </div>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Outcome</span>
                    <p className="text-gray-800 text-sm">{drive.outcome}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
        <p className="text-xs text-gray-500">Inspired? <button className="text-blue-600 font-bold hover:underline" onClick={onClose}>Start your own drive</button></p>
      </div>
    </div>
  </div>
);

// Hero of the Week Component
const HeroOfTheWeek = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="py-16 px-6 max-w-300 mx-auto">
      <div className="flex flex-col gap-8">
        {/* Hero Section */}
        <div className="relative rounded-[34px] overflow-hidden border border-gray-200 shadow-xl bg-white">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-orange-500 via-white to-green-500"></div>
            <div className="absolute -top-20 -left-16 w-64 h-64 bg-orange-100/70 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-16 w-72 h-72 bg-green-100/70 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 md:p-10">
            <div className="rounded-[28px] bg-[#1d1d1f] text-white p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-56 h-56 bg-blue-400/15 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <Badge className="bg-white/10 text-white border border-white/20 mb-4">National Spotlight</Badge>
                <h2 className="text-3xl md:text-4xl font-semibold leading-tight mb-4">
                  Rashtriya Hero
                </h2>
                <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6">
                  Every week, the highest verified civic contributor across India will be featured here with full impact stats.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                    <Award size={30} className="text-yellow-300" />
                  </div>
                  <div>
                    <div className="text-sm text-white/60">Current Status</div>
                    <div className="text-lg font-semibold">Selection In Progress</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-white p-7 md:p-8">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-orange-700">Coming Soon</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-[#1d1d1f] mt-2 leading-tight">
                    Who will be India's first Rashtriya Hero?
                  </h3>
                </div>
                <BrandLogo size="sm" className="h-12 shrink-0" />
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">
                We are calibrating national rankings from verified reports, successful resolutions, and community endorsements.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="rounded-2xl bg-orange-50 border border-orange-100 p-4">
                  <div className="text-2xl font-bold text-orange-700">5,000+</div>
                  <div className="text-xs uppercase tracking-wide text-orange-800/70 mt-1">Impact Points</div>
                </div>
                <div className="rounded-2xl bg-green-50 border border-green-100 p-4">
                  <div className="text-2xl font-bold text-green-700">10+</div>
                  <div className="text-xs uppercase tracking-wide text-green-800/70 mt-1">Verified Fixes</div>
                </div>
              </div>

              <button className="w-full px-5 py-3 rounded-2xl bg-[#1d1d1f] text-white font-medium cursor-not-allowed opacity-80">
                Leaderboard Launching Soon
              </button>
            </div>
          </div>
        </div>

        {/* City & State Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* City Card */}
           <div className="p-0.75 rounded-4xl bg-linear-to-r from-orange-500 via-white to-green-500 shadow-sm hover:shadow-xl transition-all duration-500 group">
           <div className="bg-white rounded-[30px] p-8 relative overflow-hidden h-full flex flex-col justify-center items-center text-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50"></div>
              <div className="relative z-10">
                 <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 mb-4 mx-auto">
                    <MapPin size={32} />
                 </div>
                 <Badge className="bg-blue-100 text-blue-700 border-none mb-3">City of the Week</Badge>
                 <h3 className="text-2xl font-bold text-[#1d1d1f] mb-2">Is it your City?</h3>
                 <p className="text-sm text-[#86868b] leading-relaxed mb-6 max-w-xs mx-auto">
                    Rankings are currently being calculated based on active reports and resolutions. Mobilize your neighbors to top the charts.
                 </p>
                 <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
                    <div className="bg-blue-500 h-2 rounded-full w-1/3 animate-pulse"></div>
                 </div>
                 <p className="text-xs text-gray-400 font-medium">Data collection in progress...</p>
              </div>
           </div>
           </div>

           {/* State Card */}
           <div className="p-0.75 rounded-4xl bg-linear-to-r from-orange-500 via-white to-green-500 shadow-sm hover:shadow-xl transition-all duration-500 group">
           <div className="bg-white rounded-[30px] p-8 relative overflow-hidden h-full flex flex-col justify-center items-center text-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50"></div>
              <div className="relative z-10">
                 <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center text-green-500 mb-4 mx-auto">
                    <Globe size={32} />
                 </div>
                 <Badge className="bg-green-100 text-green-700 border-none mb-3">State of the Week</Badge>
                 <h3 className="text-2xl font-bold text-[#1d1d1f] mb-2">State Rankings</h3>
                 <p className="text-sm text-[#86868b] leading-relaxed mb-6 max-w-xs mx-auto">
                    Which state leads in civic action? We are aggregating data from all districts. Stay tuned for the first weekly report.
                 </p>
                 <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
                    <div className="bg-green-500 h-2 rounded-full w-1/2 animate-pulse"></div>
                 </div>
                 <p className="text-xs text-gray-400 font-medium">Calibrating impact scores...</p>
              </div>
           </div>
           </div>
        </div>
      </div>
      {showModal && <HeroDetailsModal hero={HERO_DATA} onClose={() => setShowModal(false)} />}
    </div>
  );
};

// Smart Alerts Promo Section
const SmartAlertsPromo = ({ onViewChange, user }) => (
  <div className="bg-white py-24">
    <div className="max-w-245 mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
      <div className="flex-1 space-y-6">
        <h2 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] leading-tight">
          Know what's happening. <FeatureInfo title="Smart Alerts" content="Our system checks reports in your area and sends you alerts about scams, drives, and issues via Email or SMS." /><br/><span className="text-[#86868b]">Stay safe.</span>
        </h2>
        <p className="text-[#1d1d1f] text-xl leading-relaxed max-w-xl font-medium">
          Get alerts about scams, volunteer work, and issues in your area. Don't wait for the news—know it when it happens.
        </p>
        
        <div className="flex flex-wrap gap-4">
           <div className="flex items-center gap-2 text-sm font-medium text-[#1d1d1f]">
             <div className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f]"><AlertTriangle size={16} /></div>
             Scam Alerts
           </div>
           <div className="flex items-center gap-2 text-sm font-medium text-[#1d1d1f]">
             <div className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f]"><Users size={16} /></div>
             Volunteer Drives
           </div>
           <div className="flex items-center gap-2 text-sm font-medium text-[#1d1d1f]">
             <div className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f]"><MapPin size={16} /></div>
             Local Updates
           </div>
        </div>
      </div>

      <div className="w-full md:w-auto shrink-0">
        <div className="bg-[#f5f5f7] rounded-[30px] p-8 shadow-lg max-w-sm w-full relative overflow-hidden group">
          
          <h3 className="font-semibold text-[#1d1d1f] mb-6 flex items-center gap-2 text-lg">
            <Bell size={20} className="text-[#0071e3]" /> Recent Alerts
          </h3>
          
          <div className="space-y-3 mb-6 relative z-10">
            <div className="bg-white p-4 rounded-2xl shadow-sm flex gap-3 items-start">
               <div className="mt-1 w-2 h-2 rounded-full bg-orange-500 shrink-0"></div>
               <div>
                 <div className="text-xs font-bold text-[#86868b] uppercase mb-0.5">Scam Trending</div>
                 <div className="text-sm text-[#1d1d1f]">"Electricity Bill Fraud" reported 15 times in your sector today.</div>
               </div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm flex gap-3 items-start">
               <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
               <div>
                 <div className="text-xs font-bold text-[#86868b] uppercase mb-0.5">Drive Nearby</div>
                 <div className="text-sm text-[#1d1d1f]">Cleanup drive at Central Park starting in 1 hour.</div>
               </div>
            </div>
          </div>

          <Button 
            variant="primary" 
            className="w-full justify-center"
            onClick={() => user ? onViewChange('dashboard') : onViewChange('login')}
          >
            {user ? 'Configure Alerts' : 'Get Started'}
          </Button>
        </div>
      </div>
    </div>
  </div>
);

// Chapters Promo Section
const ChaptersPromo = ({ onViewChange }) => {
  return (
  <div className="py-24 bg-[#f5f5f7] relative overflow-hidden">
    <div className="max-w-245 mx-auto px-6 relative z-10">
      <div className="flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h2 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] leading-tight">
            Is your College or Society <FeatureInfo title="Chapters" content="Chapters are groups (Colleges, Societies) that work together. They get a dashboard and compete on the leaderboard." /><br/>
            <span className="text-[#86868b]">Leading the Change?</span>
          </h2>
          <p className="text-[#1d1d1f] text-xl leading-relaxed max-w-xl font-medium">
            Create a group for your college or society. Host drives, track your impact, and compete with others.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-2">
            <Button variant="primary" onClick={() => onViewChange('chapters')}>
              Explore Chapters
            </Button>
            <Button variant="secondary" onClick={() => onViewChange('chapters')}>
              View Leaderboard
            </Button>
          </div>
        </div>

        <div className="w-full md:w-auto shrink-0">
          {/* Mini Leaderboard Visual */}
          <div className="bg-white rounded-[30px] p-8 shadow-xl max-w-sm w-full relative text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
               <Trophy size={32} />
            </div>
            <h3 className="font-bold text-lg text-[#1d1d1f] mb-2">Leaderboard Launching</h3>
            <p className="text-sm text-[#86868b] mb-6">
              Register your institution today. Be the first to claim the top spot when rankings go live.
            </p>
            <div className="space-y-3 opacity-40 pointer-events-none select-none blur-[1px]">
               <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-100 text-xs flex items-center justify-center">1</div>
                  <div className="h-2 bg-gray-100 rounded w-full"></div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-100 text-xs flex items-center justify-center">2</div>
                  <div className="h-2 bg-gray-100 rounded w-3/4"></div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-100 text-xs flex items-center justify-center">3</div>
                  <div className="h-2 bg-gray-100 rounded w-1/2"></div>
               </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => onViewChange('chapters')} className="text-xs font-medium text-[#0071e3] hover:underline">
                 Register Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

// Motivation Section
const MotivationSection = ({ onViewChange }) => (
  <div className="relative py-32 bg-white text-[#1d1d1f] overflow-hidden">
    <div className="max-w-245 mx-auto px-6 relative z-10">
      <div className="text-center max-w-4xl mx-auto mb-20">
        <h2 className="text-5xl md:text-7xl font-semibold tracking-tight leading-tight mb-8 text-[#1d1d1f]">
          Imagine an India where <br/>
          <span className="text-[#86868b]">Problems get fixed fast.</span>
        </h2>
        <p className="text-xl md:text-2xl text-[#1d1d1f] font-medium leading-relaxed">
          We are building a simple way for you to improve your city. 
          Where technology helps us work together. Where we stop ignoring issues and start solving them.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {[
          { title: "Local Impact", desc: "Fix the pothole outside your door. Clean the park your kids play in. Change starts at home.", icon: MapPin },
          { title: "Real Tracking", desc: "Every report is tracked. No more lost files. No more excuses.", icon: Shield },
          { title: "Earn Rewards", desc: "Earn respect, badges, and fame. Making India better should feel like winning.", icon: Trophy }
        ].map((item, i) => (
          <div key={i} className="bg-[#f5f5f7] p-8 rounded-[30px] transition-all duration-300 group hover:scale-[1.02]">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[#1d1d1f] mb-6 bg-white shadow-sm`}>
              <item.icon size={24} />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-[#1d1d1f]">{item.title}</h3>
            <p className="text-[#86868b] leading-relaxed font-medium">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button 
          onClick={() => onViewChange('create')}
          className="px-10 py-4 bg-[#1d1d1f] text-white rounded-full font-medium text-xl flex items-center gap-3 hover:bg-[#333] transition-colors mx-auto"
        >
          Join the Movement <ArrowLeft size={20} className="rotate-180" />
        </button>
        <p className="mt-6 text-[#86868b] text-sm font-medium">Join 10,000+ Citizens Today</p>
      </div>
    </div>
  </div>
);

// How It Works Component
const HowItWorks = () => (
  <div className="py-24 bg-white">
    <div className="max-w-245 mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-semibold text-[#1d1d1f] mb-4">No More Ignored Complaints <FeatureInfo title="Resolution Process" content="We track every report. If not resolved on time, we alert higher authorities. We also show unresolved issues to everyone." /></h2>
        <p className="text-[#86868b] text-xl font-medium max-w-2xl mx-auto">
          Every issue you report starts a journey. We make sure it doesn't get lost.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
        {[
          { 
            step: "1", 
            title: "Reported", 
            desc: "You spot an issue and file a report. It's instantly put on the map for everyone to see.",
            icon: FileText
          },
          { 
            step: "2", 
            title: "Seen", 
            desc: "Local volunteers or authorities check the issue. Trust scores go up.",
            icon: CheckCircle
          },
          { 
            step: "3", 
            title: "Action Started", 
            desc: "Volunteers organize a drive, or authorities send a team. You get updates.",
            icon: Zap
          },
          { 
            step: "4", 
            title: "Fixed", 
            desc: "The issue is fixed. Before/After photos are uploaded. You get points.",
            icon: Star
          }
        ].map((item, idx) => (
          <div key={idx} className="relative flex flex-col items-center text-center group">
            <div className={`w-16 h-16 rounded-full bg-[#f5f5f7] text-[#1d1d1f] flex items-center justify-center mb-6 relative`}>
              <item.icon size={24} />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#1d1d1f] rounded-full flex items-center justify-center text-white font-bold text-xs">
                {item.step}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">{item.title}</h3>
            <p className="text-sm text-[#86868b] leading-relaxed px-2 font-medium">{item.desc}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 bg-[#f5f5f7] px-4 py-2 rounded-full text-sm text-[#1d1d1f] font-medium">
          <AlertOctagon size={16} className="text-[#1d1d1f]" />
          <span>If not resolved? We <strong>Escalate</strong> & Share Awareness automatically.</span>
        </div>
      </div>
    </div>
  </div>
);

// Explore Component
const Explore = ({ onCitySelect, posts, user }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [navStack, setNavStack] = useState([]);
  const [showMyReports, setShowMyReports] = useState(false);

  const currentLevel = navStack.length === 0 ? 'country' : navStack.length === 1 ? 'state' : 'city';
  const currentRegion = navStack.length > 0 ? navStack[navStack.length - 1] : null;
  
  const impactStats = useMemo(() => {
    const resolved = posts.filter(p => p.status === 'Resolved').length;
    const uniqueVolunteers = new Set(posts.flatMap(p => p.volunteers || [])).size;
    const upcomingDrives = posts.filter(p => p.type === 'volunteer' && p.status !== 'Resolved').length;
    return { resolved, uniqueVolunteers, upcomingDrives };
  }, [posts]);

  const mapItems = useMemo(() => {
    if (showMyReports && user) {
       return posts.filter(p => p.authorId === user.id).map(post => {
          const stateData = STATES.find(s => s.name === post.state);
          const baseCoords = stateData ? stateData.geoCoords : [78.9629, 22.5937];
          // Pseudo-random jitter based on ID to separate pins visually
          const jitterLat = ((post.id * 13) % 100) / 100 - 0.5;
          const jitterLng = ((post.id * 7) % 100) / 100 - 0.5;
          
          return {
             id: post.id,
             name: post.title,
             geoCoords: [baseCoords[0] + jitterLng * 2, baseCoords[1] + jitterLat * 2],
             coords: { x: 50, y: 50 }, 
             severity: post.status === 'Resolved' ? 'low' : 'high',
             stats: { [post.type]: 1 }
          };
       }).slice(0, 200); // Limit pins for performance
    }

    if (currentLevel === 'country') {
      return STATES.map(state => {
        const statePosts = posts.filter(p => p.state === state.name);
        const stats = {
          scam: statePosts.filter(p => p.type === 'scam').length,
          cleanliness: statePosts.filter(p => p.type === 'cleanliness').length,
          bribe: statePosts.filter(p => p.type === 'bribe').length,
          volunteer: statePosts.filter(p => p.type === 'volunteer').length
        };
        const total = statePosts.length;
        let severity = 'low';
        if (total > 10) severity = 'high';
        else if (total > 5) severity = 'med';

        return { ...state, stats, severity };
      });
    }

    if (currentLevel === 'state' && currentRegion) {
       return (currentRegion.cities || []).map((city, i) => {
          const cityPosts = posts.filter(p => p.city === city);
          const stats = {
            scam: cityPosts.filter(p => p.type === 'scam').length,
            cleanliness: cityPosts.filter(p => p.type === 'cleanliness').length,
            bribe: cityPosts.filter(p => p.type === 'bribe').length,
            volunteer: cityPosts.filter(p => p.type === 'volunteer').length
          };
          const total = cityPosts.length;
          let severity = 'low';
          if (total > 5) severity = 'high';
          else if (total > 2) severity = 'med';
          
          // Generate deterministic coordinates around state center for visualization
          const angle = (i / (currentRegion.cities.length || 1)) * 2 * Math.PI;
          const radius = 1.5; 
          const lat = currentRegion.geoCoords[1] + Math.sin(angle) * radius * 0.8;
          const lng = currentRegion.geoCoords[0] + Math.cos(angle) * radius;

          return {
             id: city,
             name: city,
             geoCoords: [lng, lat],
             severity,
             stats
          };
       });
    }

    return getDrillDownItems(currentLevel, currentRegion);
  }, [currentLevel, currentRegion, showMyReports, user, posts]);

  const handleRegionSelect = (item) => {
    if (showMyReports) return;
    if (currentLevel === 'state') {
      onCitySelect(item.name);
    } else {
      setNavStack([...navStack, item]);
    }
  };

  return (
    <div className="max-w-245 mx-auto py-8 px-6">
      <div className="mb-8 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
          {navStack.length > 0 && !showMyReports && (
            <button 
              onClick={() => setNavStack(prev => prev.slice(0, -1))}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              title="Go Back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-3xl font-bold text-gray-900">{showMyReports ? 'My Reports Map' : 'Live Activity Map'} <FeatureInfo title="Interactive Map" content="View real-time reports across India. Click on pins to see details. Use the heatmap to identify high-severity zones." /></h2>
        </div>
        <p className="text-gray-500">
          {showMyReports 
            ? "Visualizing locations of your submitted reports." 
            : currentLevel === 'country' ? "Select a State to view cities."
            : currentLevel === 'state' ? `Viewing cities in ${currentRegion.name}. Select a city.`
            : `Viewing areas in ${currentRegion.name}. Select an area to see reports.`}
        </p>
      </div>

      {/* Map Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeFilter === 'all' ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'}`}
          >
            All Issues
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap
                ${activeFilter === cat.id ? `${cat.bg} ${cat.color}` : 'bg-white text-[#86868b] hover:bg-[#f5f5f7]'}`}
            >
              <cat.icon size={14} /> {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
          {user && (
            <button 
              onClick={() => setShowMyReports(!showMyReports)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${showMyReports ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              My Reports
            </button>
          )}
          <span className="text-sm font-bold text-gray-700">Heatmap <FeatureInfo title="Heatmap Mode" content="Toggle this to visualize the density and severity of reports. Red areas indicate high activity or critical issues." /></span>
          <button 
            onClick={() => setHeatmapMode(!heatmapMode)}
            className={`w-12 h-6 rounded-full transition-colors relative ${heatmapMode ? 'bg-[#ff3b30]' : 'bg-[#e5e5e5]'}`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${heatmapMode ? 'translate-x-6' : ''}`}></div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           <IndiaMapVisual 
             items={mapItems}
             onRegionSelect={handleRegionSelect}
             filter={activeFilter}
             heatmapMode={heatmapMode}
             level={currentLevel}
             focusRegion={currentRegion}
           />
        </div>

        <div className="space-y-4">
          <div className="bg-[#1d1d1f] rounded-[30px] p-8 text-white shadow-xl">
             <h3 className="font-bold text-lg mb-1">Impact Board</h3>
             <p className="text-gray-400 text-sm mb-4">This month's top stats</p>
             <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                   <span className="text-sm text-gray-300">Issues Resolved</span>
                   <span className="font-mono font-bold text-emerald-400">{impactStats.resolved}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                   <span className="text-sm text-gray-300">Active Volunteers</span>
                   <span className="font-mono font-bold text-blue-400">{impactStats.uniqueVolunteers}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-sm text-gray-300">Upcoming Drives</span>
                   <span className="font-mono font-bold text-orange-400">{impactStats.upcomingDrives}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// New components for Impact Wall Redesign

const ImpactStatBadge = ({ icon, value, label }) => {
  const IconComponent = icon;
  return (
    <div className="flex items-center gap-4 px-6 py-4 bg-white rounded-xl border border-gray-100 shadow-sm min-w-50">
      <div className="p-3 bg-blue-50 text-blue-700 rounded-lg">
        <IconComponent size={24} />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 leading-none">{value}</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">{label}</div>
      </div>
    </div>
  );
};

const TransformationCard = ({ post, onClick, onLike }) => {
  const [showBefore, setShowBefore] = useState(false);

  return (
    <div 
      className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col h-full cursor-pointer"
      onClick={() => onClick(post)}
    >
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <img 
          src={showBefore ? post.evidence.before : post.evidence.after} 
          alt={showBefore ? "Before" : "After"} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
           <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md backdrop-blur-md shadow-sm ${showBefore ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'}`}>
             {showBefore ? 'Before' : 'Resolved'}
           </span>
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); setShowBefore(!showBefore); }}
          className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm transition-all flex items-center gap-1"
        >
          <ArrowLeft size={12} className={`transition-transform duration-300 ${showBefore ? 'rotate-180' : ''}`} />
          {showBefore ? 'Show After' : 'Show Before'}
        </button>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <MapPin size={12} />
          <span className="font-medium">{post.city}</span>
          <span className="text-gray-300">•</span>
          <span>{post.date}</span>
        </div>
        
        <h3 className="font-bold text-gray-900 text-lg mb-2 leading-snug group-hover:text-blue-700 transition-colors">
          {post.title}
        </h3>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
          {post.description}
        </p>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
              {isSensitive ? 'A' : post.author.charAt(0)}
            </div>
            <span className="text-xs font-medium text-gray-700">{isSensitive ? 'Anonymous Citizen' : post.author}</span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onLike && onLike(post.id); }}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors group/like"
          >
             <ThumbsUp size={12} className="group-hover/like:scale-110 transition-transform" /> {post.upvotes}
          </button>
        </div>
      </div>
    </div>
  );
};

const ImpactWall = ({ posts, onViewChange, onLike }) => {
  const [filterState, setFilterState] = useState('All');
  const [filterCity, setFilterCity] = useState('All');
  const resolvedPosts = posts.filter(p => p.status === 'Resolved' && p.evidence?.before && p.evidence?.after);
  
  const filteredPosts = resolvedPosts.filter(p => {
    if (filterState !== 'All' && p.state !== filterState) return false;
    if (filterCity !== 'All' && p.city !== filterCity) return false;
    return true;
  });

  const availableCities = useMemo(() => {
    if (filterState === 'All') return [...new Set(STATES.flatMap(s => s.cities).sort())];
    const state = STATES.find(s => s.name === filterState);
    return state ? state.cities : [];
  }, [filterState]);

  const stats = {
    fixed: resolvedPosts.length,
    vouches: resolvedPosts.reduce((acc, p) => acc + (p.vouchCount || 0), 0),
    impact: resolvedPosts.reduce((acc, p) => acc + (p.upvotes || 0), 0) * 10
  };

  if (resolvedPosts.length === 0) return null;

  return (
    <div className="py-20 bg-gray-50 border-t border-gray-200">
      <div className="max-w-275 mx-auto px-6">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest mb-4">
            Proven Results
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Success Stories
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Real stories of change by people like you. These reports have been fixed by the community and authorities.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
           <ImpactStatBadge icon={CheckSquare} value={stats.fixed} label="Issues Resolved" />
           <ImpactStatBadge icon={Users} value={stats.vouches} label="Citizen Verifications" />
           <ImpactStatBadge icon={Activity} value={stats.impact} label="Impact Points Generated" />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-col sm:flex-row justify-center mb-10 gap-4">
          <select
            value={filterState}
            onChange={(e) => { setFilterState(e.target.value); setFilterCity('All'); }}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm min-w-40"
          >
            <option value="All">All States</option>
            {STATES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>

          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm min-w-40"
          >
            <option value="All">All Cities</option>
            {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
             <TransformationCard 
               key={post.id}
               post={post} 
               onClick={(p) => onViewChange('post', { post: p })} 
               onLike={onLike}
             />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">No resolved stories found for this filter.</p>
          </div>
        )}

        <div className="mt-16 text-center border-t border-gray-200 pt-10">
          <p className="text-gray-600 mb-6 font-medium">Have you spotted an issue in your neighborhood?</p>
          <button 
            onClick={() => onViewChange('create')}
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Submit a Report <ArrowLeft size={16} className="rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};

const RegisterChapterModal = ({ formData, setFormData, onClose, onSubmit }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-200 flex items-center justify-center p-4 animate-in fade-in">
    <div className="bg-white rounded-[30px] w-full max-w-md p-8 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Register New Chapter</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Chapter Name</label><input type="text" required className="w-full px-4 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Green Earth Society" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select className="w-full px-4 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}><option>Society</option><option>College</option><option>NGO</option><option>Corporate</option></select></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">City</label><input type="text" required className="w-full px-4 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="e.g. Mumbai" /></div>
        <Button variant="primary" className="w-full mt-4">Submit Registration</Button>
      </form>
    </div>
  </div>
);

// Chapters Component
const Chapters = ({ chapters, onJoin, onRegister, user, myChapterIds }) => {
  const [filterState, setFilterState] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'Society', city: '' });

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    onRegister(formData);
    setShowRegisterModal(false);
    setFormData({ name: '', type: 'Society', city: '' });
  };

  const filteredChapters = chapters.filter(chapter => {
    if (filterState) {
      const stateData = STATES.find(s => s.name === filterState);
      if (!stateData || !stateData.cities.includes(chapter.city)) return false;
    }
    if (filterCity && chapter.city !== filterCity) return false;
    if (searchQuery && !chapter.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const availableCities = filterState 
    ? (STATES.find(s => s.name === filterState)?.cities || [])
    : [...new Set(STATES.flatMap(s => s.cities))].sort();

  return (
    <div className="max-w-245 mx-auto py-12 px-6">
      {/* Hero */}
      <div className="p-0.75 rounded-4xl bg-linear-to-r from-orange-500 via-white to-green-500 mb-16 shadow-2xl">
      <div className="bg-[#1d1d1f] rounded-[30px] p-10 md:p-16 text-white relative overflow-hidden h-full">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0071e3]/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-2xl">
          <Badge className="bg-[#0071e3]/20 text-white border-none mb-6">Partners</Badge>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-6 leading-tight">Unite Your Group.<FeatureInfo title="Group Impact" content="Register your group to track total impact. Students/Residents earn points for their chapter." /><br/><span className="text-[#86868b]">Lead the Change.</span></h1>
          <p className="text-[#86868b] text-xl font-medium mb-10 leading-relaxed">
            Create a verified group for your College or Society. Host drives, track impact, and compete in city challenges.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" className="px-8 py-3 text-[17px]" onClick={() => user ? setShowRegisterModal(true) : alert('Please login to register a chapter.')}>Register Chapter</Button>
            <Button variant="outline" className="border-[#86868b] text-white hover:bg-[#333] hover:border-[#333]">Find My Chapter</Button>
          </div>
        </div>
      </div>
      </div>

      {/* Live Challenge */}
      <div className="mb-20">
        <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-6 flex items-center gap-3">
          <Zap className="text-[#ff3b30]" fill="currentColor" /> Live Challenge <FeatureInfo title="Live Challenges" content="Competitions between chapters. Winners get grants and recognition. Participate by organizing drives or resolving issues." />
        </h2>
        <div className="bg-[#1d1d1f] text-white rounded-[30px] p-10 shadow-2xl relative overflow-hidden">
           <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-linear-to-tl from-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse"></div>
           <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
             <div className="flex-1">
               <div className="flex justify-between items-start mb-2">
                 <div>
                   <h3 className="text-3xl font-semibold">First Challenge</h3>
                   <p className="text-[#86868b] font-medium">The first national inter-chapter competition.</p>
                 </div>
                 <Badge className="bg-blue-500 text-white border-none px-3 py-1">Coming Soon</Badge>
               </div>
               <p className="text-sm text-orange-400 font-mono mb-6">Registration Opens: Next Week</p>
               
               <div className="space-y-5 opacity-50 grayscale">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white text-sm">?</div>
                   <div className="flex-1">
                     <div className="flex justify-between items-baseline mb-1">
                       <span className="font-semibold text-white">Your Chapter Here</span>
                       <span className="font-mono text-gray-400">0 pts</span>
                     </div>
                     <div className="h-2 bg-white/10 rounded-full"><div className="h-2 bg-gray-600 rounded-full w-[0%]"></div></div>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white text-sm">?</div>
                   <div className="flex-1">
                     <div className="flex justify-between items-baseline mb-1">
                       <span className="font-semibold text-white">Competitor Chapter</span>
                       <span className="font-mono text-gray-400">0 pts</span>
                     </div>
                     <div className="h-2 bg-white/10 rounded-full"><div className="h-2 bg-gray-600 rounded-full w-[0%]"></div></div>
                   </div>
                 </div>
               </div>
             </div>
             <div className="w-full md:w-56 text-center bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <Trophy size={40} className="mx-auto text-yellow-400 mb-3" />
                <p className="font-bold text-lg">Prize Pool</p>
                <p className="text-sm text-gray-400">Grants & National Recognition</p>
                <Button variant="secondary" className="mt-4 w-full text-sm!" disabled>Details Soon</Button>
             </div>
           </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#1d1d1f]">Find a Chapter <FeatureInfo title="Chapter Directory" content="Search for chapters in your city. Joining a chapter helps you collaborate with neighbors or peers." /></h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search chapters..." 
              className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 cursor-pointer"
            value={filterState}
            onChange={(e) => { setFilterState(e.target.value); setFilterCity(''); }}
          >
            <option value="">All States</option>
            {STATES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          
          <select 
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 cursor-pointer"
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
          >
            <option value="">All Cities</option>
            {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredChapters.length > 0 ? filteredChapters.map(chapter => (
          <div key={chapter.id} className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 border border-gray-100/50 flex flex-col overflow-hidden">
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${chapter.color} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                  {chapter.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#1d1d1f] text-lg leading-tight">{chapter.name}</h3>
                  <p className="text-sm text-[#86868b] font-medium flex items-center gap-1">
                    <MapPin size={12} /> {chapter.city}
                  </p>
                </div>
                {chapter.verified && <CheckCircle size={18} className="text-white fill-[#0071e3] shrink-0" title="Verified Chapter" />}
              </div>
              
              <div className="mt-auto pt-4 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#86868b]">Members</span>
                  <span className="font-semibold text-[#1d1d1f]">{chapter.members}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#86868b]">Drives Hosted</span>
                  <span className="font-semibold text-[#1d1d1f]">{chapter.drives}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#86868b]">Impact Score</span>
                  <span className="font-semibold text-[#0071e3]">{chapter.score > 1000 ? (chapter.score/1000).toFixed(1) + 'k' : chapter.score}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-[#f5f5f7] border-t border-gray-200/80">
              {myChapterIds.includes(chapter.id) ? (
                <Button variant="outline" className="w-full text-sm! py-2! bg-green-50 text-green-700 border-green-200" disabled>Joined</Button>
              ) : (
                <Button variant="secondary" className="w-full text-sm! py-2!" onClick={() => onJoin(chapter)}>Join Chapter</Button>
              )}
            </div>
          </div>
        )) : (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-[30px] border border-dashed border-gray-200">
            <p>No chapters found in this location.</p>
            <button onClick={() => { setFilterState(''); setFilterCity(''); }} className="text-[#0071e3] text-sm font-medium mt-2 hover:underline">Clear Filters</button>
          </div>
        )}
      </div>

      {/* Points Breakdown */}
      <PointsBreakdown />
      {showRegisterModal && (
        <RegisterChapterModal
          formData={formData}
          setFormData={setFormData}
          onClose={() => setShowRegisterModal(false)}
          onSubmit={handleRegisterSubmit}
        />
      )}
    </div>
  );
};

// Leaderboard Component
const Leaderboard = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('citizens');

  return (
    <div className="max-w-245 mx-auto py-12 px-6">
      {/* Hero Section */}
      <div className="p-0.75 rounded-4xl bg-linear-to-r from-orange-500 via-white to-green-500 mb-12 shadow-2xl">
      <div className="bg-[#1d1d1f] rounded-[30px] p-10 md:p-16 text-white relative overflow-hidden h-full">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <Badge className="bg-yellow-500/20 text-yellow-300 border-none mb-6">Top Rankers</Badge>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-6 leading-tight">
            Season 1.<FeatureInfo title="Top Rankers" content="We rank people and groups based on their Civic Score. This score comes from reports filed, verified, and fixed." /><br/><span className="text-[#86868b]">Starting Soon.</span>
          </h1>
          <p className="text-[#86868b] text-xl font-medium mb-8 leading-relaxed max-w-2xl">
            We are preparing to recognize the people and groups changing India. Start helping now to get a head start.
          </p>
          
          {/* Toggle inside Hero */}
          <div className="bg-white/10 p-1 rounded-full inline-flex backdrop-blur-md">
            <button onClick={() => setActiveTab('citizens')} className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'citizens' ? 'bg-white text-[#1d1d1f] shadow-lg' : 'text-white hover:bg-white/10'}`}>
              Citizens
            </button>
            <button onClick={() => setActiveTab('institutions')} className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'institutions' ? 'bg-white text-[#1d1d1f] shadow-lg' : 'text-white hover:bg-white/10'}`}>
              Institutions
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Placeholder for Leaderboard */}
      <div className="bg-white rounded-[30px] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100 p-12 text-center">
        <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600">
          <Trophy size={40} />
        </div>
        <h3 className="text-2xl font-bold text-[#1d1d1f] mb-3">Rankings Launching Soon</h3>
        <p className="text-[#86868b] max-w-md mx-auto mb-8">
          We are setting up the scores. Start reporting issues and organizing drives today to secure your spot when the leaderboard goes live.
        </p>
        <Button variant="primary" onClick={() => onBack()}>Start Contributing</Button>
      </div>

      {/* Points Breakdown */}
      <PointsBreakdown />
    </div>
  );
};

// Helper icon for top rank
const Crown = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
  </svg>
);

// Admin Sub-Components
const AdminSidebar = ({ activeTab, onTabChange }) => (
  <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden lg:block min-h-[calc(100vh-4rem)]">
    <div className="p-6">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Admin Menu</h3>
      <nav className="space-y-1">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'content', label: 'All Content', icon: FileText },
          { id: 'pending', label: 'Pending Approval', icon: Clock },
          { id: 'reports', label: 'Moderation Queue', icon: AlertOctagon },
          { id: 'chapters', label: 'Chapters', icon: Briefcase },
          { id: 'settings', label: 'System Settings', icon: Zap },
          { id: 'audit', label: 'Audit Log', icon: BookOpen },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors
              ${activeTab === item.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  </div>
);

const AdminOverview = ({ stats }) => (
  <div className="space-y-6 animate-in fade-in">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active Reports', value: stats.activeReports, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Resolved Issues', value: stats.resolvedIssues, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Pending Chapters', value: stats.pendingChapters, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
      ].map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
          <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
    
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="font-bold text-gray-900 mb-4">System Health</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Server Load</span>
            <span className="text-green-600 font-medium">Normal (24%)</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 w-[24%]"></div></div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Database Storage</span>
            <span className="text-blue-600 font-medium">45% Used</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[45%]"></div></div>
        </div>
      </div>
    </div>
  </div>
);

const AdminUsers = ({ users, onBan, onSelectUser, onBulkBan }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'joinedDate', direction: 'desc' });
  const ITEMS_PER_PAGE = 10;

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || u.status === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = sortedUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const isPageSelected = paginatedUsers.length > 0 && paginatedUsers.every(u => selectedIds.includes(u.id));

  const handleSelectAll = (e) => {
    const pageIds = paginatedUsers.map(u => u.id);
    if (e.target.checked) {
      setSelectedIds(prev => [...new Set([...prev, ...pageIds])]);
    } else {
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    }
  };

  const handleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Joined Date'];
    const csvContent = [
        headers.join(','),
        ...sortedUsers.map(u => [
            u.id,
            `"${u.name.replace(/"/g, '""')}"`,
            `"${u.email.replace(/"/g, '""')}"`,
            u.role,
            u.status,
            `"${u.joinedDate}"`
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const renderSortIcon = (column) => {
    if (sortConfig.key !== column) return <div className="w-3 h-3 opacity-0"></div>;
    return <ChevronRight size={12} className={`transition-transform ${sortConfig.direction === 'asc' ? '-rotate-90' : 'rotate-90'}`} />;
  };

  return (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in">
    <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
       <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
       </div>
       <div className="flex items-center gap-3">
         <select 
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
         >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Banned">Banned</option>
         </select>
         <button onClick={handleExportCSV} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 bg-white" title="Export Users">
            <Download size={16} />
         </button>
       </div>
    </div>
    {selectedIds.length > 0 && (
      <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
        <span className="text-sm text-blue-800 font-medium">{selectedIds.length} users selected</span>
        <div className="flex gap-2">
           <button onClick={() => setSelectedIds([])} className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5">Cancel</button>
           <button 
             onClick={() => { if(window.confirm(`Ban ${selectedIds.length} users?`)) { onBulkBan(selectedIds); setSelectedIds([]); } }} 
             className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
           >
             <Trash2 size={12} /> Ban Selected
           </button>
        </div>
      </div>
    )}
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 w-10">
              <input type="checkbox" onChange={handleSelectAll} checked={isPageSelected} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            </th>
            <th className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors select-none" onClick={() => requestSort('name')}>
              <div className="flex items-center gap-1">User {renderSortIcon('name')}</div>
            </th>
            <th className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors select-none" onClick={() => requestSort('role')}>
              <div className="flex items-center gap-1">Role {renderSortIcon('role')}</div>
            </th>
            <th className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors select-none" onClick={() => requestSort('status')}>
              <div className="flex items-center gap-1">Status {renderSortIcon('status')}</div>
            </th>
            <th className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors select-none" onClick={() => requestSort('joinedDate')}>
              <div className="flex items-center gap-1">Joined {renderSortIcon('joinedDate')}</div>
            </th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {paginatedUsers.map(u => (
            <tr key={u.id} className={`hover:bg-gray-50 cursor-pointer ${selectedIds.includes(u.id) ? 'bg-blue-50/30' : ''}`} onClick={() => onSelectUser(u)}>
              <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                <input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => handleSelect(u.id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{u.name}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge className={u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'moderator' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>
                  {u.role}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium
                  ${u.status === 'banned' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {u.status === 'banned' ? 'Banned' : 'Active'}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-500">{u.joinedDate}</td>
              <td className="px-6 py-4 text-right space-x-2">
                <button onClick={(e) => { e.stopPropagation(); onBan(u.id); }} className="text-red-600 hover:underline text-xs font-medium">
                  {u.status === 'banned' ? 'Unban' : 'Ban'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {paginatedUsers.length === 0 && (
        <div className="p-8 text-center text-gray-500 text-sm">
          No users found matching your search.
        </div>
      )}
    </div>
    
    {/* Pagination Controls */}
    {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-xs text-gray-500">Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
        </div>
    )}
  </div>
  );
};

const AdminUserDetailModal = ({ user, posts, onClose, onBan }) => {
  if (!user) return null;
  const userPosts = posts.filter(p => p.authorId === user.id);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex justify-between items-center z-10">
          <h3 className="font-bold text-lg flex items-center gap-2"><User size={18} /> User Profile & Activity</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600">{user.name.charAt(0)}</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              <Badge className={`mt-2 ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{user.role}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6 text-center">
            <div className="bg-gray-50 p-3 rounded-lg"><div className="font-bold text-xl">{userPosts.length}</div><div className="text-xs text-gray-500">Reports</div></div>
            <div className="bg-gray-50 p-3 rounded-lg"><div className="font-bold text-xl">{userPosts.reduce((acc, p) => acc + p.upvotes, 0)}</div><div className="text-xs text-gray-500">Upvotes</div></div>
            <div className="bg-gray-50 p-3 rounded-lg"><div className="font-bold text-xl">{userPosts.filter(p => p.status === 'Resolved').length}</div><div className="text-xs text-gray-500">Resolved</div></div>
          </div>

          <h4 className="font-bold text-gray-900 mb-2">Recent Activity</h4>
          <div className="border border-gray-100 rounded-xl max-h-64 overflow-y-auto">
            {userPosts.length > 0 ? userPosts.map(p => (
              <div key={p.id} className="p-3 border-b border-gray-100 last:border-0">
                <p className="font-medium text-sm text-gray-800 truncate">{p.title}</p>
                <p className="text-xs text-gray-400">{p.date} • {p.status}</p>
              </div>
            )) : <p className="p-8 text-center text-sm text-gray-400">No activity found.</p>}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="font-bold text-red-600 mb-2">Admin Actions</h4>
            <button onClick={() => { onBan(user.id); onClose(); }} className="px-4 py-2 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
              {user.status === 'banned' ? 'Un-Ban User' : 'Ban User'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Full Admin Dashboard
const AdminDashboard = ({ posts, users, chapters, settings, auditLog, onDelete, onVerify, onDismissFlag, onResolve, onEditPost, onBanUser, onVerifyChapter, onDeleteChapter, onUpdateSettings, onBulkDelete, onBulkUpdateStatus, onBulkBan }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const flaggedPosts = posts.filter(p => p.flags > 0);
  const pendingPosts = posts.filter(p => p.status === 'Open' && p.flags === 0);

  const AdminAllContent = ({ posts, onDelete, onEditPost, onBulkDelete, onBulkUpdateStatus }) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingAction, setPendingAction] = useState({ type: '', value: null });
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const filteredPosts = posts.filter(p => {
      const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            String(p.id).includes(searchQuery);
      
      let matchesDate = true;
      if (dateRange.start) {
         matchesDate = matchesDate && p.id >= new Date(dateRange.start).getTime();
      }
      if (dateRange.end) {
         matchesDate = matchesDate && p.id <= new Date(dateRange.end).setHours(23, 59, 59, 999);
      }

      return matchesStatus && matchesSearch && matchesDate;
    });

    const sortedPosts = [...filteredPosts].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    const totalPages = Math.ceil(sortedPosts.length / ITEMS_PER_PAGE);
    const paginatedPosts = sortedPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const isPageSelected = paginatedPosts.length > 0 && paginatedPosts.every(p => selectedIds.includes(p.id));
    const isAllSelected = sortedPosts.length > 0 && selectedIds.length === sortedPosts.length;

    const handleSelectAll = (e) => {
      if (e.target.checked) {
        setSelectedIds(sortedPosts.map(p => p.id));
      } else {
        setSelectedIds([]);
      }
    };

    const handleSelectPage = (e) => {
      const pageIds = paginatedPosts.map(p => p.id);
      if (e.target.checked) {
        setSelectedIds(prev => [...new Set([...prev, ...pageIds])]);
      } else {
        setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
      }
    };

    const handleSelect = (id) => {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkDelete = () => {
      setPendingAction({ type: 'delete' });
      setShowConfirmModal(true);
    };

    const requestSort = (key) => {
      let direction = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
      }
      setSortConfig({ key, direction });
    };

    const handleExportCSV = () => {
      const headers = ['ID', 'Title', 'Author', 'Status', 'Date', 'City', 'Upvotes'];
      const csvContent = [
          headers.join(','),
          ...sortedPosts.map(p => [
              p.id,
              `"${p.title.replace(/"/g, '""')}"`,
              `"${p.author.replace(/"/g, '""')}"`,
              p.status,
              `"${p.date}"`,
              `"${p.city}"`,
              p.upvotes
          ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `admin_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    };

    const renderSortIcon = (column) => {
      if (sortConfig.key !== column) return <div className="w-3 h-3 opacity-0"></div>;
      return <ChevronRight size={12} className={`transition-transform ${sortConfig.direction === 'asc' ? '-rotate-90' : 'rotate-90'}`} />;
    };

    return (
    <div className="bg-white rounded-[30px] shadow-sm overflow-hidden animate-in fade-in">
      <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-center bg-gray-50/50 gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="font-bold text-gray-900">Master Content Database</h3>
            <p className="text-xs text-gray-500">Full access to view, edit, or delete any record.</p>
          </div>
          {selectedIds.length > 0 && (
             <div className="flex items-center gap-2">
               <button 
                 onClick={() => setSelectedIds([])}
                 className="text-xs text-gray-500 font-bold hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
               >
                 Clear
               </button>
               {selectedIds.length < sortedPosts.length && (
                 <button 
                   onClick={() => setSelectedIds(sortedPosts.map(p => p.id))}
                   className="text-xs text-blue-600 font-bold hover:underline mr-2 bg-blue-50 px-2 py-1 rounded"
                 >
                   Select all {sortedPosts.length} matching
                 </button>
               )}
               <select
                  onChange={(e) => {
                    if (e.target.value) {
                      setPendingAction({ type: 'update', value: e.target.value });
                      setShowConfirmModal(true);
                      e.target.value = '';
                    }
                  }}
                  className="bg-white border border-gray-300 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  defaultValue=""
               >
                  <option value="" disabled>Mark as...</option>
                  <option value="Open">Open</option>
                  <option value="Verified">Verified</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Action Taken">Action Taken</option>
               </select>
             <button onClick={handleBulkDelete} className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1">
               <Trash2 size={12} /> Delete {selectedIds.length} Selected
             </button>
             </div>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1">
                <span className="text-xs text-gray-400">Date:</span>
                <input 
                    type="date" 
                    className="text-xs outline-none bg-transparent text-gray-600 w-24"
                    value={dateRange.start}
                    onChange={(e) => { setDateRange({...dateRange, start: e.target.value}); setCurrentPage(1); }}
                />
                <span className="text-gray-300">-</span>
                <input 
                    type="date" 
                    className="text-xs outline-none bg-transparent text-gray-600 w-24"
                    value={dateRange.end}
                    onChange={(e) => { setDateRange({...dateRange, end: e.target.value}); setCurrentPage(1); }}
                />
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-2 text-gray-400" size={14} />
                <input 
                    type="text" 
                    placeholder="Search content..." 
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="pl-9 pr-4 py-1.5 rounded-lg border border-gray-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 md:w-48"
                />
            </div>
            <select 
                value={filterStatus} 
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="All">All Status</option>
                <option value="Open">Open</option>
                <option value="Verified">Verified</option>
                <option value="Resolved">Resolved</option>
                <option value="Action Taken">Action Taken</option>
            </select>
            <button onClick={handleExportCSV} className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 bg-white" title="Export CSV">
                <Download size={16} />
            </button>
            <Badge className="bg-gray-900 text-white">{filteredPosts.length} Records</Badge>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-white text-gray-500 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 w-28">
                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-1 text-[10px] cursor-pointer select-none hover:text-gray-700">
                    <input type="checkbox" onChange={handleSelectPage} checked={isPageSelected} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" />
                    Select Page
                  </label>
                  <label className="flex items-center gap-1 text-[10px] cursor-pointer select-none hover:text-gray-700">
                    <input type="checkbox" onChange={handleSelectAll} checked={isAllSelected} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" />
                    Select All
                  </label>
                </div>
              </th>
              <th className="px-6 py-3 cursor-pointer hover:bg-gray-50 transition-colors select-none" onClick={() => requestSort('id')}>
                <div className="flex items-center gap-1">ID {renderSortIcon('id')}</div>
              </th>
              <th className="px-6 py-3 cursor-pointer hover:bg-gray-50 transition-colors select-none" onClick={() => requestSort('title')}>
                <div className="flex items-center gap-1">Title {renderSortIcon('title')}</div>
              </th>
              <th className="px-6 py-3 cursor-pointer hover:bg-gray-50 transition-colors select-none" onClick={() => requestSort('author')}>
                <div className="flex items-center gap-1">Author {renderSortIcon('author')}</div>
              </th>
              <th className="px-6 py-3 cursor-pointer hover:bg-gray-50 transition-colors select-none" onClick={() => requestSort('status')}>
                <div className="flex items-center gap-1">Status {renderSortIcon('status')}</div>
              </th>
              <th className="px-6 py-3 text-right">Super Admin Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginatedPosts.map(post => (
              <tr key={post.id} className={`hover:bg-gray-50 ${selectedIds.includes(post.id) ? 'bg-blue-50/30' : ''}`}>
                <td className="px-6 py-3">
                  <input type="checkbox" checked={selectedIds.includes(post.id)} onChange={() => handleSelect(post.id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </td>
                <td className="px-6 py-3 font-mono text-xs text-gray-400">#{post.id}</td>
                <td className="px-6 py-3 font-medium text-gray-900 max-w-xs truncate" title={post.title}>{post.title}</td>
                <td className="px-6 py-3 text-gray-600">{post.author}</td>
                <td className="px-6 py-3">
                   <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      post.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                   }`}>{post.status}</span>
                </td>
                <td className="px-6 py-3 text-right space-x-2">
                  <button onClick={() => onEditPost(post)} className="text-blue-600 hover:underline text-xs font-bold uppercase tracking-wider">Edit</button>
                  <button onClick={() => onDelete(post.id)} className="text-red-600 hover:underline text-xs font-bold uppercase tracking-wider">Delete</button>
                </td>
              </tr>
            ))}
            {paginatedPosts.length === 0 && (
                <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No records found matching filter.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
          </div>
      )}
      
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl transform transition-all scale-100">
                <h3 className="font-bold text-lg mb-2 text-gray-900">Confirm Bulk Action</h3>
                <p className="text-gray-600 text-sm mb-6">
                    {pendingAction.type === 'delete' 
                        ? `Are you sure you want to delete ${selectedIds.length} items? This cannot be undone.`
                        : `Update status of ${selectedIds.length} items to '${pendingAction.value}'?`
                    }
                </p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                    <button 
                        onClick={() => {
                            if (pendingAction.type === 'delete') onBulkDelete(selectedIds);
                            else onBulkUpdateStatus(selectedIds, pendingAction.value);
                            setSelectedIds([]);
                            setShowConfirmModal(false);
                        }} 
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors ${pendingAction.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
  };

  const PendingContent = () => {
    const [modalConfig, setModalConfig] = useState({ show: false, type: null, post: null });
    const [rejectionReason, setRejectionReason] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPendingPosts = pendingPosts.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedPendingPosts = [...filteredPendingPosts].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    const requestSort = (key) => {
      let direction = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
      }
      setSortConfig({ key, direction });
    };

    const renderSortIcon = (column) => {
      if (sortConfig.key !== column) return <div className="w-3 h-3 opacity-0"></div>;
      return <ChevronRight size={12} className={`transition-transform ${sortConfig.direction === 'asc' ? '-rotate-90' : 'rotate-90'}`} />;
    };

    const handleActionClick = (type, post) => {
      setModalConfig({ show: true, type, post });
      setRejectionReason('');
    };

    const confirmAction = async () => {
      const { type, post } = modalConfig;
      if (type === 'approve') {
        await onVerify(post.id);
      } else if (type === 'reject') {
        await onDelete(post.id, rejectionReason);
      }
      setModalConfig({ show: false, type: null, post: null });
      setRejectionReason('');
    };

    return (
      <div className="bg-white rounded-[30px] shadow-sm overflow-hidden animate-in fade-in">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="font-bold text-gray-900">Pending Approval Queue</h3>
            <p className="text-xs text-gray-500">Review and verify new reports.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search pending..." 
                  className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <Badge className="bg-orange-100 text-orange-700 border-orange-200">{pendingPosts.length} Pending</Badge>
          </div>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-white text-gray-500 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Title / ID</th>
              <th className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors select-none" onClick={() => requestSort('author')}>
                <div className="flex items-center gap-1">Author {renderSortIcon('author')}</div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors select-none" onClick={() => requestSort('date')}>
                <div className="flex items-center gap-1">Date {renderSortIcon('date')}</div>
              </th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedPendingPosts.map(post => (
              <tr key={post.id} className="hover:bg-gray-50 group transition-colors">
                <td className="px-6 py-4 max-w-xs">
                  <div className="font-medium text-gray-900 line-clamp-1">{post.title}</div>
                  <div className="text-xs text-gray-400">ID: #{post.id}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">{post.author}</td>
                <td className="px-6 py-4 text-gray-500">{post.date}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleActionClick('approve', post)} className="text-green-600 hover:text-green-800 font-medium text-xs bg-green-50 px-3 py-1.5 rounded hover:bg-green-100 transition-colors">Approve</button>
                  <button onClick={() => handleActionClick('reject', post)} className="text-red-600 hover:text-red-800 font-medium text-xs bg-red-50 px-3 py-1.5 rounded hover:bg-red-100 transition-colors">Reject</button>
                </td>
              </tr>
            ))}
            {pendingPosts.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No pending posts.</td>
              </tr>
            )}
          </tbody>
        </table>

        {modalConfig.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100 animate-in fade-in">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
               <h3 className="font-bold text-lg mb-2 text-gray-900">
                 {modalConfig.type === 'approve' ? 'Approve Report?' : 'Reject Report?'}
               </h3>
               <p className="text-gray-600 text-sm mb-6">
                 {modalConfig.type === 'approve' 
                   ? `Are you sure you want to verify "${modalConfig.post.title}"? This will make it visible on the public feed.`
                   : `Are you sure you want to reject "${modalConfig.post.title}"? This will permanently delete the report.`
                 }
               </p>
               {modalConfig.type === 'reject' && (
                 <div className="mb-6">
                   <label className="block text-xs font-bold text-gray-700 mb-2">Reason for Rejection (Optional)</label>
                   <textarea 
                     className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                     rows="3"
                     placeholder="e.g. Duplicate report, Lack of evidence..."
                     value={rejectionReason}
                     onChange={(e) => setRejectionReason(e.target.value)}
                   />
                 </div>
               )}
               <div className="flex justify-end gap-3">
                 <button onClick={() => setModalConfig({ show: false, type: null, post: null })} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                 <button onClick={confirmAction} className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors ${modalConfig.type === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                   {modalConfig.type === 'approve' ? 'Approve' : 'Reject'}
                 </button>
               </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ReportsContent = () => (
    <div className="animate-in fade-in">
      {flaggedPosts.length > 0 && (
        <div className="mb-8">
           <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2"><AlertOctagon size={18} /> High Risk / Flagged</h3>
           <div className="bg-red-50 rounded-3xl border border-red-100 overflow-hidden">
             {flaggedPosts.map(post => (
               <div key={post.id} className="p-4 border-b border-red-100 last:border-0 flex items-center justify-between">
                 <div>
                   <div className="font-bold text-gray-900">{post.title}</div>
                   <div className="text-xs text-red-600 font-medium">Flags: {post.flags} • ID: {post.id}</div>
                 </div>
                 <div className="flex gap-2">
                   <Button variant="ghost" className="py-1! px-2! text-xs" onClick={() => onEditPost(post)}>Edit</Button>
                   <Button variant="secondary" className="py-1! px-2! text-xs" onClick={() => onDismissFlag(post.id)}>Dismiss</Button>
                   <Button variant="danger" className="py-1! px-2! text-xs" onClick={() => onDelete(post.id)}>Remove</Button>
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden animate-in fade-in">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#f5f5f7] text-[#86868b] font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Title / ID</th>
              <th className="px-6 py-4">Trust Score</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.filter(p => p.flags === 0).map(post => (
              <tr key={post.id} className="hover:bg-[#f5f5f7] group transition-colors">
                <td className="px-6 py-4 max-w-xs">
                  <div className="font-medium text-gray-900 line-clamp-1">{post.title}</div>
                  <div className="text-xs text-gray-400">ID: #{post.id} • {post.date}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${post.trustScore === 'High' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {post.trustScore}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border
                    ${post.status === 'Verified' ? 'text-green-700 bg-green-50 border-green-200' : 'text-gray-600 bg-gray-100 border-gray-200'}`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {post.status !== 'Verified' && post.status !== 'Resolved' && (
                    <button onClick={() => onVerify(post.id)} className="text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors">Verify</button>
                  )}
                  {post.status === 'Verified' && (
                    <button onClick={() => onResolve(post.id)} className="text-green-600 hover:text-green-800 font-medium text-xs bg-green-50 px-3 py-1.5 rounded hover:bg-green-100 transition-colors">Resolve</button>
                  )}
                  <button onClick={() => onDelete(post.id)} className="text-red-600 hover:text-red-800 font-medium text-xs bg-red-50 px-3 py-1.5 rounded hover:bg-red-100 transition-colors">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const ChaptersContent = () => (
    <div className="bg-white rounded-[30px] shadow-sm overflow-hidden animate-in fade-in">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
          <tr>
            <th className="px-6 py-4">Chapter Name</th>
            <th className="px-6 py-4">Type</th>
            <th className="px-6 py-4">City</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {chapters.map(chapter => (
            <tr key={chapter.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">{chapter.name}</td>
              <td className="px-6 py-4 text-gray-500">{chapter.type}</td>
              <td className="px-6 py-4 text-gray-500">{chapter.city}</td>
              <td className="px-6 py-4">
                {chapter.verified ? (
                  <Badge className="bg-green-100 text-green-700">Verified</Badge>
                ) : (
                  <Badge className="bg-orange-100 text-orange-700">Pending</Badge>
                )}
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                {!chapter.verified && (
                  <button onClick={() => onVerifyChapter(chapter.id)} className="text-blue-600 hover:underline text-xs font-medium">Approve</button>
                )}
                <button onClick={() => onDeleteChapter(chapter.id)} className="text-red-600 hover:underline text-xs font-medium">Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const SettingsContent = () => {
    const [localSettings, setLocalSettings] = useState(settings);

    const handleToggle = (key) => {
      setLocalSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleChange = (key, value) => {
      setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const saveSettings = () => {
      onUpdateSettings(localSettings);
    };

    return (
      <div className="bg-white rounded-[30px] shadow-sm p-8 animate-in fade-in">
        <h3 className="text-xl font-bold text-gray-900 mb-6">System Configuration</h3>
        
        <div className="space-y-6 max-w-2xl">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <div className="font-bold text-gray-900">Maintenance Mode</div>
              <div className="text-xs text-gray-500">Disable access for non-admin users</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={localSettings.maintenanceMode} onChange={() => handleToggle('maintenanceMode')} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <div className="font-bold text-gray-900">Allow New Signups</div>
              <div className="text-xs text-gray-500">Toggle user registration</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={localSettings.allowSignups} onChange={() => handleToggle('allowSignups')} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Global Announcement Banner</label>
            <input 
              type="text" 
              className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter message to display on top of site..."
              value={localSettings.globalAnnouncement}
              onChange={(e) => handleChange('globalAnnouncement', e.target.value)}
            />
          </div>

          <Button variant="primary" onClick={saveSettings}>Save Configuration</Button>

          <div className="pt-8 mt-8 border-t border-gray-200">
            <h4 className="text-sm font-bold text-red-600 mb-4 flex items-center gap-2"><AlertTriangle size={16}/> Super Admin Danger Zone</h4>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                 <div>
                   <div className="font-bold text-gray-900">Export Database</div>
                   <div className="text-xs text-gray-500">Download all posts and users as JSON.</div>
                 </div>
                 <Button variant="outline" onClick={() => {
                    const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ posts, users, chapters }, null, 2));
                    const downloadAnchorNode = document.createElement('a');
                    downloadAnchorNode.setAttribute("href", data);
                    downloadAnchorNode.setAttribute("download", "india_act_backup.json");
                    document.body.appendChild(downloadAnchorNode);
                    downloadAnchorNode.click();
                    downloadAnchorNode.remove();
                 }} icon={Download}>Export Data</Button>
              </div>

              <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
                 <div>
                   <div className="font-bold text-red-900">Factory Reset System</div>
                   <div className="text-xs text-red-700">Wipes all posts, users, and settings. Cannot be undone.</div>
                 </div>
                 <Button variant="danger" onClick={() => {
                   if(window.confirm('CRITICAL WARNING: This will delete ALL data. Are you sure?')) {
                     localStorage.clear();
                     window.location.reload();
                   }
                 }}>Reset Everything</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AuditLogContent = () => (
    <div className="bg-white rounded-[30px] shadow-sm overflow-hidden animate-in fade-in">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-bold text-gray-900">Super Admin Audit Trail</h3>
        <p className="text-xs text-gray-500">Immutable log of all administrative actions.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-white text-gray-500 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-3">Timestamp</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {auditLog.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-mono text-xs text-gray-400">{log.timestamp}</td>
                <td className="px-6 py-3 font-medium text-gray-700">{log.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const stats = {
    totalUsers: users.length,
    activeReports: posts.filter(p => p.status === 'Open').length,
    resolvedIssues: posts.filter(p => p.status === 'Resolved').length,
    pendingChapters: chapters.filter(c => !c.verified).length
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Mobile Tab Nav */}
        <div className="lg:hidden flex overflow-x-auto gap-2 mb-6 pb-2">
          {['overview', 'users', 'content', 'pending', 'reports', 'chapters', 'settings', 'audit'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 capitalize flex items-center gap-2">
              {activeTab === 'reports' ? 'Moderation Queue' : activeTab.replace('-', ' ')}
            </h2>
            <p className="text-gray-500 text-sm">Admin Control Panel • {new Date().toLocaleDateString()}</p>
          </div>
          {activeTab === 'reports' && <Badge className="bg-red-100 text-red-700 border border-red-200">{flaggedPosts.length} Flagged</Badge>}
        </div>

        {activeTab === 'overview' && <AdminOverview stats={stats} />}
        {activeTab === 'users' && <AdminUsers users={users} onBan={onBanUser} onSelectUser={setSelectedUser} onBulkBan={onBulkBan} />}
        {activeTab === 'content' && <AdminAllContent posts={posts} onDelete={onDelete} onEditPost={onEditPost} onBulkDelete={onBulkDelete} onBulkUpdateStatus={onBulkUpdateStatus} />}
        {activeTab === 'pending' && <PendingContent />}
        {activeTab === 'reports' && <ReportsContent />}
        {activeTab === 'chapters' && <ChaptersContent />}
        {activeTab === 'settings' && <SettingsContent />}
        {activeTab === 'audit' && <AuditLogContent />}

        {selectedUser && <AdminUserDetailModal user={selectedUser} posts={posts} onClose={() => setSelectedUser(null)} onBan={onBanUser} />}
      </div>
    </div>
  );
};

// Share Poster Modal
const SharePosterModal = ({ post, onClose }) => {
  const shareUrl = window.location.href;
  const shareText = `Check out this issue: ${post.title} in ${post.city}. #IndiaAct`;

  const handleShare = (platform) => {
    let url = '';
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        alert('Link copied to clipboard!');
        return;
    }
    if (url) window.open(url, '_blank');
  };

  return (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-200 flex items-center justify-center p-4 animate-in fade-in">
    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95">
      <div className="bg-linear-to-br from-blue-600 to-indigo-700 p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><Shield size={100} /></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-white/20 backdrop-blur px-2 py-0.5 rounded text-xs font-medium border border-white/10">INDIA ACT</span>
            <span className="text-xs opacity-80 uppercase tracking-widest">Civic Drive</span>
          </div>
          <h2 className="text-2xl font-bold leading-tight mb-2">{post.title}</h2>
          <div className="flex items-center gap-2 text-blue-100 text-sm mb-6">
            <MapPin size={14} /> {post.location}
          </div>
        </div>
      </div>
      <div className="p-6 text-center">
        <div className="grid grid-cols-4 gap-4 mb-8">
           <button onClick={() => handleShare('whatsapp')} className="flex flex-col items-center gap-2 group">
             <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
               <MessageCircle size={24} />
             </div>
             <span className="text-xs text-gray-600 font-medium">WhatsApp</span>
           </button>
           <button onClick={() => handleShare('facebook')} className="flex flex-col items-center gap-2 group">
             <div className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
               <Facebook size={24} />
             </div>
             <span className="text-xs text-gray-600 font-medium">Facebook</span>
           </button>
           <button onClick={() => handleShare('twitter')} className="flex flex-col items-center gap-2 group">
             <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
               <Twitter size={24} />
             </div>
             <span className="text-xs text-gray-600 font-medium">X</span>
           </button>
           <button onClick={() => handleShare('copy')} className="flex flex-col items-center gap-2 group">
             <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 shadow-sm group-hover:scale-110 transition-transform">
               <LinkIcon size={24} />
             </div>
             <span className="text-xs text-gray-600 font-medium">Copy Link</span>
           </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button variant="primary" icon={Download} onClick={() => { alert('Poster downloaded!'); onClose(); }}>Save Image</Button>
        </div>
      </div>
    </div>
  </div>
  );
};

const PrivacyPolicyModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-200 flex items-center justify-center p-4 animate-in fade-in">
    <div className="bg-white rounded-[30px] w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
      </div>
      <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
        <p><strong>Effective Date:</strong> {new Date().toLocaleDateString()}</p>
        <p>Your privacy and safety are our top priorities. This policy outlines how we handle your data on the Act India platform.</p>
        <h3 className="text-lg font-bold text-gray-900 mt-4">1. Information We Collect</h3>
        <p>We collect information you provide directly, such as when you create an account, submit a report, or join a drive. For sensitive reports (Bribes/Scams), we automatically mask your identity in public feeds.</p>
        <h3 className="text-lg font-bold text-gray-900 mt-4">2. Data Security</h3>
        <p>We use industry-standard encryption to protect your personal details. Your phone number and email are never shared publicly.</p>
        <h3 className="text-lg font-bold text-gray-900 mt-4">3. Your Rights</h3>
        <p>You have the right to access, correct, or delete your personal information at any time via your profile settings.</p>
      </div>
      <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
        <Button variant="primary" onClick={onClose}>Close</Button>
      </div>
    </div>
  </div>
);

// Post Timeline with Update Capability
const PostTimeline = ({ timeline, canUpdate, onAddUpdate }) => {
  const [newUpdate, setNewUpdate] = useState('');
  const [showInput, setShowInput] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Activity size={18} className="text-blue-600" />
          Issue Journey
        </h3>
        {canUpdate && (
          <Button variant="outline" className="py-1! px-2! text-xs" onClick={() => setShowInput(!showInput)}>
            + Add Update
          </Button>
        )}
      </div>

      {showInput && (
        <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100 animate-in slide-in-from-top-2">
          <p className="text-xs font-bold text-blue-800 mb-2">ADD PROGRESS UPDATE</p>
          <textarea 
            className="w-full p-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:border-blue-500" 
            placeholder="What happened today? e.g., 'Municipal truck arrived'"
            value={newUpdate}
            onChange={(e) => setNewUpdate(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-2">
             <Button variant="ghost" className="py-1! px-2! text-xs" onClick={() => setShowInput(false)}>Cancel</Button>
             <Button variant="primary" className="py-1! px-2! text-xs" onClick={() => {
                onAddUpdate(newUpdate);
                setNewUpdate('');
                setShowInput(false);
             }}>Post Update</Button>
          </div>
        </div>
      )}

      <div className="relative pl-4 border-l-2 border-blue-100 space-y-8">
        {timeline.map((item, idx) => (
          <div key={idx} className="relative group">
            <div className={`absolute -left-5.25 top-1 w-3 h-3 rounded-full ring-4 ring-white transition-all
              ${idx === timeline.length - 1 ? 'bg-blue-600 scale-125' : 'bg-blue-300'}`}></div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${idx === timeline.length - 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                  {item.status}
                </span>
                {idx === timeline.length - 1 && <Badge className="bg-blue-100 text-blue-700">Current</Badge>}
              </div>
              <span className="text-xs text-gray-400 mb-1">{item.date}</span>
              {item.desc && (
                <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 mt-1 max-w-md">
                  {item.desc}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Post Card
const PostCard = ({ post, onClick, onVolunteer, onShare, onFlag, onLike, onEdit, currentUser, isDetailView = false }) => {
  const category = CATEGORIES.find(c => c.id === post.type) || CATEGORIES[0];
  const isResolved = post.status === 'Resolved';
  const isAuthor = currentUser && currentUser.id === post.authorId;
  const isVolunteering = currentUser && post.volunteers?.includes(currentUser.id);
  const isSensitive = post.type === 'bribe' || post.type === 'scam';
  
  return (
    <div className={`bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group relative border border-gray-100 flex flex-col overflow-hidden
      ${post.flags > 0 ? 'ring-2 ring-red-100' : ''} ${!isDetailView ? 'h-full' : ''}`}>
      
      {/* High Risk Overlay for flagged content */}
      {post.flags > 2 && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur z-20 flex flex-col items-center justify-center p-6 text-center">
           <AlertTriangle className="text-red-500 mb-2" size={32} />
           <p className="font-bold text-gray-900">Content Flagged for Review</p>
           <p className="text-xs text-gray-500">This post has received multiple reports and is hidden.</p>
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        {/* Header: Category & Status */}
        <div className="flex items-center justify-between mb-4">
           <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${category.bg} ${category.color}`}>
              <category.icon size={12} /> {category.label}
           </div>
           <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
              post.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-100' : 
              post.status === 'Action Taken' ? 'bg-blue-50 text-blue-700 border-blue-100' :
              'bg-gray-50 text-gray-600 border-gray-100'
           }`}>
              {post.status}
           </div>
        </div>

        {/* Title */}
        <h3 className={`font-bold text-[#1d1d1f] mb-2 leading-tight cursor-pointer hover:text-[#0071e3] transition-colors ${isDetailView ? 'text-2xl' : 'text-lg line-clamp-2'}`} onClick={() => onClick(post)}>
          {post.title}
        </h3>

        {/* Meta: Location & Date */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
           <span className="flex items-center gap-1"><MapPin size={12} /> {post.city}</span>
           <span className="w-1 h-1 rounded-full bg-gray-300"></span>
           <span>{post.date}</span>
        </div>

        {/* Description */}
        <p className={`text-sm text-gray-600 mb-4 ${!isDetailView ? 'line-clamp-3 flex-1' : ''}`}>
          {post.description}
        </p>

        {/* User Uploaded Media */}
        {(post.image || post.video || post.videoLink) && (
           <div className="mb-4 space-y-3">
              {post.image && (
                 <img src={post.image} alt="Report Evidence" className="w-full h-48 object-cover rounded-xl border border-gray-100" />
              )}
              {post.video && (
                 <video src={post.video} controls className="w-full max-h-64 rounded-xl border border-gray-100 bg-black" />
              )}
              {post.videoLink && (
                 <a href={post.videoLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium">
                    <ExternalLink size={16} /> Watch Video Evidence
                 </a>
              )}
           </div>
        )}

        {/* Evidence Gallery (Restored) */}
        {isResolved && post.evidence && (
           <div className="mb-4 rounded-xl overflow-hidden h-32 relative group/img cursor-pointer" onClick={() => onClick(post)}>
              <div className="absolute inset-0 flex">
                 <img src={post.evidence.before} className="w-1/2 h-full object-cover" alt="Before" />
                 <img src={post.evidence.after} className="w-1/2 h-full object-cover" alt="After" />
              </div>
              <div className="absolute inset-0 bg-black/10 group-hover/img:bg-transparent transition-colors"></div>
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-md">Fixed</div>
           </div>
        )}

        {/* Volunteer Drive Section */}
        {post.isVolunteerDrive && post.eventDate && (
           <div className="mb-4 bg-blue-50/80 border border-blue-100 rounded-xl p-3">
              <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-blue-900">
                      <div className="bg-white p-1.5 rounded-md shadow-sm text-blue-600">
                        <Calendar size={14} />
                      </div>
                      <div>
                        <div className="text-xs font-bold">{post.eventDate}</div>
                        <div className="text-[10px] text-blue-700/80 font-medium">{post.eventTime}</div>
                      </div>
                 </div>
                  {isResolved && <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full border border-green-200">Completed</span>}
              </div>
              
              <div className="flex gap-2">
                <Button 
                    variant={isResolved ? "secondary" : isAuthor ? "outline" : isVolunteering ? "secondary" : "primary"} 
                    className={`flex-1 py-2! px-3! text-xs! h-auto! justify-center ${isVolunteering && !isResolved ? 'bg-green-600 text-white hover:bg-green-700' : ''}`}
                    onClick={(e) => { e.stopPropagation(); if(!isAuthor && !isResolved) onVolunteer(post.id); }}
                    disabled={isAuthor || isResolved}
                >
                    {isResolved ? 'Event Ended' : isAuthor ? 'Organizer' : isVolunteering ? 'Joined' : 'Join Drive'}
                </Button>
                {isAuthor && (
                    <Button 
                    variant="secondary" 
                    className="py-2! px-3! text-xs! h-auto! bg-white border border-gray-200 shadow-sm hover:bg-gray-50" 
                    onClick={(e) => { e.stopPropagation(); onEdit && onEdit(post); }}
                    icon={Edit}
                    >
                    Edit
                    </Button>
                )}
              </div>
           </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button 
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors"
                onClick={(e) => { e.stopPropagation(); onLike && onLike(post.id); }}
              >
                 <ThumbsUp size={14} /> {post.upvotes}
              </button>
              <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#1d1d1f] transition-colors" onClick={() => onClick(post)}>
                 <MessageCircle size={14} /> {(post.comments || []).length}
              </button>
           </div>
           <div className="flex items-center gap-2">
              <button className="p-1.5 text-gray-400 hover:text-[#0071e3] hover:bg-blue-50 rounded-full transition-colors" onClick={(e) => {e.stopPropagation(); onShare(post)}}>
                 <Share2 size={14} />
              </button>
              <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" onClick={(e) => {e.stopPropagation(); onFlag(post.id)}}>
                 <Flag size={14} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

// Create Post
const CreatePost = ({ onBack, onSubmit, initialData }) => {
  const buildFormState = (seed = null) => {
    const base = {
      type: 'cleanliness', title: '', description: '', city: '', state: '', location: '',
      agreePolicy: false, agreeTruth: false,
      eventDate: '', eventTime: '',
      imageFile: null, imagePreview: null,
      videoFile: null, videoPreview: null,
      videoLink: ''
    };
    if (!seed) return base;
    const { image, video, ...rest } = seed;
    return {
      ...base,
      ...rest,
      imageFile: null,
      imagePreview: image || null,
      videoFile: null,
      videoPreview: video || null,
      agreePolicy: true,
      agreeTruth: true
    };
  };

  const [formData, setFormData] = useState(() => buildFormState(initialData || null));
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const MAX_DESC_LENGTH = 1000;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreePolicy || !formData.agreeTruth) return;

    // Safety: Auto-Masking Logic
    const maskedDesc = maskSensitiveData(formData.description);
    const maskedTitle = maskSensitiveData(formData.title);

    // Validation: Check for minimal content length
    if (maskedDesc.length < 10) {
      setError("Please provide more details about the incident.");
      return;
    }
    setError(null);
    setIsLoading(true);

    // Submit sanitized data
    await onSubmit({
      ...formData,
      title: maskedTitle,
      description: maskedDesc
    });
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft size={18} /> Back to Feed
      </button>

      <div className="bg-white rounded-[30px] shadow-xl shadow-gray-200/50 p-8 md:p-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{initialData ? 'Edit Report' : 'File a Report'} <FeatureInfo title="Reporting Guidelines" content="Choose the correct category. Provide clear details. Your report will be public but your personal details (phone/email) are kept private." /></h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">Category</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CATEGORIES.map(cat => (
                <div 
                  key={cat.id}
                  onClick={() => setFormData({...formData, type: cat.id})}
                  className={`p-4 rounded-2xl cursor-pointer transition-all flex flex-col items-center gap-2 text-center
                    ${formData.type === cat.id 
                      ? `${cat.bg} ring-2 ring-[#0071e3] ring-offset-2` 
                      : 'bg-[#f5f5f7] hover:bg-[#e8e8ed]'}`}
                >
                  <cat.icon className={formData.type === cat.id ? cat.color : 'text-gray-400'} size={24} />
                  <span className={`text-xs font-medium ${formData.type === cat.id ? 'text-gray-900' : 'text-gray-500'}`}>
                    {cat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {formData.type === 'volunteer' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-4">
              <div className="flex gap-3 text-sm text-blue-900">
                <Users className="shrink-0 mt-0.5 text-blue-600" size={18} />
                <div>
                  <p className="font-bold mb-1">Organize a Drive</p>
                  <p className="opacity-90">Set a date and time for the community to gather.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                  <input type="date" required className="w-full px-4 py-2 rounded-lg bg-white border border-blue-200 text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none"
                    value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Time</label>
                  <input type="time" required className="w-full px-4 py-2 rounded-lg bg-white border border-blue-200 text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none"
                    value={formData.eventTime} onChange={e => setFormData({...formData, eventTime: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {(formData.type === 'bribe' || formData.type === 'scam') && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-sm text-amber-900">
              <Shield className="shrink-0 mt-0.5 text-amber-600" size={18} />
              <div>
                <p className="font-bold mb-1">Safety Protocol Active</p>
                <p className="opacity-90">Our system automatically masks phone numbers. Do NOT name private individuals. Describe the role/office instead.</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" required className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all placeholder:text-gray-400"
                placeholder={formData.type === 'scam' ? "e.g., Fake Job Offer from XYZ Corp" : "e.g., Overflowing drain at Main Market"}
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all"
                  value={formData.state} onChange={e => setFormData({...formData, state: e.target.value, city: ''})} required>
                  <option value="">Select State</option>
                  {STATES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all"
                  value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} disabled={!formData.state} required>
                  <option value="">Select City</option>
                  {STATES.find(s => s.name === formData.state)?.cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
              <textarea required rows={4} className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none resize-none placeholder:text-gray-400"
                placeholder="Describe clearly. Upload evidence below if available."
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value.slice(0, MAX_DESC_LENGTH)})}
              />
              <div className="flex justify-between items-start mt-1">
                <p className="text-xs text-gray-400">Note: 10-digit mobile numbers will be masked (e.g., 98XXXXX123) to prevent doxxing.</p>
                <span className="text-xs text-gray-400 font-medium">
                  {formData.description.length}/{MAX_DESC_LENGTH}
                </span>
              </div>
            </div>
            
            {/* Media Upload Section */}
            <div className="space-y-3">
               <label className="block text-sm font-medium text-gray-700">Evidence (Optional)</label>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Image Upload */}
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                     <input 
                       type="file" 
                       accept="image/*" 
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                       onChange={(e) => {
                         const file = e.target.files[0];
                         if(file) {
                           const reader = new FileReader();
                           reader.onloadend = () => setFormData({...formData, imageFile: file, imagePreview: reader.result});
                           reader.readAsDataURL(file);
                         }
                       }}
                     />
                     {formData.imagePreview ? (
                        <div className="relative h-32 w-full group">
                           <img 
                             src={formData.imagePreview} 
                             alt="Preview" 
                             className="w-full h-full object-cover rounded-lg cursor-zoom-in hover:opacity-90 transition-opacity" 
                             onClick={() => setShowFullImage(true)}
                           />
                           <button 
                             type="button"
                             onClick={(e) => { e.preventDefault(); setFormData({...formData, imageFile: null, imagePreview: null}); }}
                             className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-sm z-10"
                           >
                             <X size={12} />
                           </button>
                        </div>
                     ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                           <Camera size={24} className="mb-2" />
                           <span className="text-xs">Upload Image</span>
                        </div>
                     )}
                  </div>

                  {/* Video Upload */}
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                     <input 
                       type="file" 
                       accept="video/*" 
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                       onChange={(e) => {
                         const file = e.target.files[0];
                         if(file) {
                           if (file.size > 5 * 1024 * 1024) {
                             alert("Video too large for prototype (Max 5MB). Please use a link instead.");
                             return;
                           }
                           const reader = new FileReader();
                           reader.onloadend = () => setFormData({...formData, videoFile: file, videoPreview: reader.result});
                           reader.readAsDataURL(file);
                         }
                       }}
                     />
                     {formData.videoPreview ? (
                        <div className="relative h-32 w-full flex items-center justify-center bg-black rounded-lg">
                           <video src={formData.videoPreview} className="w-full h-full object-contain rounded-lg" />
                           <button 
                             type="button"
                             onClick={(e) => { e.preventDefault(); setFormData({...formData, videoFile: null, videoPreview: null}); }}
                             className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-sm z-10"
                           >
                             <X size={12} />
                           </button>
                        </div>
                     ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                           <Video size={24} className="mb-2" />
                           <span className="text-xs">Upload Video</span>
                        </div>
                     )}
                  </div>
               </div>

               {/* Video Link */}
               <div>
                  <input 
                    type="url" 
                    className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Or paste a video link (YouTube, etc.)"
                    value={formData.videoLink} 
                    onChange={e => setFormData({...formData, videoLink: e.target.value})}
                  />
               </div>
            </div>

            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" className="mt-1" checked={formData.agreePolicy} onChange={e => setFormData({...formData, agreePolicy: e.target.checked})} />
              <span className="text-sm text-gray-600">I agree to the <strong>Safety Policy</strong> (No doxxing, no defamation).</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" className="mt-1" checked={formData.agreeTruth} onChange={e => setFormData({...formData, agreeTruth: e.target.checked})} />
              <span className="text-sm text-gray-600">I certify this information is truthful.</span>
            </label>
          </div>

          <Button variant="primary" className="w-full py-3 text-lg shadow-blue-300/50 shadow-lg" loading={isLoading} disabled={!formData.agreePolicy || !formData.agreeTruth}>
            {initialData ? 'Update Report' : formData.type === 'volunteer' ? 'Create Drive' : 'Submit Report'}
          </Button>
        </form>

        {/* Full Screen Image Preview Modal */}
        {showFullImage && formData.imagePreview && (
          <div className="fixed inset-0 bg-black/90 z-250 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowFullImage(false)}>
            <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={32} />
            </button>
            <img src={formData.imagePreview} alt="Full Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </div>
        )}
      </div>
    </div>
  );
};

// Login Screen Component
const LoginScreen = ({ onAuthSuccess, onBack, onSignUpClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await onAuthSuccess({ email, password });
    } catch (err) {
      setError(err?.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSignIn = async (provider) => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithProvider(provider);
    } catch (err) {
      let msg = err?.message || `${provider} login failed.`;
      if (msg.includes('provider is not enabled')) {
        msg = `${provider} is disabled in Supabase. Enable it in Authentication > Providers.`;
      }
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-[30px] shadow-xl p-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-linear-to-tr from-blue-600 to-teal-400 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-200">
            <Shield size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 text-sm mt-1">Sign in to continue your civic journey</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button variant="outline" className="justify-center border-gray-200 hover:bg-gray-50 text-gray-700" onClick={() => handleProviderSignIn('google')}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Google
          </Button>
          <Button variant="outline" className="justify-center border-gray-200 hover:bg-gray-50 text-gray-700" onClick={() => handleProviderSignIn('apple')}>
            <img src="https://www.svgrepo.com/show/448234/apple.svg" alt="Apple" className="w-5 h-5" />
            Apple
          </Button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email or Mobile</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all placeholder:text-gray-400"
                placeholder="citizen@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="password" 
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all placeholder:text-gray-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
              <span className="text-gray-600">Remember me</span>
            </label>
            <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">Forgot password?</button>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <Button variant="primary" className="w-full py-3 text-base shadow-lg shadow-blue-200" loading={isLoading}>
            Login
          </Button>
        </form>
        
        <div className="mt-8 text-center pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-4">Don't have an account?</p>
          <Button variant="outline" className="w-full" onClick={onSignUpClick}>Create New Account</Button>
          <button onClick={onBack} className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors">Back to Home</button>
        </div>
      </div>
    </div>
  );
};

// SignUp Screen Component
const SignUpScreen = ({ onAuthSuccess, onBack }) => {
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', city: '', occupation: '', age: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await onAuthSuccess(formData);
    } catch (err) {
      setError(err?.message || 'Signup failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSignUp = async (provider) => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithProvider(provider);
    } catch (err) {
      let msg = err?.message || `${provider} signup failed.`;
      if (msg.includes('provider is not enabled')) {
        msg = `${provider} is disabled in Supabase. Enable it in Authentication > Providers.`;
      }
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-[30px] shadow-xl p-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Join the Movement</h2>
          <p className="text-gray-500 text-sm mt-1">Create an account to start reporting</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button variant="outline" className="justify-center border-gray-200 hover:bg-gray-50 text-gray-700" onClick={() => handleProviderSignUp('google')}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Google
          </Button>
          <Button variant="outline" className="justify-center border-gray-200 hover:bg-gray-50 text-gray-700" onClick={() => handleProviderSignUp('apple')}>
            <img src="https://www.svgrepo.com/show/448234/apple.svg" alt="Apple" className="w-5 h-5" />
            Apple
          </Button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" required className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none"
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" required className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none"
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input type="number" required className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none"
                value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" required className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none"
                value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
              <input type="text" required className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none"
                value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none"
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" required className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none"
              value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
          </div>
          
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button variant="primary" className="w-full py-3 mt-2" loading={isLoading}>
            Sign Up
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <button onClick={onBack} className="text-sm text-blue-600 hover:underline">Already have an account? Login</button>
        </div>
      </div>
    </div>
  );
};

// Edit Profile Component
const EditProfile = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ 
    name: user.name, 
    email: user.email,
    phone: user.phone || '',
    city: user.city || '',
    occupation: user.occupation || '',
    age: user.age || ''
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...user, ...formData });
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="bg-white rounded-[30px] shadow-lg p-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" required className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none"
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none"
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input type="number" className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none"
                value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none"
                value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none"
                value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="primary" className="flex-1">Save Changes</Button>
            <Button variant="secondary" className="flex-1" onClick={(e) => { e.preventDefault(); onCancel(); }}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Alert Settings Component
const AlertSettings = ({ user, onUpdateUser, onSimulateAlert }) => {
  const [config, setConfig] = useState(user.alertPreferences || {
    city: user.city || 'Mumbai',
    categories: ['scam', 'volunteer', 'cleanliness'],
    frequency: 'daily',
    channels: ['email']
  });
  
  const [isSaved, setIsSaved] = useState(false);

  const handleToggleCategory = (cat) => {
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.includes(cat) 
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const handleToggleChannel = (ch) => {
    setConfig(prev => ({
      ...prev,
      channels: prev.channels.includes(ch)
        ? prev.channels.filter(c => c !== ch)
        : [...prev.channels, ch]
    }));
  };

  const handleSave = () => {
    onUpdateUser({ ...user, alertPreferences: config });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    
    // Simulate an alert based on new settings
    if (onSimulateAlert) onSimulateAlert(config);
  };

  return (
    <div className="bg-white rounded-[30px] shadow-sm p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
          <Bell size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Smart Alert Preferences <FeatureInfo title="Custom Alerts" content="Choose which types of issues you want to be notified about. You can also set the frequency of these notifications." /></h3>
          <p className="text-sm text-gray-500">Customize what updates you receive via Email & SMS.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Target City</label>
            <select 
              value={config.city}
              onChange={(e) => setConfig({...config, city: e.target.value})}
              className="w-full p-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none"
            >
              {[...new Set(STATES.flatMap(s => s.cities))].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <p className="text-xs text-gray-500 mt-1">You will receive trends and drive alerts for this location.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Alert Categories</label>
            <div className="space-y-2">
              {['scam', 'cleanliness', 'volunteer', 'bribe'].map(cat => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100">
                  <input 
                    type="checkbox" 
                    checked={config.categories.includes(cat)}
                    onChange={() => handleToggleCategory(cat)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="capitalize text-gray-700">{cat} Alerts</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Notification Channels</label>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all
                ${config.channels.includes('email') ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-500'}`}>
                <input type="checkbox" className="hidden" checked={config.channels.includes('email')} onChange={() => handleToggleChannel('email')} />
                <Mail size={18} /> Email
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all
                ${config.channels.includes('mobile') ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-500'}`}>
                <input type="checkbox" className="hidden" checked={config.channels.includes('mobile')} onChange={() => handleToggleChannel('mobile')} />
                <Smartphone size={18} /> SMS
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Sent to: {user.email} {config.channels.includes('mobile') && `& ${user.phone || 'your mobile'}`}
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Frequency</label>
            <div className="grid grid-cols-3 gap-2">
              {['instant', 'daily', 'weekly'].map(freq => (
                <button
                  key={freq}
                  onClick={() => setConfig({...config, frequency: freq})}
                  className={`py-2 px-3 rounded-lg text-sm font-medium capitalize border transition-all
                    ${config.frequency === freq 
                      ? 'bg-gray-900 text-white border-gray-900' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button variant="primary" className="w-full" onClick={handleSave} disabled={isSaved}>
              {isSaved ? 'Preferences Saved!' : 'Save Alert Settings'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Preview Section */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <h4 className="text-sm font-bold text-gray-900 mb-4">Preview: What you'll receive</h4>
        <div className="space-y-3">
          {config.categories.includes('scam') && (
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
              <AlertTriangle size={16} className="text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-gray-900">Scams trending in {config.city}</p>
                <p className="text-xs text-gray-600">"Fake Electricity Bill SMS" reported 50+ times today.</p>
              </div>
            </div>
          )}
          {config.categories.includes('volunteer') && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <Users size={16} className="text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-gray-900">Cleanup drive near you</p>
                <p className="text-xs text-gray-600">Join 50 volunteers at {config.city} Station this Sunday.</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <BarChart2 size={16} className="text-gray-600 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-gray-900">Monthly Summary</p>
              <p className="text-xs text-gray-600">{config.city} reported 12 issues this month. 4 resolved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PointsHistoryModal = ({ onClose, points }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-200 flex items-center justify-center p-4 animate-in fade-in">
    <div className="bg-white rounded-[30px] w-full max-w-md shadow-2xl overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div>
            <h3 className="font-bold text-lg text-gray-900">Points History</h3>
            <p className="text-xs text-gray-500">Total Earned: {points}</p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
      </div>
      <div className="p-0 max-h-[60vh] overflow-y-auto">
        {[
            { action: 'Report Resolved', points: '+50', date: '2 days ago', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
            { action: 'Joined Volunteer Drive', points: '+30', date: '5 days ago', icon: Users, color: 'text-blue-600 bg-blue-50' },
            { action: 'Report Verified', points: '+25', date: '1 week ago', icon: Shield, color: 'text-purple-600 bg-purple-50' },
            { action: 'Filed Report', points: '+10', date: '2 weeks ago', icon: FileText, color: 'text-orange-600 bg-orange-50' },
            { action: 'Vouched for Issue', points: '+2', date: '2 weeks ago', icon: ThumbsUp, color: 'text-gray-600 bg-gray-50' },
        ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${item.color}`}>
                        <item.icon size={16} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">{item.action}</p>
                        <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                </div>
                <span className="font-mono font-bold text-green-600">{item.points}</span>
            </div>
        ))}
      </div>
    </div>
  </div>
);

// User Dashboard Component
const UserDashboard = ({ user, posts, onViewChange, onLogout, onUpdateUser, onSimulateAlert }) => {
  const [activeTab, setActiveTab] = useState('activity');
  const [showPointsHistory, setShowPointsHistory] = useState(false);
  const myPosts = posts.filter(p => p.authorId === user.id);
  const resolvedCount = myPosts.filter(p => p.status === 'Resolved').length;
  const totalUpvotes = myPosts.reduce((acc, curr) => acc + (curr.upvotes || 0), 0);

  const myActivity = useMemo(() => {
    return posts.filter(p => 
      (p.upvotedBy?.includes(user.id)) || 
      (p.vouchedBy?.includes(user.id)) || 
      (p.comments?.some(c => c.author_id === user.id))
    );
  }, [posts, user.id]);

  // Dynamic Level & Badges Logic
  const userLevel = resolvedCount >= 10 ? 'Level 3 Citizen' : resolvedCount >= 3 ? 'Level 2 Citizen' : 'Level 1 Citizen';
  const userBadges = [];
  if (resolvedCount >= 5) userBadges.push({ label: 'Verified Reporter', className: 'bg-yellow-100 text-yellow-800' });
  if (totalUpvotes >= 50) userBadges.push({ label: 'Community Voice', className: 'bg-blue-100 text-blue-700' });
  if (userBadges.length === 0) userBadges.push({ label: 'New Member', className: 'bg-gray-100 text-gray-600' });

  const messages = [
    { id: 1, sender: 'Ravi K.', senderId: 'user_123', text: 'Hey, thanks for the update on the Dadar issue! Great work.', time: '2 hours ago', unread: true },
    { id: 2, sender: 'Admin Team', senderId: 'admin', text: 'Your report #202 has been verified successfully. Keep it up!', time: '1 day ago', unread: false },
    { id: 3, sender: 'Priya S.', senderId: 'user_456', text: 'Can you share the exact location pin for the cleanup drive next week?', time: '2 days ago', unread: false },
  ];

  // Points Level Logic
  const POINTS_LEVELS = [
    { level: 1, max: 100, label: 'Citizen' },
    { level: 2, max: 500, label: 'Active Contributor' },
    { level: 3, max: 1000, label: 'Community Guardian' },
    { level: 4, max: 2500, label: 'Civic Leader' },
    { level: 5, max: 5000, label: 'Change Maker' }
  ];

  const currentPoints = user.points || 0;
  const nextLevelIndex = POINTS_LEVELS.findIndex(l => l.max > currentPoints);
  const isMaxLevel = nextLevelIndex === -1;
  
  const currentLevelData = isMaxLevel ? POINTS_LEVELS[POINTS_LEVELS.length - 1] : (nextLevelIndex > 0 ? POINTS_LEVELS[nextLevelIndex - 1] : { max: 0, label: 'Newcomer' });
  const nextLevelData = isMaxLevel ? null : POINTS_LEVELS[nextLevelIndex];
  
  const pointsNeeded = nextLevelData ? nextLevelData.max - currentPoints : 0;
  const progressPercent = isMaxLevel ? 100 : Math.min(100, Math.max(0, ((currentPoints - currentLevelData.max) / (nextLevelData.max - currentLevelData.max)) * 100));

  // Permissions Logic
  const permissions = [
    { label: 'Submit Reports', active: true, icon: FileText },
    { label: 'Comment & Discuss', active: true, icon: MessageCircle },
    { label: 'Verify Issues', active: user.role === 'admin' || userLevel === 'Level 3 Citizen', icon: CheckCircle, req: 'Req: Level 3+' },
    { label: 'Moderation Access', active: user.role === 'admin', icon: Shield, req: 'Req: Admin' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Profile Card */}
      <div className="p-0.75 rounded-4xl bg-linear-to-r from-orange-500 via-white to-green-500 mb-8 shadow-2xl">
      <div className="bg-white rounded-[30px] p-8 md:p-10 relative overflow-hidden h-full">
        <div className="absolute top-0 right-0 p-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white">
            {user.name.charAt(0)}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
            <button onClick={() => onViewChange('edit-profile')} className="text-xs text-blue-600 font-medium hover:underline flex items-center justify-center md:justify-start gap-1"><Edit size={12}/> Edit Profile</button>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1"><User size={14}/> {user.email || 'citizen@indiaact.org'}</span>
              <span className="hidden md:inline">•</span>
              {user.occupation && <span className="flex items-center gap-1"><Briefcase size={14}/> {user.occupation}</span>}
              {user.occupation && <span className="hidden md:inline">•</span>}
              {user.city && <span className="flex items-center gap-1"><MapPin size={14}/> {user.city}</span>}
              {user.city && <span className="hidden md:inline">•</span>}
              <span>Member since {user.joinedDate || 'Oct 2023'}</span>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
              <Badge className="bg-blue-100 text-blue-700 px-3 py-1">{userLevel}</Badge>
              {userBadges.map((badge, i) => (
                <Badge key={i} className={`${badge.className} px-3 py-1`}>{badge.label}</Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-35">
            {user.role === 'admin' && (
              <Button variant="primary" onClick={() => onViewChange('admin')} icon={LayoutDashboard}>Admin Panel</Button>
            )}
            <Button variant="outline" onClick={() => onViewChange('create')} icon={Plus}>New Report</Button>
            <Button variant="secondary" onClick={onLogout} icon={LogOut} className="text-red-600 hover:bg-red-50 border-red-100">Logout</Button>
          </div>
        </div>
      </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Permissions */}
        <div className="space-y-6">
          {/* Impact Stats */}
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Activity size={18} className="text-blue-600"/> Your Impact <FeatureInfo title="Impact Stats" content="Track your contributions. 'Reports' are issues you filed. 'Resolved' are those fixed. 'Upvotes' show community support." /></h3>
            
            {/* Progress Bar */}
            <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Level</span>
                        <div className="font-bold text-indigo-600">{currentLevelData.label}</div>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-bold text-gray-400">{isMaxLevel ? 'Max Level Reached!' : `${pointsNeeded} pts to ${nextLevelData.label}`}</span>
                    </div>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-blue-500 to-purple-600 transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900">{myPosts.length}</div>
                <div className="text-xs text-gray-500 font-medium">Reports</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{resolvedCount}</div>
                <div className="text-xs text-green-700 font-medium">Resolved</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{totalUpvotes}</div>
                <div className="text-xs text-blue-700 font-medium">Upvotes</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => setShowPointsHistory(true)}>
                <div className="text-2xl font-bold text-purple-600">{user.points || 0}</div>
                <div className="text-xs text-purple-700 font-medium flex items-center justify-center gap-1">Civic Points <ChevronRight size={10} /></div>
              </div>
            </div>
          </div>

          {/* Permissions / Capabilities */}
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Shield size={18} className="text-gray-600"/> Account Permissions <FeatureInfo title="Permissions" content="As you contribute more, you unlock new abilities like verifying other reports or moderating content." /></h3>
            <div className="space-y-3">
              {permissions.map((perm, idx) => (
                <div key={idx} className={`flex items-center justify-between p-2 rounded-lg ${perm.active ? 'bg-gray-50' : 'bg-gray-50 opacity-60'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${perm.active ? 'bg-white text-blue-600 shadow-sm' : 'bg-gray-200 text-gray-500'}`}>
                      <perm.icon size={14} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{perm.label}</span>
                  </div>
                  {perm.active ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <span className="text-[10px] font-bold text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded bg-white">{perm.req}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[30px] shadow-sm overflow-hidden min-h-125 p-6">
            <div className="flex p-1 bg-[#f5f5f7] rounded-xl mb-6">
              <button 
                onClick={() => setActiveTab('activity')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'activity' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
              >
                My Reports
              </button>
              <button 
                onClick={() => setActiveTab('my_activity')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'my_activity' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
              >
                My Activity
              </button>
              <button 
                onClick={() => setActiveTab('messages')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'messages' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
              >
                Messages
                {messages.some(m => m.unread) && <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">New</span>}
              </button>
              <button 
                onClick={() => setActiveTab('alerts')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'alerts' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
              >
                Smart Alerts
                {user.alertPreferences && <span className="ml-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">On</span>}
              </button>
            </div>
            
            <div className="divide-y divide-gray-100">
              {activeTab === 'activity' ? (
                myPosts.length > 0 ? myPosts.map(post => (
                  <div key={post.id} className="p-5 hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => onViewChange('post', { post })}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border
                          ${post.status === 'Resolved' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                          {post.status}
                        </span>
                        <span className="text-xs text-gray-400">{post.date}</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{post.title}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2">{post.description}</p>
                    
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><ThumbsUp size={12}/> {post.upvotes}</span>
                      <span className="flex items-center gap-1"><MessageCircle size={12}/> {(post.comments || []).length}</span>
                      <span className="flex items-center gap-1"><MapPin size={12}/> {post.city}</span>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                      <FileText size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No reports yet</h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-xs">Be the change you want to see. Report your first issue today.</p>
                    <Button variant="primary" onClick={() => onViewChange('create')}>File a Report</Button>
                  </div>
                )
              ) : activeTab === 'my_activity' ? (
                myActivity.length > 0 ? myActivity.map(post => (
                  <div key={post.id} className="p-5 hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => onViewChange('post', { post })}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                          {post.upvotedBy?.includes(user.id) ? 'Upvoted' : post.vouchedBy?.includes(user.id) ? 'Vouched' : 'Commented'}
                        </span>
                        <span className="text-xs text-gray-400">• {post.date}</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{post.title}</h4>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><User size={12}/> {post.author}</span>
                      <span className="flex items-center gap-1"><MapPin size={12}/> {post.city}</span>
                    </div>
                  </div>
                )) : (
                  <div className="p-10 text-center text-gray-500">
                    <p>No activity yet. Start engaging with the community!</p>
                  </div>
                )
              ) : activeTab === 'messages' ? (
                messages.length > 0 ? messages.map(msg => (
                  <div key={msg.id} className={`p-5 hover:bg-gray-50 transition-colors cursor-pointer ${msg.unread ? 'bg-blue-50/30' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-linear-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
                           {msg.sender.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-900 text-sm">{msg.sender}</span>
                      </div>
                      <span className="text-xs text-gray-400">{msg.time}</span>
                    </div>
                    <p className={`text-sm ${msg.unread ? 'text-gray-900 font-medium' : 'text-gray-600'} pl-10`}>{msg.text}</p>
                    <div className="pl-10 mt-2 flex gap-3">
                       <button className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"><MessageCircle size={12}/> Reply</button>
                       {msg.unread && <button className="text-xs text-gray-400 hover:text-gray-600">Mark as Read</button>}
                    </div>
                  </div>
                )) : (
                  <div className="p-10 text-center text-gray-500">No messages yet.</div>
                )
              ) : activeTab === 'alerts' ? (
                <AlertSettings user={user} onUpdateUser={onUpdateUser} onSimulateAlert={onSimulateAlert} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
      {showPointsHistory && <PointsHistoryModal points={user.points || 0} onClose={() => setShowPointsHistory(false)} />}
    </div>
  );
};

// Impact Gallery Page Component
const ImpactGalleryPage = () => {
  const [filterState, setFilterState] = useState('All');
  const [filterCity, setFilterCity] = useState('All');

  // Animation state for counter
  const [count, setCount] = useState(0);
  const targetCount = 42; // Hypothetical impacts per minute

  useEffect(() => {
    let startTimestamp = null;
    const duration = 2000; // 2 seconds
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * targetCount));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, []);

  // Dynamic city options based on state selection
  const availableCities = useMemo(() => {
    if (filterState === 'All') return [...new Set(STATES.flatMap(s => s.cities))].sort();
    const state = STATES.find(s => s.name === filterState);
    return state ? state.cities : [];
  }, [filterState]);

  return (
    <div className="max-w-245 mx-auto py-12 px-6">
      {/* Header */}
      <div className="p-0.75 rounded-4xl bg-linear-to-r from-orange-500 via-white to-green-500 mb-12 shadow-2xl">
      <div className="bg-[#1d1d1f] rounded-[30px] p-10 md:p-16 text-white relative overflow-hidden text-center h-full">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        <div className="relative z-10">
          <Badge className="bg-green-500/20 text-green-300 border-none mb-6 inline-flex items-center gap-1"><CheckCircle size={12}/> Real Change</Badge>
          
          <div className="mb-8">
             <div className="flex items-baseline justify-center gap-3">
                <span className="text-7xl md:text-9xl font-bold text-white tracking-tighter">{count}</span>
                <span className="text-xl md:text-3xl text-gray-400 font-medium">Impacts / min</span>
             </div>
             <p className="text-sm text-green-400 font-mono mt-2 animate-pulse flex items-center justify-center gap-2"><span className="w-2 h-2 bg-green-400 rounded-full"></span> Live Activity Monitor</p>
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6 leading-tight text-gray-200">Success Stories Launching</h1>
          <p className="text-[#86868b] text-lg max-w-2xl mx-auto font-medium">
            See the change. Verified before and after stories from across the nation will be shown here.
          </p>
        </div>
      </div>
      </div>

      {/* Stats & Filters */}
      <div className="bg-white rounded-[30px] p-8 shadow-sm border border-gray-100 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 border-b border-gray-100 pb-8">
           <div className="text-center">
             <div className="text-4xl font-bold text-[#1d1d1f] mb-1">0</div>
             <div className="text-xs font-bold text-[#86868b] uppercase tracking-wider">Issues Resolved</div>
           </div>
           <div className="text-center border-l border-r border-gray-100">
             <div className="text-4xl font-bold text-[#0071e3] mb-1">0</div>
             <div className="text-xs font-bold text-[#86868b] uppercase tracking-wider">Community Vouches</div>
           </div>
           <div className="text-center">
             <div className="text-4xl font-bold text-green-600 mb-1">0</div>
             <div className="text-xs font-bold text-[#86868b] uppercase tracking-wider">Cities Transformed</div>
           </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
           <div className="flex items-center gap-2 text-sm font-medium text-[#1d1d1f]">
             <Filter size={16} /> Filter by:
           </div>
           <select 
             value={filterState}
             onChange={(e) => { setFilterState(e.target.value); setFilterCity('All'); }}
             className="px-4 py-2 rounded-xl bg-[#f5f5f7] border-none text-sm focus:ring-2 focus:ring-[#0071e3]/20 cursor-pointer min-w-37.5 text-[#1d1d1f] font-medium"
           >
             <option value="All">All States</option>
             {STATES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
           </select>
           <select 
             value={filterCity}
             onChange={(e) => setFilterCity(e.target.value)}
             className="px-4 py-2 rounded-xl bg-[#f5f5f7] border-none text-sm focus:ring-2 focus:ring-[#0071e3]/20 cursor-pointer min-w-37.5 text-[#1d1d1f] font-medium"
           >
             <option value="All">All Cities</option>
             {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
           </select>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
          <Camera size={40} />
        </div>
        <h3 className="text-2xl font-bold text-[#1d1d1f] mb-3">Impact Stories Processing</h3>
        <p className="text-[#86868b] max-w-md mx-auto mb-8">
          Our team is verifying the first batch of resolved reports. Real transformation stories will appear here shortly.
        </p>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN APP COMPONENT                                                        */
/* -------------------------------------------------------------------------- */

export default function App() {
  const [view, setView] = useState('home'); 
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postComments, setPostComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentsPage, setCommentsPage] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const MAX_COMMENT_LENGTH = 300;
  const [editingPost, setEditingPost] = useState(null);
  const [myChapterIds, setMyChapterIds] = useState([]);
  
  // NEW: Home Location Filter State
  const [homeCityFilter, setHomeCityFilter] = useState('All');
  
  // Persistence Logic
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('indiaAct_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });
  const [appIsLoading, setAppIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState(null);
  const [sharePost, setSharePost] = useState(null);
  const [subscribedCities, setSubscribedCities] = useState([]);
  const [resourceLinks, setResourceLinks] = useState(DEFAULT_RESOURCES);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  
  // Fetch posts from Supabase on load
  useEffect(() => {
    let isActive = true;
    const loadReports = async () => {
      setAppIsLoading(true);
      const cached = localStorage.getItem('indiaAct_posts');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (isActive && Array.isArray(parsed)) {
            setPosts(parsed);
          }
        } catch (e) {
          console.warn('Failed to parse cached posts', e);
        }
      }

      try {
        const rows = await fetchReports();
        if (!isActive) return;
        const mapped = rows.map(mapReportRowToPost);
        setPosts(mapped);
        localStorage.setItem('indiaAct_posts', JSON.stringify(mapped));
      } catch (err) {
        console.error(err);
        if (isActive) {
          setToast({ message: err?.message || 'Failed to load reports.', type: 'error' });
        }
      } finally {
        if (isActive) setAppIsLoading(false);
      }
    };

    loadReports();
    return () => { isActive = false; };
  }, []);

  useEffect(() => {
    localStorage.setItem('indiaAct_posts', JSON.stringify(posts));
  }, [posts]);
  
  const [user, setUser] = useState(null);

  // Initial auth bootstrap + listener
  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const current = await getCurrentUser();
        if (active) setUser(current);
      } catch (err) {
        console.error(err);
      }
    };
    init();
    const unsubscribe = onAuthStateChange((nextUser) => {
      if (active) setUser(nextUser);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const [allUsers, setAllUsers] = useState(() => {
    const saved = localStorage.getItem('indiaAct_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  useEffect(() => {
    localStorage.setItem('indiaAct_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    const loadProfiles = async () => {
      if (!user || user.role !== 'admin') return;
      try {
        const profiles = await listProfiles();
        const normalized = profiles.map((p) => ({
          id: p.id,
          name: p.name,
          email: p.email || '',
          role: p.role || 'user',
          status: p.status || 'active',
          joinedDate: p.created_at
            ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            : '',
          city: p.city || '',
          phone: p.phone || '',
          points: p.points || 0,
          occupation: p.occupation || ''
        }));
        setAllUsers(normalized);
      } catch (err) {
        console.error(err);
      }
    };
    loadProfiles();
  }, [user]);

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowSignups: true,
    globalAnnouncement: '',
    autoModeration: true
  });
  const [auditLog, setAuditLog] = useState(() => {
    const saved = localStorage.getItem('indiaAct_auditLog');
    return saved ? JSON.parse(saved) : [{ id: Date.now(), timestamp: new Date().toLocaleString(), action: 'SYSTEM: Application Initialized.' }];
  });

  // Sync Real Users from Supabase for Admin Panel
  useEffect(() => {
    if (user) {
      setAllUsers((prev) => {
        const exists = prev.some((u) => u.id === user.id);
        if (exists) {
          return prev.map((u) => (u.id === user.id ? { ...u, ...user } : u));
        }
        return [user, ...prev];
      });
    }
  }, [user]);

  // Fetch user's chapter memberships
  useEffect(() => {
    const loadMemberships = async () => {
      if (!user) {
        setMyChapterIds([]);
        return;
      }
      try {
        const ids = await listMyChapterIds(user.id);
        setMyChapterIds(ids);
      } catch (err) {
        console.error(err);
      }
    };
    loadMemberships();
  }, [user]);

  const awardPoints = async (userId, points) => {
    try {
      if (user && user.id === userId) {
        setUser(prev => ({ ...prev, points: (prev.points || 0) + points }));
      }
    } catch (e) {
      console.error("Failed to award points", e);
    }
  };

  const [chapters, setChapters] = useState(() => {
    const saved = localStorage.getItem('indiaAct_chapters');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('indiaAct_chapters', JSON.stringify(chapters));
  }, [chapters]);

  const handleJoinChapter = async (chapter) => {
    if (!user) { setToast({ message: "Please login to join a chapter.", type: 'error' }); return; }
    if (user?.status === 'banned') { setToast({ message: "Account banned. Action restricted.", type: 'error' }); return; }
    if (myChapterIds.includes(chapter.id)) {
      setToast({ message: `You are already a member of ${chapter.name}.`, type: 'info' });
      return;
    }
    
    setMyChapterIds(prev => [...new Set([...prev, chapter.id])]);
    setChapters(prev => prev.map(c => c.id === chapter.id ? { ...c, members: (c.members || 0) + 1 } : c));

    try {
      await joinChapter(chapter.id, user.id);
      setToast({ message: `Joined ${chapter.name}!`, type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: err?.message || 'Failed to join chapter.', type: 'error' });
    }
  };

  const handleRegisterChapter = async (formData) => {
    if (!user) { setToast({ message: "Please login to register a chapter.", type: 'error' }); return; }
    if (user?.status === 'banned') { setToast({ message: "Account banned. Action restricted.", type: 'error' }); return; }
    try {
      const created = await createChapter(formData, user.id);
      setChapters(prev => [{ ...created, members: 1 }, ...prev]);
      setMyChapterIds(prev => [...new Set([...prev, created.id])]);
      setToast({ message: "Chapter registered! Pending verification.", type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: err?.message || 'Failed to register chapter.', type: 'error' });
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const loadUserChannels = async () => {
      if (!user) {
        setNotifications([]);
        setSubscribedCities([]);
        return;
      }
      try {
        const [notificationRows, subscriptionRows] = await Promise.all([
          listNotifications(user.id),
          listSubscriptions(user.id)
        ]);

        setNotifications(
          notificationRows.map((n) => ({
            id: n.id,
            text: n.payload?.text || n.kind,
            time: new Date(n.created_at).toLocaleString(),
            read: !!n.read
          }))
        );
        setSubscribedCities(subscriptionRows.map((s) => s.city));
      } catch (err) {
        console.error(err);
      }
    };
    loadUserChannels();
  }, [user]);
  
  useEffect(() => {
    localStorage.setItem('indiaAct_auditLog', JSON.stringify(auditLog));
  }, [auditLog]);

  const navigate = (newView, params = {}) => {
    setView(newView);
    if (params.city) setSelectedCity(params.city);
    if (params.post) setSelectedPost(params.post);
    window.scrollTo(0, 0);
  };

  // Fetch chapters + resources once
  useEffect(() => {
    const load = async () => {
      try {
        const [chapterRows, resourceRows] = await Promise.all([listChapters(), listResourceLinks()]);
        setChapters(chapterRows);
        setResourceLinks(resourceRows);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const logAdminAction = (action) => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      action: `SUPERADMIN: ${action}`
    };
    setAuditLog(prev => [newLog, ...prev]);
  };

  const handleAuthSuccess = async ({ email, password }) => {
    const loggedInUser = await signIn({ email, password });
    setUser(loggedInUser);
    setView('dashboard');
    setToast({ message: 'Welcome back!', type: 'success' });
  };

  const handleRegisterUser = async (payload) => {
    const newUser = await signUp(payload);
    setUser(newUser);
    setAllUsers(prev => {
      const exists = prev.some((u) => u.id === newUser.id);
      return exists ? prev.map((u) => (u.id === newUser.id ? newUser : u)) : [newUser, ...prev];
    });
    setView('dashboard');
    setToast({ message: 'Account created successfully!', type: 'success' });
  };

  const handleUpdateProfile = async (updatedUser) => {
    const profile = await updateMyProfile(updatedUser.id, updatedUser);
    const normalized = { ...updatedUser, ...profile };
    setUser(normalized);
    setAllUsers(prev => prev.map(u => u.id === normalized.id ? normalized : u));
    setView('dashboard');
    setToast({ message: 'Profile updated successfully!', type: 'success' });
  };

  const handleSimulateAlert = (config) => {
    const newNotification = {
      id: Date.now(),
      text: `Smart Alert: Found 3 new ${config.categories[0]} reports in ${config.city}. Sent to ${config.channels.join(' & ')}.`,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    // Security Fix: Removed client-side createNotification call. 
    // Alerts should only be generated by the backend system.
    setToast({ message: `Test alert sent to ${config.channels.join(' & ')}`, type: 'success' });
  };

  const handleLogout = async () => {
    await signOut().catch(console.error);
    setUser(null);
    setToast({ message: 'Logged out successfully.', type: 'success' });
    navigate('home');
  };

  const handleSavePost = async (data) => {
    if (user?.status === 'banned') { setToast({ message: "Account banned. Action restricted.", type: 'error' }); return; }
    // Remove form-specific fields that don't exist in the database
    const { imageFile, videoFile, ...postData } = data;

    if (editingPost) {
      // Update existing post
      if (postData.type !== 'volunteer') {
        postData.eventDate = null;
        postData.eventTime = null;
      }

      setAppIsLoading(true);
      try {
        const mediaUpdates = await uploadEvidence(editingPost.id, imageFile, videoFile);
        const payload = {
          type: postData.type,
          title: postData.title,
          description: postData.description,
          state: postData.state,
          city: postData.city,
          location: postData.location || `${postData.city}, ${postData.state}`,
          event_date: postData.type === 'volunteer' ? (postData.eventDate || null) : null,
          event_time: postData.type === 'volunteer' ? (postData.eventTime || null) : null,
          video_link: postData.videoLink || null,
          ...(mediaUpdates.image_url ? { image_url: mediaUpdates.image_url } : {}),
          ...(mediaUpdates.video_url ? { video_url: mediaUpdates.video_url } : {})
        };

        const savedRow = await updateReport(editingPost.id, payload);
        const savedPost = mapReportRowToPost(savedRow);

        setPosts(prev => prev.map(p => p.id === editingPost.id ? savedPost : p));
        setToast({ message: 'Report updated successfully!', type: 'success' });
        setEditingPost(null);
        navigate('post', { post: savedPost });
      } catch (err) {
        console.error(err);
        setToast({ message: err?.message || 'Failed to update report.', type: 'error' });
      } finally {
        setAppIsLoading(false);
      }
      return;
    }

    setAppIsLoading(true);
    try {
      const reportId = crypto.randomUUID();
      const { image_url, video_url } = await uploadEvidence(reportId, imageFile, videoFile);

      const payload = {
        id: reportId,
        type: postData.type,
        title: postData.title,
        description: postData.description,
        state: postData.state,
        city: postData.city,
        location: postData.location || `${postData.city}, ${postData.state}`,
        event_date: postData.type === 'volunteer' ? (postData.eventDate || null) : null,
        event_time: postData.type === 'volunteer' ? (postData.eventTime || null) : null,
        image_url,
        video_url,
        video_link: postData.videoLink || null,
        author_name: user?.name || 'Anonymous',
        author_id: user?.id || null,
        status: 'Open'
      };

      const savedRow = await createReport(payload);
      const savedPost = mapReportRowToPost(savedRow);
      setPosts(prev => [savedPost, ...prev]);

      if (user) {
        await awardPoints(user.id, 10);
        setToast({ message: 'Report submitted! +10 Civic Points earned.', type: 'success' });
      } else {
        setToast({ message: 'Report submitted successfully!', type: 'success' });
      }
      navigate('post', { post: savedPost });
    } catch (err) {
      console.error(err);
      setToast({ message: err?.message || 'Failed to submit report.', type: 'error' });
    } finally {
      setAppIsLoading(false);
    }
  };

  const handleEditPostClick = (post) => {
    setEditingPost(post);
    navigate('create');
  };

  const handleLike = async (postId) => {
    if (user?.status === 'banned') { setToast({ message: "Account banned.", type: 'error' }); return; }
    if (!user) { setToast({ message: "Login to support this issue.", type: 'error' }); return; }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.upvotedBy?.includes(user.id)) {
      setToast({ message: "You have already supported this.", type: 'error' });
      return;
    }

    // Optimistic Update
    const nextUpvotes = (post.upvotes || 0) + 1;
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, upvotes: nextUpvotes, upvotedBy: [...(p.upvotedBy || []), user.id] };
      }
      return p;
    }));
    if (selectedPost?.id === postId) {
      setSelectedPost(prev => ({ ...prev, upvotes: nextUpvotes, upvotedBy: [...(prev.upvotedBy || []), user.id] }));
    }

    try {
      const { active, counters } = await toggleVote(postId, user.id);
      if (!active) {
        setToast({ message: "You have already supported this.", type: 'error' });
        return;
      }
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, upvotes: counters.upvotes } : p));
      if (selectedPost?.id === postId) {
        setSelectedPost(prev => ({ ...prev, upvotes: counters.upvotes }));
      }
    } catch (err) {
      console.error(err);
      setToast({ message: err?.message || 'Failed to sync upvote.', type: 'error' });
    }
  };

  // Fetch comments when entering post view and subscribe to changes
  useEffect(() => {
    const COMMENTS_PER_PAGE = 5;

    if (view === 'post' && selectedPost) {
      const loadInitialComments = async () => {
        try {
          const { rows, count } = await listComments(selectedPost.id, { limit: COMMENTS_PER_PAGE, offset: 0 });
          setPostComments(rows);
          setTotalComments(count);
          setCommentsPage(1);
        } catch (err) {
          console.error(err);
          setPostComments(selectedPost.comments || []);
          setTotalComments((selectedPost.comments || []).length);
          setCommentsPage(1);
        }
      };
      loadInitialComments();
    } else {
      setPostComments([]);
      setCommentText('');
      setTotalComments(0);
      setCommentsPage(0);
    }

    return () => {
    };
  }, [view, selectedPost]);

  const handleLoadMoreComments = async () => {
    if (!selectedPost) return;
    const COMMENTS_PER_PAGE = 5;
    try {
      const { rows } = await listComments(selectedPost.id, {
        limit: COMMENTS_PER_PAGE,
        offset: commentsPage * COMMENTS_PER_PAGE
      });
      setPostComments((prev) => [...rows, ...prev]);
      setCommentsPage((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      setToast({ message: err?.message || 'Failed to load older comments.', type: 'error' });
    }
  };

  const handlePostComment = async (text = commentText, parentId = null) => {
    const content = text.trim();
    if (!content) return;
    if (user?.status === 'banned') { setToast({ message: "Account banned. Action restricted.", type: 'error' }); return; }
    
    if (content.length > MAX_COMMENT_LENGTH) {
      setToast({ message: `Comment exceeds ${MAX_COMMENT_LENGTH} characters.`, type: 'error' });
      return;
    }

    if (!user) {
      setToast({ message: 'Please login to comment.', type: 'error' });
      return;
    }

    if (!selectedPost) {
      setToast({ message: 'Error: No post selected.', type: 'error' });
      return;
    }

    let newComment;
    try {
      newComment = await createComment({
        reportId: selectedPost.id,
        authorId: user.id,
        authorName: user.name,
        text: content,
        parentId
      });
    } catch (err) {
      console.error(err);
      setToast({ message: err?.message || 'Failed to post comment.', type: 'error' });
      return;
    }

    setPostComments(prev => [...prev, newComment]);
    
    // Sync comment count in main posts list so feed updates immediately
    setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, comments: [...(p.comments || []), newComment] } : p));

    if (parentId) {
      setReplyText('');
      setReplyingToId(null);
    } else {
      setCommentText('');
    }
    setTotalComments(prev => prev + 1);
    setToast({ message: 'Comment posted!', type: 'success' });
  };

  const handleDeleteComment = async (commentId) => {
    await deleteCommentRecord(commentId).catch((err) => {
      console.error(err);
      setToast({ message: err?.message || 'Failed to delete comment.', type: 'error' });
    });
    setPostComments(prev => prev.filter(c => c.id !== commentId));
    setTotalComments(prev => Math.max(0, prev - 1));
    
    // Sync comment count in main posts list
    setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, comments: (p.comments || []).filter(c => c.id !== commentId) } : p));

    setToast({ message: 'Comment deleted.', type: 'success' });
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText('');
  };

  const handleSaveEdit = async (commentId) => {
    if (!editText.trim()) return;
    
    if (editText.length > MAX_COMMENT_LENGTH) {
      setToast({ message: `Comment exceeds ${MAX_COMMENT_LENGTH} characters.`, type: 'error' });
      return;
    }

    try {
      const updated = await updateCommentRecord(commentId, editText);
      setPostComments(prev => prev.map(c => c.id === commentId ? { ...c, text: updated.text, updated_at: updated.updated_at } : c));
    } catch (err) {
      console.error(err);
      setToast({ message: err?.message || 'Failed to update comment.', type: 'error' });
      return;
    }
    setEditingCommentId(null);

    setToast({ message: 'Comment updated.', type: 'success' });
  };

  // Build comment tree for nested display
  const commentTree = useMemo(() => {
    const map = {};
    const roots = [];
    
    // Create a map of all comments
    postComments.forEach(c => {
      map[c.id] = { ...c, children: [] };
    });

    postComments.forEach(c => {
      if (c.parent_id && map[c.parent_id]) {
        map[c.parent_id].children.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });
    return roots;
  }, [postComments]);

  // Community Policing: Vouch System
  const handleVouch = async (postId) => {
    if (!user) { setToast({ message: "Login to vouch for this issue.", type: 'error' }); return; }
    if (user?.status === 'banned') { setToast({ message: "Account banned.", type: 'error' }); return; }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.vouchedBy?.includes(user.id)) {
      setToast({ message: "You have already vouched for this.", type: 'error' });
      return;
    }
    
    const nextCount = (post.vouchCount || 0) + 1;
    const nextScore = getTrustScore(nextCount, post.evidence);
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, vouchCount: nextCount, trustScore: nextScore, vouchedBy: [...(p.vouchedBy || []), user.id] };
      }
      return p;
    }));
    if (selectedPost?.id === postId) {
      setSelectedPost(prev => ({ ...prev, vouchCount: nextCount, trustScore: nextScore, vouchedBy: [...(prev.vouchedBy || []), user.id] }));
    }
    setToast({ message: "You vouched for this issue. Trust Score updated.", type: 'success' });

    // Award points
    await awardPoints(user.id, 2); // Voucher gets 2 points
    if (post.authorId && post.authorId !== 'anon') await awardPoints(post.authorId, 5); // Author gets 5 points

    try {
      const { active, counters } = await toggleVouch(postId, user.id);
      if (!active) {
        setToast({ message: "You have already vouched for this.", type: 'error' });
        return;
      }
      const syncedScore = getTrustScore(counters.vouch_count || nextCount, post.evidence);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, vouchCount: counters.vouch_count, trustScore: syncedScore } : p));
      if (selectedPost?.id === postId) {
        setSelectedPost(prev => ({ ...prev, vouchCount: counters.vouch_count, trustScore: syncedScore }));
      }
    } catch (err) {
      console.error(err);
      setToast({ message: err?.message || 'Failed to sync vouch.', type: 'error' });
    }
  };

  // Moderation: Flagging System
  const handleFlag = async (postId) => {
    if (user?.status === 'banned') { setToast({ message: "Account banned.", type: 'error' }); return; }
    if (!user) { setToast({ message: "Login to flag this report.", type: 'error' }); return; }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.flaggedBy?.includes(user.id)) {
      setToast({ message: "You have already flagged this.", type: 'error' });
      return;
    }

    const nextFlags = (post.flags || 0) + 1;
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, flags: nextFlags, flaggedBy: [...(p.flaggedBy || []), user.id] };
      }
      return p;
    }));
    if (selectedPost?.id === postId) {
      setSelectedPost(prev => ({ ...prev, flags: nextFlags, flaggedBy: [...(prev.flaggedBy || []), user.id] }));
    }
    setToast({ message: "Post flagged for review.", type: 'success' });

    try {
      const result = await flagReport(postId, user.id, 'User flag');
      if (result.alreadyFlagged) {
        setToast({ message: "You have already flagged this.", type: 'error' });
        return;
      }
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, flags: result.counters.flags } : p));
      if (selectedPost?.id === postId) {
        setSelectedPost(prev => ({ ...prev, flags: result.counters.flags }));
      }
    } catch (err) {
      console.error(err);
      setToast({ message: err?.message || 'Failed to sync flag.', type: 'error' });
    }
  };

  const handleVolunteer = async (postId) => {
    if (!user) { setToast({ message: "Please login to join!", type: 'error' }); return; }
    if (user?.status === 'banned') { setToast({ message: "Account banned.", type: 'error' }); return; }
    
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const hasVolunteered = p.volunteers?.includes(user.id);
        const newVolunteers = hasVolunteered ? p.volunteers.filter(id => id !== user.id) : [...(p.volunteers || []), user.id];
        return { ...p, volunteers: newVolunteers };
      }
      return p;
    }));

    const post = posts.find(p => p.id === postId);
    if (post) {
      const hasVolunteered = post.volunteers?.includes(user.id);
      
      if (!hasVolunteered) {
        await awardPoints(user.id, 30); // Joining a drive
        setToast({ message: "Joined drive! +30 Civic Points earned.", type: 'success' });
      } else { 
        // Deduct points if leaving to prevent farming
        // Note: In a real app, we'd check if points were actually awarded first, 
        // but for now this prevents the infinite loop exploit.
        await awardPoints(user.id, -30); 
        setToast({ message: "You left the drive. Points reverted.", type: 'info' });
      }
    }
  };

  // Post Lifecycle: Add Update
  const handleAddTimelineUpdate = async (postId, updateText) => {
    if (user?.status === 'banned') { setToast({ message: "Account banned.", type: 'error' }); return; }
    if (!updateText.trim()) return;
    
    const newEvent = { status: 'Update', date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }), desc: updateText };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          timeline: [...(p.timeline || []), newEvent]
        };
      }
      return p;
    }));

    setToast({ message: "Timeline updated successfully.", type: 'success' });
  };

  // Recursive function to render comments
  const renderComment = (c, depth = 0) => (
    <div key={c.id} className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm group ${depth > 0 ? 'ml-4 md:ml-8 mt-3 border-l-4 border-l-blue-100' : 'mb-3'}`}>
      <div className="flex justify-between items-start mb-1">
        <div className="font-medium text-sm text-gray-900 flex items-center gap-2">
           {c.author_name} {c.author_name === 'Admin' && <Badge className="bg-blue-100 text-blue-700">MOD</Badge>}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {user && (
            <button 
              onClick={() => setReplyingToId(replyingToId === c.id ? null : c.id)}
              className="text-gray-400 hover:text-blue-600 p-1"
              title="Reply"
            >
              <Reply size={14} />
            </button>
          )}
          {(user && (user.id === c.author_id || user.role === 'admin')) && editingCommentId !== c.id && (
            <>
              <button 
                onClick={() => handleEditComment(c)}
                className="text-gray-400 hover:text-blue-600 p-1"
                title="Edit"
              >
                <Edit size={14} />
              </button>
              <button 
                onClick={() => handleDeleteComment(c.id)}
                className="text-gray-400 hover:text-red-600 p-1"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
      
      {editingCommentId === c.id ? (
        <div className="mt-2">
          <input 
            type="text" 
            className="w-full p-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 mb-2"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(c.id)}
            autoFocus
          />
          <div className="flex justify-between items-center">
            <span className={`text-xs ${editText.length > MAX_COMMENT_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
              {editText.length}/{MAX_COMMENT_LENGTH}
            </span>
            <div className="flex gap-2">
              <button onClick={handleCancelEdit} className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1">Cancel</button>
              <button onClick={() => handleSaveEdit(c.id)} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md font-medium hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-600">{c.text}</p>
      )}

      {replyingToId === c.id && (
        <div className="mt-3 pl-4 border-l-2 border-gray-200">
          <input 
            type="text" 
            placeholder="Write a reply..." 
            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 mb-2"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePostComment(replyText, c.id)}
            autoFocus
          />
          <div className="flex justify-between items-center">
             <span className={`text-xs ${replyText.length > MAX_COMMENT_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>{replyText.length}/{MAX_COMMENT_LENGTH}</span>
             <button onClick={() => handlePostComment(replyText, c.id)} className="text-xs bg-gray-900 text-white px-3 py-1 rounded-md font-medium hover:bg-black">Reply</button>
          </div>
        </div>
      )}

      {c.children && c.children.length > 0 && (
        <div className="mt-2">
          {c.children.map(child => renderComment(child, depth + 1))}
        </div>
      )}
    </div>
  );

  // Admin Actions
  const handleDeletePost = async (id, reason) => {
    setPosts(posts.filter(p => p.id !== id));
    if (user?.role === 'admin') {
      try {
        await deleteReportAdmin({ adminUserId: user.id, reportId: id });
      } catch (err) {
        console.error(err);
        setToast({ message: err?.message || 'Failed to delete report in backend.', type: 'error' });
      }
    }
    
    const reasonLog = reason ? ` Reason: ${reason}` : '';
    logAdminAction(`Deleted post with ID #${id}.${reasonLog}`);
    setToast({ message: 'Post permanently removed.', type: 'success' });
  };

  const handleBulkDeletePosts = async (ids) => {
    setPosts(posts.filter(p => !ids.includes(p.id)));
    if (user?.role === 'admin') {
      await Promise.all(ids.map((id) => deleteReportAdmin({ adminUserId: user.id, reportId: id }).catch(console.error)));
    }
    logAdminAction(`Bulk deleted ${ids.length} posts.`);
    setToast({ message: `${ids.length} posts permanently removed.`, type: 'success' });
  };

  const handleBulkUpdateStatus = async (ids, newStatus) => {
    const newEvent = { status: newStatus, date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), desc: `Bulk status update to ${newStatus} by Admin.` };
    
    setPosts(posts.map(p => {
      if (ids.includes(p.id)) {
        return { ...p, status: newStatus, timeline: [...(p.timeline || []), newEvent] };
      }
      return p;
    }));

    logAdminAction(`Bulk updated status to '${newStatus}' for ${ids.length} posts.`);
    setToast({ message: `Updated ${ids.length} posts to ${newStatus}`, type: 'success' });
  };

  const handleVerifyPost = async (id) => {
    const newEvent = { status: 'Verified', date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), desc: 'Verified by Admin.' };

    setPosts(posts.map(p => {
      if (p.id === id) {
        return { 
          ...p, 
          status: 'Verified', 
          badges: [...(p.badges || []), 'Verified'],
          timeline: [...(p.timeline || []), newEvent]
        };
      }
      return p;
    }));

    if (user?.role === 'admin') {
      try {
        await verifyReportAdmin({ adminUserId: user.id, reportId: id });
      } catch (err) {
        console.error(err);
        setToast({ message: err?.message || 'Failed to verify report in backend.', type: 'error' });
      }
    } else {
      await updateReport(id, { status: 'Verified' }).catch(console.error);
    }

    logAdminAction(`Verified post with ID #${id}.`);
    setToast({ message: 'Post verified.', type: 'success' });
  };

  const handleResolvePost = async (id) => {
    const afterPhotoUrl = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=400";
    const targetPost = posts.find((p) => p.id === id);
    
    const newEvent = { status: 'Resolved', date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), desc: 'Issue resolved and verified with photographic evidence.' };

    setPosts(posts.map(p => {
      if (p.id === id) {
        return { 
          ...p, 
          status: 'Resolved', 
          evidence: { ...p.evidence, after: afterPhotoUrl, before: p.evidence?.before || 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&q=80&w=400' },
          timeline: [...(p.timeline || []), newEvent]
        };
      }
      return p;
    }));

    
    if (user?.role === 'admin') {
      try {
        await resolveReportAdmin({ adminUserId: user.id, reportId: id, afterImageUrl: afterPhotoUrl });
      } catch (err) {
        console.error(err);
        setToast({ message: err?.message || 'Failed to resolve report in backend.', type: 'error' });
      }
    } else {
      await updateReport(id, { status: 'Resolved', image_url: afterPhotoUrl }).catch(console.error);
    }

    if (targetPost?.authorId && targetPost.authorId !== 'anon') {
      await awardPoints(targetPost.authorId, 50);
    }

    logAdminAction(`Resolved post with ID #${id}.`);
    setToast({ message: 'Issue resolved and Impact Card generated!', type: 'success' });
  };

  const handleBanUser = async (userId) => {
    let userName = '';
    let newStatus = '';
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        userName = u.name;
        newStatus = u.status === 'banned' ? 'active' : 'banned';
        return { ...u, status: newStatus };
      }
      return u;
    }));

    if (user?.role === 'admin' && newStatus) {
      try {
        await updateUserStatusAdmin({ adminUserId: user.id, userId, status: newStatus });
      } catch (err) {
        console.error(err);
      }
    }

    logAdminAction(`${newStatus === 'banned' ? 'Banned' : 'Unbanned'} user: ${userName} (ID: ${userId}).`);
    setToast({ message: 'User status updated', type: 'success' });
  };

  const handleBulkBanUser = async (ids) => {
    setAllUsers(prev => prev.map(u => ids.includes(u.id) ? { ...u, status: 'banned' } : u));
    if (user?.role === 'admin') {
      await Promise.all(ids.map((id) => updateUserStatusAdmin({ adminUserId: user.id, userId: id, status: 'banned' }).catch(console.error)));
    }
    logAdminAction(`Bulk banned ${ids.length} users.`);
    setToast({ message: `${ids.length} users banned.`, type: 'success' });
  };

  const handleAdminEditPost = async (postToEdit) => {
    const newTitle = prompt("Enter new title:", postToEdit.title);
    if (newTitle) {
      setPosts(prev => prev.map(p => p.id === postToEdit.id ? { ...p, title: newTitle } : p));

      logAdminAction(`Edited post title for ID #${postToEdit.id}.`);
      setToast({ message: 'Post updated by Admin', type: 'success' });
    }
  };

  const handleUpdateSettings = (newSettings) => {
    setSystemSettings(newSettings);
    logAdminAction(`Updated system settings.`);
    setToast({ message: 'System settings saved', type: 'success' });
  };

  const handleVerifyChapter = async (chapterId) => {
    // Optimistic update
    setChapters(prev => prev.map(c => c.id === chapterId ? { ...c, verified: true } : c));
    setToast({ message: 'Chapter verified successfully', type: 'success' });
    logAdminAction(`Verified chapter ID #${chapterId}.`);
  };

  const handleDeleteChapter = async (chapterId) => {
    setChapters(prev => prev.filter(c => c.id !== chapterId));
    setToast({ message: 'Chapter removed', type: 'success' });
    logAdminAction(`Deleted chapter ID #${chapterId}.`);
  };

  const handleDismissFlag = async (id) => {
    setPosts(posts.map(p => p.id === id ? { ...p, flags: 0 } : p));

    setToast({ message: 'Flags dismissed.', type: 'success' });
    logAdminAction(`Dismissed flags for post ID #${id}.`);
  };

  const handleSubscribe = () => {
     if(!selectedCity) return;
     if (!user) { setToast({ message: 'Please login to manage alerts.', type: 'error' }); return; }
     if(subscribedCities.includes(selectedCity)) {
        setSubscribedCities(prev => prev.filter(c => c !== selectedCity));
        if (user?.id) {
          unsubscribeAlerts({ userId: user.id, city: selectedCity }).catch(console.error);
        }
        setToast({ message: `Unsubscribed from ${selectedCity}.`, type: 'success' });
     } else {
        setSubscribedCities(prev => [...prev, selectedCity]);
        if (user?.id) {
          subscribeAlerts({ userId: user.id, city: selectedCity, categories: ['all'], channels: ['in_app', 'email'] }).catch(console.error);
        }
        setToast({ message: `Alerts active for ${selectedCity}!`, type: 'success' });
     }
  };

  const feedPosts = useMemo(() => {
    let filtered = posts;
    if (view === 'city' && selectedCity) {
      filtered = posts.filter(p => p.city === selectedCity);
    }
    // Filter out posts with high flags for regular view (Auto-Moderation)
    // Only show posts that have been verified/approved (status is not 'Open')
    return filtered.filter(p => p.flags < 3 && p.status !== 'Open');
  }, [posts, view, selectedCity]);

  // Derived filtered list for Home View
  const homeFilteredPosts = useMemo(() => {
    let list = feedPosts;
    if (homeCityFilter !== 'All') {
      list = list.filter(p => p.city === homeCityFilter);
    }
    return list.slice(0, 6);
  }, [feedPosts, homeCityFilter]);

  const renderContent = () => {
    switch(view) {
      case 'login':
        return <LoginScreen onAuthSuccess={handleAuthSuccess} onBack={() => navigate('home')} onSignUpClick={() => navigate('signup')} />;

      case 'signup':
        return <SignUpScreen onAuthSuccess={handleRegisterUser} onBack={() => navigate('login')} />;

      case 'dashboard':
        return user ? <UserDashboard user={user} posts={posts} onViewChange={navigate} onLogout={handleLogout} onUpdateUser={handleUpdateProfile} onSimulateAlert={handleSimulateAlert} /> : <LoginScreen onAuthSuccess={handleAuthSuccess} onBack={() => navigate('home')} onSignUpClick={() => navigate('signup')} />;

      case 'edit-profile':
        return user ? <EditProfile user={user} onSave={handleUpdateProfile} onCancel={() => navigate('dashboard')} /> : <LoginScreen onAuthSuccess={handleAuthSuccess} onBack={() => navigate('home')} onSignUpClick={() => navigate('signup')} />;

      case 'home':
        return (
          <>
            <Hero onViewChange={navigate} />
            <div className="max-w-245 mx-auto px-6 py-12">
               <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                 <div>
                    <h2 className="text-2xl font-semibold text-[#1d1d1f]">Trending Issues <FeatureInfo title="Trending Feed" content="These are the most active issues in your area. They are sorted by severity and community engagement (upvotes/vouches)." /></h2>
                    <p className="text-sm text-[#86868b] font-medium">High impact reports near you</p>
                 </div>
                 
                 {/* NEW: Area Filter Bar */}
                 <div className="flex items-center gap-2 bg-white p-2 rounded-full shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 pl-2">
                       <MapPin size={16} />
                       <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">Filter:</span>
                    </div>
                    <select 
                      value={homeCityFilter}
                      onChange={(e) => setHomeCityFilter(e.target.value)}
                      className="bg-transparent border-none text-[#1d1d1f] text-sm font-medium focus:ring-0 block p-1.5 outline-none cursor-pointer"
                    >
                      <option value="All">All India</option>
                      {[...new Set(STATES.flatMap(s => s.cities))].map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => {
                          setToast({ message: "Detecting location...", type: 'success' });
                          setTimeout(() => {
                              setHomeCityFilter('Mumbai'); 
                              setToast({ message: "Location detected: Mumbai", type: 'success' });
                          }, 800);
                      }}
                      className="text-xs text-[#0071e3] font-medium hover:underline flex items-center gap-1 px-3 border-l border-gray-200"
                    >
                      <Navigation size={12} /> Locate Me
                    </button>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {homeFilteredPosts.length > 0 ? homeFilteredPosts.map(post => (
                   <PostCard 
                      key={post.id} 
                      post={post} 
                      onClick={(p) => navigate('post', { post: p })} 
                      onVolunteer={handleVolunteer} 
                      onShare={setSharePost}
                      onFlag={handleFlag}
                      onLike={handleLike}
                      onEdit={handleEditPostClick}
                      currentUser={user}
                    />
                 )) : (
                   <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-gray-500">No issues reported in {homeCityFilter} yet.</p>
                      <button onClick={() => setHomeCityFilter('All')} className="text-blue-600 text-sm font-medium mt-2">View All India</button>
                   </div>
                 )}
               </div>
               
               <div className="mt-6 text-center">
                 <button onClick={() => navigate('explore')} className="text-[#0071e3] text-sm font-medium hover:underline flex items-center gap-1 justify-center">View Full Map <ChevronRight size={14} /></button>
               </div>
            </div>
            <HeroOfTheWeek />
            <HowItWorks />
            <ImpactWall posts={posts} onViewChange={navigate} onLike={handleLike} />
            <ChaptersPromo onViewChange={navigate} />
            <SmartAlertsPromo onViewChange={navigate} user={user} />
            <MotivationSection onViewChange={navigate} />
          </>
        );
      
      case 'explore':
        return <Explore onCitySelect={(city) => navigate('city', { city })} posts={posts} user={user} />;

      case 'chapters':
        return <Chapters chapters={chapters} onJoin={handleJoinChapter} onRegister={handleRegisterChapter} user={user} myChapterIds={myChapterIds} />;

      case 'leaderboard':
        return <Leaderboard onBack={() => navigate('home')} />;

      case 'resources':
        return <CivicResourcesPage />;

      case 'impact':
        return <ImpactGalleryPage posts={posts} />;

      case 'city': {
        const isSubscribed = subscribedCities.includes(selectedCity);
        const stats = { scams: 12, resolved: 45, volunteers: 120 };

        return (
          <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-4">
                    <button onClick={() => navigate('explore')} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={20} /></button>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{selectedCity}</h1>
                      <p className="text-gray-500 text-sm">Community Dashboard</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <Button variant={isSubscribed ? "secondary" : "outline"} className={isSubscribed ? "bg-blue-50 text-blue-700 border-blue-200" : ""} onClick={handleSubscribe}>
                       {isSubscribed ? <Bell size={16} className="fill-current" /> : <Bell size={16} />}
                       {isSubscribed ? 'Alerts On' : 'Subscribe'}
                    </Button>
                    <Button variant="secondary" icon={Download} onClick={() => setToast({ message: 'Generating PDF Report...', type: 'success' })}>Report</Button>
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                 <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <div className="text-red-800 text-xs font-bold uppercase mb-1">Scams Reported</div>
                    <div className="text-2xl font-bold text-red-900">{stats.scams}</div>
                 </div>
                 <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <div className="text-emerald-800 text-xs font-bold uppercase mb-1">Cleanliness Resolved</div>
                    <div className="text-2xl font-bold text-emerald-900">{stats.resolved}%</div>
                 </div>
                 <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="text-blue-800 text-xs font-bold uppercase mb-1">Volunteers</div>
                    <div className="text-2xl font-bold text-blue-900">{stats.volunteers}</div>
                 </div>
              </div>

              {feedPosts.length > 0 ? (
                <div className="space-y-6">
                {feedPosts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onClick={(p) => navigate('post', { post: p })} 
                    onVolunteer={handleVolunteer} 
                    onShare={setSharePost}
                    onFlag={handleFlag}
                    onLike={handleLike}
                    onEdit={handleEditPostClick}
                    currentUser={user}
                  />
                ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <p className="text-gray-500 mb-4">No reports here yet.</p>
                  <Button variant="primary" onClick={() => navigate('create')}>Start a movement</Button>
                </div>
              )}
            </div>

            <div className="lg:w-1/3 space-y-6">
              <div className="bg-linear-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="font-bold text-indigo-900 text-lg mb-2">College Chapters</h3>
                <p className="text-indigo-700 text-sm mb-4">Start a student unit in {selectedCity}.</p>
                <Button variant="primary" className="w-full bg-indigo-600 hover:bg-indigo-700 border-none" onClick={() => navigate('chapters')}>Register Unit</Button>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText size={18} /> Resources</h3>
                <ul className="space-y-3">
                   {resourceLinks.map((r, i) => (
                      <li key={i} className="group">
                         <a href={r.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-sm font-medium text-gray-700 group-hover:text-blue-600">
                            {r.title} <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                         </a>
                         <p className="text-xs text-gray-500">{r.desc}</p>
                      </li>
                   ))}
                </ul>
              </div>
            </div>
          </div>
        );
      }

      case 'create':
        return <CreatePost key={editingPost?.id || 'new'} onBack={() => { setEditingPost(null); navigate('home'); }} onSubmit={handleSavePost} initialData={editingPost} />;
      
      case 'admin':
        // Edge Case: Verify admin role before rendering dashboard
        if (user?.role !== 'admin') {
          return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <Shield size={64} className="text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Access Restricted</h2>
              <p className="text-gray-500 mb-6 max-w-md">This area is reserved for administrators. Please return to the main site.</p>
              <Button variant="primary" onClick={() => navigate('home')}>Go Home</Button>
            </div>
          );
        }
        return (
          <AdminDashboard 
            posts={posts} 
            users={allUsers}
            settings={systemSettings}
            auditLog={auditLog}
            chapters={chapters}
            onDelete={handleDeletePost} 
            onVerify={handleVerifyPost} 
            onDismissFlag={handleDismissFlag} 
            onResolve={handleResolvePost}
            onEditPost={handleAdminEditPost}
            onBanUser={handleBanUser}
            onVerifyChapter={handleVerifyChapter}
            onDeleteChapter={handleDeleteChapter}
            onUpdateSettings={handleUpdateSettings}
            onBulkDelete={handleBulkDeletePosts}
            onBulkUpdateStatus={handleBulkUpdateStatus}
            onBulkBan={handleBulkBanUser}
          />
        );

      case 'post':
        return selectedPost && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Navigation */}
            <button onClick={() => navigate('home')} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-900 transition-colors font-medium">
              <ArrowLeft size={20} /> Back to Feed
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Main Content */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Main Post Card (Customized for Detail View) */}
                <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header Image / Map Placeholder / Category Banner */}
                  <div className="relative h-48 bg-linear-to-r from-blue-600 to-indigo-700 p-8 text-white flex flex-col justify-end">
                     <div className="absolute top-0 right-0 p-6 opacity-10">
                        {selectedPost.type === 'volunteer' ? <Users size={120} /> : <AlertTriangle size={120} />}
                     </div>
                     <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                           <Badge className="bg-white/20 text-white border-none backdrop-blur-md">{selectedPost.type.toUpperCase()}</Badge>
                           <span className="text-blue-100 text-sm flex items-center gap-1"><Clock size={14}/> {selectedPost.date}</span>
                        </div>
                        <h1 className="text-3xl font-bold leading-tight">{selectedPost.title}</h1>
                     </div>
                  </div>

                  <div className="p-8">
                    {/* Author Info */}
                    <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                             {(selectedPost.type === 'bribe' || selectedPost.type === 'scam') ? 'A' : selectedPost.author.charAt(0)}
                          </div>
                          <div>
                             <div className="font-bold text-gray-900">{(selectedPost.type === 'bribe' || selectedPost.type === 'scam') ? 'Anonymous Citizen' : selectedPost.author}</div>
                             <div className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={12}/> {selectedPost.location}</div>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => setSharePost(selectedPost)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors"><Share2 size={20}/></button>
                          <button onClick={() => handleFlag(selectedPost.id)} className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"><Flag size={20}/></button>
                       </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 text-lg leading-relaxed mb-8 whitespace-pre-wrap">
                       {selectedPost.description}
                    </p>

                    {/* Evidence / Images */}
                    {selectedPost.evidence && (
                       <div className="grid grid-cols-2 gap-4 mb-8">
                          {selectedPost.evidence.before && (
                             <div className="space-y-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Before</span>
                                <img src={selectedPost.evidence.before} alt="Before" className="w-full h-48 object-cover rounded-2xl border border-gray-100" />
                             </div>
                          )}
                          {selectedPost.evidence.after && (
                             <div className="space-y-2">
                                <span className="text-xs font-bold text-green-600 uppercase tracking-wider">After (Resolved)</span>
                                <img src={selectedPost.evidence.after} alt="After" className="w-full h-48 object-cover rounded-2xl border border-green-100 ring-2 ring-green-50" />
                             </div>
                          )}
                       </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                       <div className="flex gap-4">
                          <button 
                            onClick={() => handleLike(selectedPost.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors font-medium"
                          >
                             <ThumbsUp size={18} /> {selectedPost.upvotes} Support
                          </button>
                          <button 
                            onClick={() => handleVouch(selectedPost.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-600 transition-colors font-medium"
                          >
                             <CheckCircle size={18} /> {selectedPost.vouchCount} Verify
                          </button>
                       </div>
                       {user && user.id === selectedPost.authorId && (
                          <Button variant="outline" onClick={() => handleEditPostClick(selectedPost)} icon={Edit} className="py-2!">Edit Post</Button>
                       )}
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <PostTimeline 
                  timeline={selectedPost.timeline} 
                  canUpdate={user && user.id === selectedPost.authorId}
                  onAddUpdate={(text) => handleAddTimelineUpdate(selectedPost.id, text)}
                />

                {/* Discussion */}
                <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                     <MessageCircle size={20} className="text-blue-600"/> Discussion ({totalComments})
                  </h3>
                  
                  {/* Comment Input */}
                  <div className="flex gap-4 mb-8">
                     <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 flex items-center justify-center font-bold text-gray-500">
                        {user ? user.name.charAt(0) : '?'}
                     </div>
                     <div className="flex-1">
                        <div className="relative">
                           <textarea 
                              className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-100 outline-none resize-none text-sm"
                              placeholder="Add to the discussion..."
                              rows={3}
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                           />
                           <div className="absolute bottom-3 right-3 flex items-center gap-3">
                              <span className={`text-xs ${commentText.length > MAX_COMMENT_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
                                 {commentText.length}/{MAX_COMMENT_LENGTH}
                              </span>
                              <button 
                                 onClick={() => handlePostComment(commentText)}
                                 disabled={!commentText.trim() || commentText.length > MAX_COMMENT_LENGTH}
                                 className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                 <ArrowLeft size={16} className="rotate-180" />
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-6">
                     {commentTree.length > 0 ? commentTree.map(c => renderComment(c)) : (
                        <div className="text-center py-8 text-gray-400 text-sm">No comments yet. Be the first to start the conversation.</div>
                     )}
                     {postComments.length < totalComments && (
                        <button onClick={handleLoadMoreComments} className="w-full py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                           Load previous comments
                        </button>
                     )}
                  </div>
                </div>
              </div>

              {/* Right Column: Sidebar */}
              <div className="space-y-6 sticky top-24 self-start">
                
                {/* Action Card (Volunteer Drive / Status) */}
                {selectedPost.isVolunteerDrive ? (
                   <div className="bg-white rounded-[30px] shadow-lg border border-blue-100 overflow-hidden">
                      <div className="bg-blue-600 p-6 text-white text-center">
                         <h3 className="font-bold text-lg mb-1">Volunteer Drive</h3>
                         <p className="text-blue-100 text-sm">Join the community action</p>
                      </div>
                      <div className="p-6">
                         <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                               <Calendar size={24} />
                            </div>
                            <div>
                               <div className="text-sm text-gray-500 font-medium">Date & Time</div>
                               <div className="font-bold text-gray-900">{selectedPost.eventDate}</div>
                               <div className="text-sm text-gray-600">{selectedPost.eventTime}</div>
                            </div>
                         </div>
                         
                         <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
                               <MapPin size={24} />
                            </div>
                            <div>
                               <div className="text-sm text-gray-500 font-medium">Location</div>
                               <div className="font-bold text-gray-900 line-clamp-1">{selectedPost.city}</div>
                               <div className="text-sm text-blue-600 hover:underline cursor-pointer">View on Map</div>
                            </div>
                         </div>

                         <Button 
                           variant={selectedPost.status === 'Resolved' ? "secondary" : "primary"} 
                           className="w-full py-4 text-base shadow-lg shadow-blue-200"
                           onClick={() => handleVolunteer(selectedPost.id)}
                           disabled={selectedPost.status === 'Resolved'}
                         >
                            {selectedPost.status === 'Resolved' ? 'Event Completed' : 
                             selectedPost.volunteers?.includes(user?.id) ? 'You are Joining!' : 'Join Drive'}
                         </Button>
                         
                         <p className="text-center text-xs text-gray-400 mt-4">
                            {selectedPost.volunteers?.length || 0} people have joined this drive.
                         </p>
                      </div>
                   </div>
                ) : (
                   <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 p-6">
                      <h3 className="font-bold text-gray-900 mb-4">Status</h3>
                      <div className="flex items-center gap-3 mb-6">
                         <div className={`w-3 h-3 rounded-full ${selectedPost.status === 'Resolved' ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`}></div>
                         <span className="font-medium text-gray-700">{selectedPost.status}</span>
                      </div>
                      <div className="space-y-3">
                         <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Trust Score</span>
                            <span className="font-bold text-gray-900">{selectedPost.trustScore}</span>
                         </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Verified By</span>
                            <span className="font-bold text-gray-900">{selectedPost.vouchCount} Citizens</span>
                         </div>
                      </div>
                   </div>
                )}

                {/* Actions: Subscribe & Share */}
                <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 p-6">
                   <h3 className="font-bold text-gray-900 mb-4">Actions</h3>
                   <div className="space-y-3">
                      <button 
                        onClick={() => setToast({ message: "Subscribed to updates for this issue.", type: 'success' })}
                        className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                         <Bell size={18} /> Subscribe to Updates
                      </button>
                      <button 
                        onClick={() => {
                           const text = `Check out this issue: ${selectedPost.title} in ${selectedPost.city}. #IndiaAct`;
                           window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="w-full py-3 rounded-xl bg-[#25D366] text-white font-medium hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-2"
                      >
                         <MessageCircle size={18} /> Share on WhatsApp
                      </button>
                   </div>
                </div>

                {/* Similar Issues Nearby */}
                <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 p-6">
                   <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin size={18} className="text-gray-500" /> Similar Issues Nearby
                   </h3>
                   <div className="space-y-4">
                      {posts
                        .filter(p => p.city === selectedPost.city && p.id !== selectedPost.id)
                        .slice(0, 3)
                        .map(post => (
                         <div key={post.id} className="flex items-start gap-3 cursor-pointer group" onClick={() => navigate('post', { post })}>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${post.status === 'Resolved' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                               {post.status === 'Resolved' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                            </div>
                            <div className="flex-1 min-w-0">
                               <div className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{post.title}</div>
                               <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <span className="capitalize">{post.type}</span>
                                  <span>•</span>
                                  <span>{post.date}</span>
                               </div>
                            </div>
                         </div>
                      ))}
                      {posts.filter(p => p.city === selectedPost.city && p.id !== selectedPost.id).length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500 italic">No other reports in this area yet.</p>
                        </div>
                      )}
                   </div>
                   {posts.filter(p => p.city === selectedPost.city && p.id !== selectedPost.id).length > 0 && (
                     <button onClick={() => navigate('explore')} className="w-full mt-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
                        View on Map
                     </button>
                   )}
                </div>

              </div>
            </div>
          </div>
        );

      default: return null;
    }
  };

  if (appIsLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
        <div className="mb-2">
          <BrandLogo size="lg" />
        </div>
        <Spinner />
        <p className="text-sm mt-4">Loading civic data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans selection:bg-blue-100">
      <GlobalBanner message={systemSettings.globalAnnouncement} />
      <Navbar currentView={view} onViewChange={navigate} user={user} onLoginClick={() => navigate('login')} notifications={notifications} showNotifications={showNotifications} setShowNotifications={setShowNotifications} />
      <main className="animate-fade-in">{renderContent()}</main>
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {sharePost && <SharePosterModal post={sharePost} onClose={() => setSharePost(null)} />}
      {showPrivacyPolicy && <PrivacyPolicyModal onClose={() => setShowPrivacyPolicy(false)} />}
      
      <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-12">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <BrandLogo size="lg" />
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">Built for a better tomorrow. <br/>Join the civic revolution.</p>
          </div>
          <div>
            <div className="font-bold text-sm text-gray-900 mb-4">Platform</div>
            <ul className="space-y-2 text-xs text-gray-500">
              <li>About Us</li>
              <li>Guidelines</li>
              <li><button onClick={() => setShowPrivacyPolicy(true)} className="hover:text-gray-900">Privacy Policy</button></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-sm text-gray-900 mb-4">Connect</div>
            <ul className="space-y-2 text-xs text-gray-500"><li>Twitter</li><li>Instagram</li><li>Contact Admin</li></ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
 

import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, AlertTriangle, Trash2, Users, Search, Menu, X, ChevronRight, 
  ThumbsUp, MessageCircle, Share2, Flag, CheckCircle, Clock, Shield, 
  Filter, Plus, User, LogOut, ArrowLeft, Heart, Briefcase, Bell, 
  Calendar, Download, BarChart2, FileText, Smartphone, Camera, 
  Award, ExternalLink, Globe, LayoutDashboard, Activity, CheckSquare, AlertOctagon,
  Navigation, Edit, Trophy, Medal, Star, Zap, Mail, Info, BookOpen, PhoneCall, Copy
} from 'lucide-react';

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

const INITIAL_POSTS = [
  {
    id: 1,
    type: 'cleanliness',
    title: 'Garbage pile up near Dadar Station West',
    description: 'Huge pile of plastic and wet waste accumulating for 3 days. Blocking the footpath. Need urgent cleanup.',
    location: 'Dadar West, Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    author: 'Ravi K.',
    authorId: 'user_123', // Mock ID to simulate ownership
    badges: ['Verified Reporter'],
    date: '2 hours ago',
    status: 'Resolved',
    trustScore: 'High',
    vouchCount: 45,
    upvotes: 45,
    comments: [],
    flags: 0,
    tags: ['Garbage', 'Public Health'],
    isVolunteerDrive: true,
    eventDate: 'Oct 24, 2023',
    eventTime: '8:00 AM',
    volunteers: [1, 2, 3],
    evidence: {
      before: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=400',
      after: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&q=80&w=400' 
    },
    timeline: [
      { status: 'Issue Reported', date: 'Oct 20, 10:00 AM', desc: 'Initial report filed with photos.' },
      { status: 'Verified', date: 'Oct 20, 12:30 PM', desc: 'Confirmed by local moderator.' },
      { status: 'Drive Scheduled', date: 'Oct 21, 09:00 AM', desc: 'Volunteer cleanup organized for Oct 24.' },
      { status: 'Resolved', date: 'Oct 24, 02:00 PM', desc: 'Cleanup complete. 50kg waste removed.' }
    ]
  },
  {
    id: 2,
    type: 'scam',
    title: 'Fake Electricity Bill SMS Scam',
    description: 'Received SMS claiming power cut unless KYC updated. Link asks for UPI PIN. Number: +91-98765XXXXX (Masked for safety).',
    location: 'Indiranagar, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    author: 'Priya S.',
    authorId: 'user_456',
    badges: ['City Hero'],
    date: '1 day ago',
    status: 'Action Taken',
    trustScore: 'Med',
    vouchCount: 12,
    upvotes: 120,
    comments: [{ id: 101, author: 'Admin', text: 'Thanks. Flagged.' }],
    flags: 0,
    tags: ['UPI Scam', 'Cyber Fraud'],
    isVolunteerDrive: false,
    evidence: null,
    timeline: [
      { status: 'Reported', date: 'Yesterday, 5:00 PM', desc: 'Suspicious SMS reported.' },
      { status: 'Community Alert', date: 'Yesterday, 6:00 PM', desc: 'Marked as "High Risk" trend in Bengaluru.' },
      { status: 'Reported to Authority', date: 'Today, 10:00 AM', desc: 'Details forwarded to Cyber Crime Portal via automated API.' }
    ]
  },
  {
    id: 3,
    type: 'bribe',
    title: 'Traffic Police Asking Bribe at Signal',
    description: 'Stopped for no reason at the main signal. Officer demanded 500rs cash without issuing a challan. Badge number was covered.',
    location: 'T. Nagar, Chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    author: 'Senthil M.',
    authorId: 'user_789',
    badges: ['Whistleblower'],
    date: '3 hours ago',
    status: 'Open',
    trustScore: 'Med',
    vouchCount: 8,
    upvotes: 67,
    comments: [],
    flags: 0,
    tags: ['Corruption', 'Traffic'],
    isVolunteerDrive: false,
    evidence: null,
    timeline: [
      { status: 'Reported', date: 'Today, 11:00 AM', desc: 'Incident reported anonymously.' }
    ]
  },
  {
    id: 4,
    type: 'volunteer',
    title: 'Yamuna Bank Cleanup Drive',
    description: 'Join us this Sunday to clean the river banks near the old bridge. Gloves and bags provided. We need 50 volunteers!',
    location: 'Yamuna Bank, Delhi',
    city: 'New Delhi',
    state: 'Delhi NCR',
    author: 'Green Delhi Team',
    authorId: 'org_001',
    badges: ['Community Leader'],
    date: '5 hours ago',
    status: 'Open',
    trustScore: 'High',
    vouchCount: 92,
    upvotes: 150,
    comments: [],
    flags: 0,
    tags: ['Environment', 'Volunteer'],
    isVolunteerDrive: true,
    eventDate: 'Oct 28, 2023',
    eventTime: '7:00 AM',
    volunteers: [10, 11, 12, 13, 14],
    evidence: null,
    timeline: [
      { status: 'Announced', date: 'Today, 9:00 AM', desc: 'Drive scheduled.' }
    ]
  },
  {
    id: 5,
    type: 'cleanliness',
    title: 'Broken Sewage Pipe Leaking on Road',
    description: 'Sewage water leaking onto the main road for 2 days. Smells terrible and is a health hazard for pedestrians.',
    location: 'Salt Lake, Kolkata',
    city: 'Kolkata',
    state: 'West Bengal',
    author: 'Anjali D.',
    authorId: 'user_202',
    badges: [],
    date: '1 day ago',
    status: 'Open',
    trustScore: 'Low',
    vouchCount: 3,
    upvotes: 15,
    comments: [],
    flags: 0,
    tags: ['Sanitation', 'Health'],
    isVolunteerDrive: false,
    evidence: null,
    timeline: [
      { status: 'Reported', date: 'Yesterday, 4:00 PM', desc: 'Issue reported.' }
    ]
  },
  {
    id: 6,
    type: 'cleanliness',
    title: 'Cleared Illegal Dump at Sector 5',
    description: 'The massive garbage dump near the school has been completely cleared by the municipality after 500+ upvotes.',
    location: 'Sector 5, Chandigarh',
    city: 'Chandigarh',
    state: 'Punjab',
    author: 'Vikram S.',
    authorId: 'user_999',
    badges: ['Impact Maker'],
    date: '1 week ago',
    status: 'Resolved',
    trustScore: 'High',
    vouchCount: 150,
    upvotes: 300,
    comments: [],
    flags: 0,
    tags: ['Cleanliness', 'Success'],
    isVolunteerDrive: false,
    evidence: {
      before: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&q=80&w=400',
      after: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=400'
    },
    timeline: [
      { status: 'Resolved', date: 'Yesterday', desc: 'Area cleaned and fenced.' }
    ]
  },
  {
    id: 7,
    type: 'cleanliness',
    title: 'Fixed Dangerous Pothole on MG Road',
    description: 'The deep pothole causing accidents near the metro station has been filled and resurfaced.',
    location: 'MG Road, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    author: 'Rahul V.',
    authorId: 'user_101',
    badges: ['Road Safety'],
    date: '2 weeks ago',
    status: 'Resolved',
    trustScore: 'High',
    vouchCount: 89,
    upvotes: 210,
    comments: [],
    flags: 0,
    tags: ['Roads', 'Safety'],
    isVolunteerDrive: false,
    evidence: {
      before: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400',
      after: 'https://images.unsplash.com/photo-1584463635346-9f578e4b453c?auto=format&fit=crop&q=80&w=400'
    },
    timeline: [
      { status: 'Resolved', date: 'Oct 15', desc: 'Road resurfaced by BBMP.' }
    ]
  },
  {
    id: 8,
    type: 'volunteer',
    title: 'Restored Community Park in Pune',
    description: 'Over 50 volunteers came together to paint fences, plant saplings, and clean the jogging track.',
    location: 'Koregaon Park, Pune',
    city: 'Pune',
    state: 'Maharashtra',
    author: 'Pune Cares',
    authorId: 'org_002',
    badges: ['Community Win'],
    date: '3 weeks ago',
    status: 'Resolved',
    trustScore: 'High',
    vouchCount: 120,
    upvotes: 350,
    comments: [],
    flags: 0,
    tags: ['Environment', 'Park'],
    isVolunteerDrive: true,
    evidence: {
      before: 'https://images.unsplash.com/photo-1558618047-f4b511aae74d?auto=format&fit=crop&q=80&w=400',
      after: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=400'
    },
    timeline: [
      { status: 'Resolved', date: 'Oct 10', desc: 'Park restoration complete.' }
    ]
  },
  {
    id: 9,
    type: 'cleanliness',
    title: 'Cleared Garbage Dump at Beach',
    description: 'Weekly cleanup drive resulted in removal of 200kg of plastic waste from the shoreline.',
    location: 'Marina Beach, Chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    author: 'Clean Coast Org',
    authorId: 'org_003',
    badges: ['Eco Warrior'],
    date: '1 month ago',
    status: 'Resolved',
    trustScore: 'High',
    vouchCount: 200,
    upvotes: 450,
    comments: [],
    flags: 0,
    tags: ['Beach', 'Plastic'],
    isVolunteerDrive: true,
    evidence: {
      before: 'https://images.unsplash.com/photo-1618477461853-5f8dd37a79a3?auto=format&fit=crop&q=80&w=400',
      after: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400'
    },
    timeline: [
      { status: 'Resolved', date: 'Sep 25', desc: 'Beach cleanup successful.' }
    ]
  },
  {
    id: 10,
    type: 'bribe',
    title: 'Street Lights Fixed in Alley',
    description: 'After months of darkness and safety concerns, new LED lights have been installed.',
    location: 'Civil Lines, Delhi',
    city: 'New Delhi',
    state: 'Delhi NCR',
    author: 'Amit S.',
    authorId: 'user_555',
    badges: ['Safety First'],
    date: '1 month ago',
    status: 'Resolved',
    trustScore: 'High',
    vouchCount: 45,
    upvotes: 90,
    comments: [],
    flags: 0,
    tags: ['Infrastructure', 'Safety'],
    isVolunteerDrive: false,
    evidence: {
      before: 'https://images.unsplash.com/photo-1510265119258-db115b0e8172?auto=format&fit=crop&q=80&w=400',
      after: 'https://images.unsplash.com/photo-1562619425-c307bb83bc42?auto=format&fit=crop&q=80&w=400'
    },
    timeline: [
      { status: 'Resolved', date: 'Sep 20', desc: 'Lights installed by municipality.' }
    ]
  },
  {
    id: 11,
    type: 'cleanliness',
    title: 'Removed Illegal Hoardings',
    description: 'Illegal political banners blocking traffic signals were removed following citizen reports.',
    location: 'Bandra, Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    author: 'Citizen Watch',
    authorId: 'user_777',
    badges: ['Civic Duty'],
    date: '2 months ago',
    status: 'Resolved',
    trustScore: 'High',
    vouchCount: 60,
    upvotes: 130,
    comments: [],
    flags: 0,
    tags: ['Traffic', 'Visual Pollution'],
    isVolunteerDrive: false,
    evidence: {
      before: 'https://images.unsplash.com/photo-1572062505068-4f562e15708f?auto=format&fit=crop&q=80&w=400',
      after: 'https://images.unsplash.com/photo-1575356895660-297296291665?auto=format&fit=crop&q=80&w=400'
    },
    timeline: [
      { status: 'Resolved', date: 'Aug 15', desc: 'Hoardings removed.' }
    ]
  },
  {
    id: 6,
    type: 'cleanliness',
    title: 'Cleared Illegal Dump at Sector 5',
    description: 'The massive garbage dump near the school has been completely cleared by the municipality after 500+ upvotes.',
    location: 'Sector 5, Chandigarh',
    city: 'Chandigarh',
    state: 'Punjab',
    author: 'Vikram S.',
    authorId: 'user_999',
    badges: ['Impact Maker'],
    date: '1 week ago',
    status: 'Resolved',
    trustScore: 'High',
    vouchCount: 150,
    upvotes: 300,
    comments: [],
    flags: 0,
    tags: ['Cleanliness', 'Success'],
    isVolunteerDrive: false,
    evidence: {
      before: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&q=80&w=400',
      after: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=400'
    },
    timeline: [
      { status: 'Resolved', date: 'Yesterday', desc: 'Area cleaned and fenced.' }
    ]
  },
  {
    id: 7,
    type: 'cleanliness',
    title: 'Fixed Dangerous Pothole on MG Road',
    description: 'The deep pothole causing accidents near the metro station has been filled and resurfaced.',
    location: 'MG Road, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    author: 'Rahul V.',
    authorId: 'user_101',
    badges: ['Road Safety'],
    date: '2 weeks ago',
    status: 'Resolved',
    trustScore: 'High',
    vouchCount: 89,
    upvotes: 210,
    comments: [],
    flags: 0,
    tags: ['Roads', 'Safety'],
    isVolunteerDrive: false,
    evidence: {
      before: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400',
      after: 'https://images.unsplash.com/photo-1584463635346-9f578e4b453c?auto=format&fit=crop&q=80&w=400'
    },
    timeline: [
      { status: 'Resolved', date: 'Oct 15', desc: 'Road resurfaced by BBMP.' }
    ]
  },
  {
    id: 8,
    type: 'volunteer',
    title: 'Restored Community Park in Pune',
    description: 'Over 50 volunteers came together to paint fences, plant saplings, and clean the jogging track.',
    location: 'Koregaon Park, Pune',
    city: 'Pune',
    state: 'Maharashtra',
    author: 'Pune Cares',
    authorId: 'org_002',
    badges: ['Community Win'],
    date: '3 weeks ago',
    status: 'Resolved',
    trustScore: 'High',
    vouchCount: 120,
    upvotes: 350,
    comments: [],
    flags: 0,
    tags: ['Environment', 'Park'],
    isVolunteerDrive: true,
    evidence: {
      before: 'https://images.unsplash.com/photo-1558618047-f4b511aae74d?auto=format&fit=crop&q=80&w=400',
      after: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=400'
    },
    timeline: [
      { status: 'Resolved', date: 'Oct 10', desc: 'Park restoration complete.' }
    ]
  },
  {
    id: 9,
    type: 'cleanliness',
    title: 'Cleared Garbage Dump at Beach',
    description: 'Weekly cleanup drive resulted in removal of 200kg of plastic waste from the shoreline.',
    location: 'Marina Beach, Chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    author: 'Clean Coast Org',
    authorId: 'org_003',
    badges: ['Eco Warrior'],
    date: '1 month ago',
    status: 'Resolved',
    trustScore: 'High',
    vouchCount: 200,
    upvotes: 450,
    comments: [],
    flags: 0,
    tags: ['Beach', 'Plastic'],
    isVolunteerDrive: true,
    evidence: {
      before: 'https://images.unsplash.com/photo-1618477461853-5f8dd37a79a3?auto=format&fit=crop&q=80&w=400',
      after: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400'
    },
    timeline: [
      { status: 'Resolved', date: 'Sep 25', desc: 'Beach cleanup successful.' }
    ]
  },
  {
    id: 10,
    type: 'bribe',
    title: 'Street Lights Fixed in Alley',
    description: 'After months of darkness and safety concerns, new LED lights have been installed.',
    location: 'Civil Lines, Delhi',
    city: 'New Delhi',
    state: 'Delhi NCR',
    author: 'Amit S.',
    authorId: 'user_555',
    badges: ['Safety First'],
    date: '1 month ago',
    status: 'Resolved',
    trustScore: 'High',
    vouchCount: 45,
    upvotes: 90,
    comments: [],
    flags: 0,
    tags: ['Infrastructure', 'Safety'],
    isVolunteerDrive: false,
    evidence: {
      before: 'https://images.unsplash.com/photo-1510265119258-db115b0e8172?auto=format&fit=crop&q=80&w=400',
      after: 'https://images.unsplash.com/photo-1562619425-c307bb83bc42?auto=format&fit=crop&q=80&w=400'
    },
    timeline: [
      { status: 'Resolved', date: 'Sep 20', desc: 'Lights installed by municipality.' }
    ]
  },
  {
    id: 11,
    type: 'cleanliness',
    title: 'Removed Illegal Hoardings',
    description: 'Illegal political banners blocking traffic signals were removed following citizen reports.',
    location: 'Bandra, Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    author: 'Citizen Watch',
    authorId: 'user_777',
    badges: ['Civic Duty'],
    date: '2 months ago',
    status: 'Resolved',
    trustScore: 'High',
    vouchCount: 60,
    upvotes: 130,
    comments: [],
    flags: 0,
    tags: ['Traffic', 'Visual Pollution'],
    isVolunteerDrive: false,
    evidence: {
      before: 'https://images.unsplash.com/photo-1572062505068-4f562e15708f?auto=format&fit=crop&q=80&w=400',
      after: 'https://images.unsplash.com/photo-1575356895660-297296291665?auto=format&fit=crop&q=80&w=400'
    },
    timeline: [
      { status: 'Resolved', date: 'Aug 15', desc: 'Hoardings removed.' }
    ]
  }
];

const INITIAL_CHAPTERS = [
  { id: 'c1', name: 'IIT Bombay Social Service', type: 'College', city: 'Mumbai', members: 1240, drives: 45, score: 15400, verified: true, color: 'from-blue-500 to-cyan-500' },
  { id: 'c2', name: 'Delhi Univ. Civic Corps', type: 'College', city: 'New Delhi', members: 2100, drives: 89, score: 28900, verified: true, color: 'from-purple-500 to-pink-500' },
  { id: 'c3', name: 'Palm Grove RWA', type: 'Society', city: 'Bengaluru', members: 350, drives: 12, score: 5400, verified: true, color: 'from-orange-500 to-red-500' },
  { id: 'c4', name: 'St. Xaviers Green Club', type: 'College', city: 'Mumbai', members: 850, drives: 32, score: 11200, verified: true, color: 'from-green-500 to-emerald-500' },
  { id: 'c5', name: 'Koramangala 4th Block', type: 'Society', city: 'Bengaluru', members: 500, drives: 18, score: 7800, verified: true, color: 'from-teal-500 to-green-500' },
];

const BADGE_DEFINITIONS = [
  { id: 'verified', label: 'Verified Reporter', icon: Shield, desc: '5+ Verified Reports', color: 'text-blue-600 bg-blue-50', border: 'border-blue-100' },
  { id: 'hero', label: 'City Hero', icon: Trophy, desc: 'Top 1% Contributor', color: 'text-yellow-600 bg-yellow-50', border: 'border-yellow-100' },
  { id: 'whistle', label: 'Whistleblower', icon: AlertTriangle, desc: 'Exposed Major Issue', color: 'text-red-600 bg-red-50', border: 'border-red-100' },
  { id: 'eco', label: 'Eco Warrior', icon: Trash2, desc: '10+ Cleanliness Drives', color: 'text-green-600 bg-green-50', border: 'border-green-100' },
  { id: 'leader', label: 'Community Leader', icon: Users, desc: 'Organized 5 Drives', color: 'text-purple-600 bg-purple-50', border: 'border-purple-100' },
];

const MONTHLY_HEROES = [
  { id: 1, name: 'Ravi Kumar', points: 1250, badge: 'City Hero', avatar: 'bg-yellow-100 text-yellow-700', location: 'Mumbai' },
  { id: 2, name: 'Priya Sharma', points: 980, badge: 'Eco Warrior', avatar: 'bg-green-100 text-green-700', location: 'Bengaluru' },
  { id: 3, name: 'Amit Singh', points: 850, badge: 'Verified Reporter', avatar: 'bg-blue-100 text-blue-700', location: 'Delhi' },
];

const IMPROVED_AREAS = [
  { name: 'Dadar West', city: 'Mumbai', improvement: '+45%', metric: 'Cleanliness Score', prev: 42, curr: 87, color: 'text-emerald-600' },
  { name: 'Indiranagar', city: 'Bengaluru', improvement: '+30%', metric: 'Pothole Fixes', prev: 20, curr: 50, color: 'text-blue-600' },
];

const CATEGORIES = [
  { id: 'scam', label: 'Scam Alert', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  { id: 'bribe', label: 'Report Bribe', icon: Briefcase, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  { id: 'cleanliness', label: 'Cleanliness', icon: Trash2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  { id: 'volunteer', label: 'Volunteer Drive', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
];

const RESOURCES = [
  { title: 'Cyber Crime Portal', desc: 'File official cyber fraud complaints', link: '#' },
  { title: 'RTI Online', desc: 'File a Right to Information request', link: '#' },
  { title: 'Swachh Bharat App', desc: 'Official government cleaning app', link: '#' },
];

// Helper to generate mock drill-down data
const getDrillDownItems = (level, region) => {
  if (level === 'country') return STATES;
  
  if (level === 'state') {
    // region is the state object
    return region.cities.map((city, i) => ({
      id: city,
      name: city,
      geoCoords: [region.geoCoords[0] + (Math.random() - 0.5) * 2, region.geoCoords[1] + (Math.random() - 0.5) * 2],
      coords: { x: 20 + (i * 18) % 60, y: 20 + (i * 12) % 60 }, // Pseudo-random spread
      severity: ['high', 'med', 'low'][i % 3],
      stats: region.stats
    }));
  }
  
  if (level === 'city') {
    // region is the city object
    const areas = ['Downtown', 'North Dist', 'South Ext', 'East Block', 'West End', 'Central', 'Tech Hub'];
    return areas.map((area, i) => ({
      id: `${region.name}-${area}`,
      name: area,
      geoCoords: [region.geoCoords[0] + (Math.random() - 0.5) * 0.5, region.geoCoords[1] + (Math.random() - 0.5) * 0.5],
      coords: { x: 30 + (i * 15) % 50, y: 25 + (i * 15) % 50 },
      severity: ['high', 'med', 'low'][(i * 2) % 3],
      stats: { scam: 12, cleanliness: 34, bribe: 5, volunteer: 10 }
    }));
  }
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
          <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); setShow(false); }}></div>
          <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101] w-[90vw] max-w-xs bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 animate-in fade-in zoom-in-95 text-left">
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

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, disabled = false }) => {
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
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} disabled={disabled}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const Toast = ({ message, type = 'success', onClose }) => (
  <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce-in z-[100] backdrop-blur-md
    ${type === 'error' ? 'bg-red-900 text-white' : 'bg-gray-900 text-white'}`}>
    <div className={`${type === 'error' ? 'bg-red-500' : 'bg-green-500'} rounded-full p-1`}>
      {type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
    </div>
    <p className="text-sm font-medium">{message}</p>
    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={18} /></button>
  </div>
);

const CivicResourcesPage = () => {
  const [selectedCity, setSelectedCity] = useState('New Delhi');
  const [activeCategory, setActiveCategory] = useState('scam');

  const cityData = CIVIC_DATA.cityHelplines[selectedCity] || CIVIC_DATA.cityHelplines['New Delhi'];
  const categoryData = CIVIC_DATA.categories[activeCategory];

  return (
    <div className="max-w-[980px] mx-auto py-12 px-6">
       {/* Motivational Banner */}
       <div className="bg-gradient-to-r from-[#1d1d1f] to-[#434344] rounded-[30px] p-8 md:p-12 text-white mb-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="relative z-10 max-w-3xl">
             <Badge className="bg-white/20 text-white border-none mb-6 backdrop-blur-md">Be The Change</Badge>
             <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight tracking-tight">
                Nobody is coming to save us.<br/>
                <span className="text-blue-300">We have to save ourselves.</span>
             </h1>
             <p className="text-lg md:text-xl text-gray-300 font-medium leading-relaxed">It's time to stop complaining and start acting. Your country needs you. Your city needs you. Stand up, speak out, and let's build a cleaner, safer world together. The power is in your hands.</p>
          </div>
       </div>

       {/* Header */}
       <div className="mb-10">
         <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">Civic Resources & Action Guide</h1>
         <p className="text-[#86868b]">Everything you need to know to take official action.</p>
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
             <div key={section.title} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
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
             <div key={section.title} className="bg-blue-50 p-6 rounded-[24px] border border-blue-100 shadow-sm">
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
             <div className="bg-white rounded-[30px] p-8 shadow-sm border border-gray-100 min-h-[400px]">
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
                                     <span className="flex-shrink-0 w-6 h-6 bg-[#e8e8ed] text-[#1d1d1f] rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
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
             <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm">
                <div className="text-xs font-bold text-[#86868b] uppercase mb-1">Police</div>
                <div className="text-lg font-mono font-bold text-[#1d1d1f]">{cityData.police}</div>
             </div>
             <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm">
                <div className="text-xs font-bold text-[#86868b] uppercase mb-1">Disaster Mgmt</div>
                <div className="text-lg font-mono font-bold text-[#1d1d1f]">{cityData.disaster}</div>
             </div>
             <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm">
                <div className="text-xs font-bold text-[#86868b] uppercase mb-1">Municipal Corp</div>
                <div className="text-lg font-mono font-bold text-[#1d1d1f]">{cityData.municipal}</div>
             </div>
             <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm">
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
    <div className="relative w-full aspect-[4/3] bg-slate-100 rounded-[30px] overflow-hidden border border-gray-200 shadow-inner z-0">
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

// Navbar
const Navbar = ({ onViewChange, currentView, user, onLoginClick, onLogout, notifications, showNotifications, setShowNotifications }) => (
  <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 transition-all duration-300">
    <div className="max-w-[980px] mx-auto px-4 h-12 flex items-center justify-between">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewChange('home')}>
        <Shield size={18} className="text-[#1d1d1f]" fill="currentColor" />
        <span className="text-lg font-semibold tracking-tight text-[#1d1d1f]">IndiaAct</span>
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
        {/* Restored Language Selector */}
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
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2">
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
            {/* Logout is now also available in dashboard, but keeping here for quick access if needed, or we can remove it to clean up navbar */}
          </div>
        ) : (
          <Button variant="secondary" onClick={onLoginClick} className="!py-1 !px-3 text-xs">Login</Button>
        )}
        <Button variant="primary" onClick={() => onViewChange('create')} className="hidden md:flex !py-1 !px-3 text-xs" icon={Plus}>Report</Button>
      </div>
    </div>
  </nav>
);

// Hero Component
const Hero = ({ onViewChange }) => (
  <div className="max-w-[980px] mx-auto py-12 px-6">
    <div className="bg-[#1d1d1f] rounded-[30px] p-10 md:p-16 text-white text-center relative overflow-hidden mb-12">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
      
      <div className="relative z-10">
        <Badge className="bg-blue-500/20 text-blue-300 border-none mb-6 inline-flex items-center gap-1 px-3 py-1">
          <Globe size={12} /> Live in 5 States
        </Badge>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-6 leading-tight">
          Civic Action. <br className="hidden md:block"/>
          <span className="text-[#86868b]">Reimagined.</span>
        </h1>
        <p className="text-xl md:text-2xl font-medium text-[#86868b] mb-10 max-w-2xl mx-auto leading-relaxed">
          Turn complaints into collective action. <br/>
          <span className="text-white/80">Your voice + Our community = A Cleaner India.</span>
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

    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
      {CATEGORIES.map((cat) => (
        <div key={cat.id} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer group" onClick={() => onViewChange('create')}>
          <cat.icon className={`mb-4 text-[#1d1d1f] group-hover:scale-110 transition-transform`} size={32} />
          <h3 className="font-semibold text-[#1d1d1f] text-lg">{cat.label}</h3>
          <p className="text-xs text-[#86868b] mt-2 flex items-center gap-1 group-hover:gap-2 transition-all">Report now <ArrowLeft size={10} className="rotate-180" /></p>
        </div>
      ))}
    </div>
  </div>
);

const HERO_DATA = {
  name: 'Ravi Kumar',
  city: 'Mumbai',
  avatar: 'R',
  role: 'Community Leader',
  description: 'For consistently organizing weekend cleanup drives in Dadar and verifying 50+ community reports this week.',
  points: 1250,
  stats: { resolved: 12, drives: 3, volunteers: 45 },
  drives: [
    {
      id: 101,
      title: 'Dadar Beach Cleanup Drive',
      date: 'Oct 22, 2023',
      outcome: 'Removed 500kg of plastic waste with 20 volunteers.',
      image: 'https://images.unsplash.com/photo-1618477461853-5f8dd37a79a3?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 102,
      title: 'Matunga Station Wall Painting',
      date: 'Oct 15, 2023',
      outcome: 'Beautified station walls and planted 15 saplings.',
      image: 'https://images.unsplash.com/photo-1558618047-f4b511aae74d?auto=format&fit=crop&q=80&w=400'
    }
  ]
};

const CITY_OF_WEEK = {
  name: 'Indore',
  state: 'Madhya Pradesh',
  score: 98.5,
  badge: 'Cleanest City',
  description: 'Maintained #1 rank in Swachh Survekshan for the 7th consecutive time. Citizens actively report and resolve issues within 24 hours.',
  image: 'https://images.unsplash.com/photo-1562408590-e32931084e23?auto=format&fit=crop&q=80&w=400',
  stats: { points: '98.5k', movements: 142, impacts: 'High' }
};

const STATE_OF_WEEK = {
  name: 'Kerala',
  score: 96.2,
  badge: 'Top Governance',
  description: 'Highest literacy rate and best public healthcare index. Community-led initiatives for waste management are setting global standards.',
  image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=400',
  stats: { points: '1.2M', movements: 850, impacts: 'V. High' }
};

const HeroDetailsModal = ({ hero, onClose }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in">
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
                 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
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
    <div className="py-16 px-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col gap-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-[30px] py-12 px-8 md:px-12 relative overflow-hidden shadow-sm border border-orange-100">
          <div className="absolute top-0 right-0 p-8 opacity-10 text-orange-600"><Trophy size={300} /></div>
          <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
             <div className="w-32 h-32 md:w-40 md:h-40 rounded-full shadow-2xl overflow-hidden bg-white flex items-center justify-center text-5xl font-bold text-orange-600 border-4 border-orange-100">
               {HERO_DATA.avatar}
             </div>
             <div className="flex-1 text-center md:text-left">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm text-orange-800 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm border border-orange-100">
                 <Star size={12} className="fill-current" /> Hero of the Week <FeatureInfo title="Hero Selection" content="Selected weekly based on the highest impact score. Winners get featured here and receive special badges." />
               </div>
               <h2 className="text-4xl font-semibold text-[#1d1d1f] mb-2">{HERO_DATA.name}</h2>
               <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 text-sm mb-3">
                  <MapPin size={14} /> {HERO_DATA.city}
               </div>
               <p className="text-[#1d1d1f] text-lg max-w-xl mb-6 leading-relaxed">
                 {HERO_DATA.description}
               </p>
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-gray-600">
                 <span className="flex items-center gap-1"><CheckCircle size={16} className="text-green-600" /> {HERO_DATA.stats.resolved} Issues Resolved</span>
                 <span className="flex items-center gap-1"><Users size={16} className="text-blue-600" /> {HERO_DATA.stats.drives} Drives Led</span>
                 <button onClick={() => setShowModal(true)} className="text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 ml-4 font-semibold">
                   View Impact <ChevronRight size={14} />
                 </button>
               </div>
             </div>
          </div>
        </div>

        {/* City & State Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* City Card */}
           <div className="bg-white rounded-[30px] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50"></div>
              <div className="relative z-10">
                 <div className="flex items-start gap-5 mb-6">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md shrink-0">
                    <img src={CITY_OF_WEEK.image} alt={CITY_OF_WEEK.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                       <Badge className="bg-blue-100 text-blue-700 border-none mb-1">City of the Week</Badge>
                       <h3 className="text-2xl font-bold text-[#1d1d1f]">{CITY_OF_WEEK.name}</h3>
                       <p className="text-xs text-gray-500">{CITY_OF_WEEK.state}</p>
                    </div>
                 </div>
                 
                 <p className="text-sm text-[#86868b] leading-relaxed mb-6 min-h-[60px]">{CITY_OF_WEEK.description}</p>
                 
                 <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">
                    <div className="text-center">
                        <div className="text-lg font-bold text-[#1d1d1f]">{CITY_OF_WEEK.stats.points}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Points</div>
                    </div>
                    <div className="text-center border-l border-gray-100">
                        <div className="text-lg font-bold text-[#1d1d1f]">{CITY_OF_WEEK.stats.movements}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Drives</div>
                    </div>
                    <div className="text-center border-l border-gray-100">
                        <div className="text-lg font-bold text-green-600">{CITY_OF_WEEK.stats.impacts}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Impact</div>
                    </div>
                 </div>
              </div>
           </div>

           {/* State Card */}
           <div className="bg-white rounded-[30px] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50"></div>
              <div className="relative z-10">
                 <div className="flex items-start gap-5 mb-6">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md shrink-0">
                    <img src={STATE_OF_WEEK.image} alt={STATE_OF_WEEK.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                       <Badge className="bg-green-100 text-green-700 border-none mb-1">State of the Week</Badge>
                       <h3 className="text-2xl font-bold text-[#1d1d1f]">{STATE_OF_WEEK.name}</h3>
                       <p className="text-xs text-gray-500">{STATE_OF_WEEK.badge}</p>
                    </div>
                 </div>
                 
                 <p className="text-sm text-[#86868b] leading-relaxed mb-6 min-h-[60px]">{STATE_OF_WEEK.description}</p>
                 
                 <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">
                    <div className="text-center">
                        <div className="text-lg font-bold text-[#1d1d1f]">{STATE_OF_WEEK.stats.points}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Points</div>
                    </div>
                    <div className="text-center border-l border-gray-100">
                        <div className="text-lg font-bold text-[#1d1d1f]">{STATE_OF_WEEK.stats.movements}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Drives</div>
                    </div>
                    <div className="text-center border-l border-gray-100">
                        <div className="text-lg font-bold text-green-600">{STATE_OF_WEEK.stats.impacts}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Impact</div>
                    </div>
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
    <div className="max-w-[980px] mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
      <div className="flex-1 space-y-6">
        <h2 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] leading-tight">
          Stay informed. <FeatureInfo title="Smart Alerts" content="Our AI monitors reports in your area and sends you real-time alerts about scams, drives, and civic issues via Email or SMS." /><br/><span className="text-[#86868b]">Stay safe.</span>
        </h2>
        <p className="text-[#1d1d1f] text-xl leading-relaxed max-w-xl font-medium">
          Get real-time notifications about scams, volunteer opportunities, and civic issues in your specific area. Don't wait for the news—know it when it happens.
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
             Hyper-local Updates
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
const ChaptersPromo = ({ onViewChange, chapters }) => {
  const topChapters = [...chapters].sort((a, b) => b.score - a.score).slice(0, 5);
  return (
  <div className="py-24 bg-[#f5f5f7] relative overflow-hidden">
    <div className="max-w-[980px] mx-auto px-6 relative z-10">
      <div className="flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h2 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] leading-tight">
            Is your College or Society <FeatureInfo title="Chapters" content="Chapters are verified groups (Colleges, RWAs) that organize drives. They get a dedicated dashboard and compete on the leaderboard." /><br/>
            <span className="text-[#86868b]">Leading the Change?</span>
          </h2>
          <p className="text-[#1d1d1f] text-xl leading-relaxed max-w-xl font-medium">
            Create a verified chapter for your institution. Host official drives, track collective impact, and compete in city-wide leaderboards.
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
          <div className="bg-white rounded-[30px] p-8 shadow-xl max-w-sm w-full relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-[#1d1d1f]">Chapter Leaderboard</h3>
              <span className="text-xs text-[#86868b]">All India</span>
            </div>
            
            <div className="space-y-4">
              {topChapters.map((item, i) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full ${i===0 ? 'bg-[#f5f5f7] text-[#1d1d1f]' : 'bg-[#f5f5f7] text-[#86868b]'} flex items-center justify-center text-xs font-bold`}>
                    {i+1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-[#1d1d1f] truncate max-w-[160px]">{item.name}</span>
                      <span className="font-mono text-[#86868b] text-xs">{(item.score / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="h-1.5 bg-[#f5f5f7] rounded-full overflow-hidden">
                      <div className={`h-full bg-[#1d1d1f]`} style={{ width: `${100 - (i*10)}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100/50 text-center">
              <button onClick={() => onViewChange('chapters')} className="text-xs font-medium text-[#0071e3] hover:underline flex items-center justify-center gap-1 transition-colors">
                See Full Rankings <ChevronRight size={12} />
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
    <div className="max-w-[980px] mx-auto px-6 relative z-10">
      <div className="text-center max-w-4xl mx-auto mb-20">
        <h2 className="text-5xl md:text-7xl font-semibold tracking-tight leading-tight mb-8 text-[#1d1d1f]">
          Imagine an India where <br/>
          <span className="text-[#86868b]">Action is Instant.</span>
        </h2>
        <p className="text-xl md:text-2xl text-[#1d1d1f] font-medium leading-relaxed">
          We are building the world's most advanced civic engagement platform. 
          Where AI meets activism. Where your voice triggers real-world change. 
          Where apathy dies, and a new nation rises.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {[
          { title: "Hyper-Local Impact", desc: "Fix the pothole outside your door. Clean the park your kids play in. Change starts at 0km.", icon: MapPin },
          { title: "Radical Accountability", desc: "Every report is tracked on blockchain-verified ledgers. No more lost files. No more excuses.", icon: Shield },
          { title: "Gamified Citizenship", desc: "Earn respect, badges, and city-wide fame. Making India better should feel like winning.", icon: Trophy }
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
    <div className="max-w-[980px] mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-semibold text-[#1d1d1f] mb-4">No Dead-End Complaints <FeatureInfo title="Resolution Process" content="We track every report. If not resolved within a timeframe, it gets escalated. We also use social pressure by showcasing unresolved issues." /></h2>
        <p className="text-[#86868b] text-xl font-medium max-w-2xl mx-auto">
          Every issue you report starts a journey. We ensure it doesn't get lost in the void.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
        {[
          { 
            step: "1", 
            title: "Reported", 
            desc: "You spot an issue and file a report. It's instantly mapped and visible to the community.",
            icon: FileText
          },
          { 
            step: "2", 
            title: "Acknowledged", 
            desc: "Local volunteers or authorities verify the issue. Trust scores increase.",
            icon: CheckCircle
          },
          { 
            step: "3", 
            title: "Action Initiated", 
            desc: "Volunteers organize a drive, or authorities dispatch a team. Status updates live.",
            icon: Zap
          },
          { 
            step: "4", 
            title: "Resolved", 
            desc: "The issue is fixed. Before/After photos are uploaded. Impact points awarded.",
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
const Explore = ({ onCitySelect }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [navStack, setNavStack] = useState([]);

  const currentLevel = navStack.length === 0 ? 'country' : navStack.length === 1 ? 'state' : 'city';
  const currentRegion = navStack.length > 0 ? navStack[navStack.length - 1] : null;
  
  const mapItems = useMemo(() => getDrillDownItems(currentLevel, currentRegion), [currentLevel, currentRegion]);

  const handleRegionSelect = (item) => {
    if (currentLevel === 'city') {
      // Leaf node (Area) selected -> Go to dashboard
      // We pass the city name (parent of current area)
      onCitySelect(currentRegion.name);
    } else {
      setNavStack([...navStack, item]);
    }
  };

  return (
    <div className="max-w-[980px] mx-auto py-8 px-6">
      <div className="mb-8 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
          {navStack.length > 0 && (
            <button 
              onClick={() => setNavStack(prev => prev.slice(0, -1))}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              title="Go Back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-3xl font-bold text-gray-900">Live Activity Map <FeatureInfo title="Interactive Map" content="View real-time reports across India. Click on pins to see details. Use the heatmap to identify high-severity zones." /></h2>
        </div>
        <p className="text-gray-500">
          {currentLevel === 'country' && "Select a State to view cities."}
          {currentLevel === 'state' && `Viewing cities in ${currentRegion.name}. Select a city.`}
          {currentLevel === 'city' && `Viewing areas in ${currentRegion.name}. Select an area to see reports.`}
        </p>
      </div>

      {/* Map Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-[24px] shadow-sm">
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
                   <span className="font-mono font-bold text-emerald-400">1,204</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                   <span className="text-sm text-gray-300">Active Volunteers</span>
                   <span className="font-mono font-bold text-blue-400">8,500</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-sm text-gray-300">Upcoming Drives</span>
                   <span className="font-mono font-bold text-orange-400">42</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Impact Wall Component (Before/After Gallery)
const ImpactWall = ({ posts, onViewChange }) => {
  const [showAll, setShowAll] = useState(false);
  const resolvedPosts = posts.filter(p => p.status === 'Resolved' && p.evidence?.before && p.evidence?.after);

  if (resolvedPosts.length === 0) return null;
  const displayedPosts = showAll ? resolvedPosts : resolvedPosts.slice(0, 3);

  // Helper to calculate duration (Mock implementation for demo)
  const getDuration = (post) => {
     // In a real app, parse post.timeline[0].date and post.timeline[last].date
     return (post.id % 5) + 2 + " Days"; 
  };

  return (
    <div className="py-24 bg-[#1d1d1f] text-white relative overflow-hidden">
      <div className="max-w-[980px] mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-semibold text-white mb-4">City Transformation Wall <FeatureInfo title="Impact Gallery" content="A collection of verified 'Before & After' photos. This proves that collective action works. Only resolved issues with evidence appear here." /></h2>
            <p className="text-gray-400 text-xl font-medium max-w-xl leading-relaxed">Real stories of change. See how citizens and authorities are working together to fix our cities, one report at a time.</p>
          </div>
          <div className="flex gap-4 text-sm font-mono">
             <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl text-center min-w-[100px] border border-white/10">
               <span className="block text-2xl font-bold text-green-400">{resolvedPosts.length}</span>
               <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Fixed</span>
             </div>
             <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl text-center min-w-[100px] border border-white/10">
               <span className="block text-2xl font-bold text-blue-400">{resolvedPosts.reduce((acc, p) => acc + (p.vouchCount || 0), 0)}</span>
               <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Vouches</span>
             </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedPosts.map(post => (
            <div 
              key={post.id} 
              onClick={() => onViewChange('post', { post })}
              className="bg-white/5 border border-white/10 rounded-[24px] overflow-hidden transition-all duration-500 group cursor-pointer flex flex-col h-full hover:scale-[1.02] hover:bg-white/10"
            >
              {/* Before/After Slider Effect */}
              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 flex transition-transform duration-700 group-hover:scale-105">
                   <div className="w-1/2 h-full relative border-r border-white/10">
                      <img src={post.evidence.before} alt="Before" className="w-full h-full object-cover filter grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500" />
                      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold rounded-md text-white border border-white/10 shadow-lg">BEFORE</div>
                   </div>
                   <div className="w-1/2 h-full relative">
                      <img src={post.evidence.after} alt="After" className="w-full h-full object-cover" />
                      <div className="absolute bottom-4 right-4 bg-emerald-600 shadow-lg shadow-emerald-900/50 px-2.5 py-1 text-[10px] font-bold rounded-md text-white flex items-center gap-1">
                        AFTER <CheckCircle size={10} />
                      </div>
                   </div>
                </div>
                {/* Center Badge */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-slate-950 rounded-full p-2 shadow-xl z-10 group-hover:scale-110 transition-transform duration-300">
                   <ArrowLeft size={16} className="rotate-180" />
                </div>

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                  <span className="bg-white text-slate-950 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    View Full Journey <ArrowLeft size={14} className="rotate-180" />
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-2">
                     <Badge className="bg-white/10 text-white border-none backdrop-blur-sm">{post.city}</Badge>
                     <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                       <Clock size={10} /> {getDuration(post)}
                     </span>
                   </div>
                </div>
                
                <h3 className="font-semibold text-xl mb-3 text-white leading-tight">{post.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-2 mb-6 flex-1 font-medium">{post.description}</p>
                
                <div className="pt-5 border-t border-white/10 flex items-center justify-between mt-auto">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                        {post.author.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">{post.author}</span>
                        <span className="text-[10px] text-gray-400">Reporter</span>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-1 text-white text-xs font-bold bg-white/10 px-2 py-1 rounded-lg">
                      <ThumbsUp size={12} /> {post.upvotes}
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {resolvedPosts.length > 3 && (
          <div className="mt-12 text-center">
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all px-8 py-3 rounded-full"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less Stories' : 'View More Impact Stories'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Chapters Component
const Chapters = ({ chapters, onJoin }) => {
  const [filterState, setFilterState] = useState('');
  const [filterCity, setFilterCity] = useState('');

  const filteredChapters = chapters.filter(chapter => {
    if (filterState) {
      const stateData = STATES.find(s => s.name === filterState);
      if (!stateData || !stateData.cities.includes(chapter.city)) return false;
    }
    if (filterCity && chapter.city !== filterCity) return false;
    return true;
  });

  const availableCities = filterState 
    ? (STATES.find(s => s.name === filterState)?.cities || [])
    : [...new Set(STATES.flatMap(s => s.cities))].sort();

  return (
    <div className="max-w-[980px] mx-auto py-12 px-6">
      {/* Hero */}
      <div className="bg-[#1d1d1f] rounded-[30px] p-10 md:p-16 text-white mb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0071e3]/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-2xl">
          <Badge className="bg-[#0071e3]/20 text-white border-none mb-6">Institutional Partners</Badge>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-6 leading-tight">Unite Your Campus.<FeatureInfo title="Institutional Impact" content="Register your institution to track collective impact. Students/Residents earn points for their chapter." /><br/><span className="text-[#86868b]">Lead the Change.</span></h1>
          <p className="text-[#86868b] text-xl font-medium mb-10 leading-relaxed">
            Create a verified chapter for your College or Society. Host official drives, track collective impact, and compete in city-wide challenges.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" className="px-8 py-3 text-[17px]">Register Chapter</Button>
            <Button variant="outline" className="border-[#86868b] text-white hover:bg-[#333] hover:border-[#333]">Find My Chapter</Button>
          </div>
        </div>
      </div>

      {/* Live Challenge */}
      <div className="mb-20">
        <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-6 flex items-center gap-3">
          <Zap className="text-[#ff3b30]" fill="currentColor" /> Live Challenge <FeatureInfo title="Live Challenges" content="Time-bound competitions between chapters. Winners get grants and recognition. Participate by organizing drives or resolving issues." />
        </h2>
        <div className="bg-[#1d1d1f] text-white rounded-[30px] p-10 shadow-2xl relative overflow-hidden">
           <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse"></div>
           <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
             <div className="flex-1">
               <div className="flex justify-between items-start mb-2">
                 <div>
                   <h3 className="text-3xl font-semibold">Mumbai Cleanathon 2024</h3>
                   <p className="text-[#86868b] font-medium">Inter-college cleanup drive race.</p>
                 </div>
                 <Badge className="bg-red-500 text-white border-none animate-pulse px-3 py-1">Live</Badge>
               </div>
               <p className="text-sm text-orange-400 font-mono mb-6">Ends in: 4 Days 11 Hours</p>
               
               <div className="space-y-5">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white text-sm">IITB</div>
                   <div className="flex-1">
                     <div className="flex justify-between items-baseline mb-1">
                       <span className="font-semibold text-white">IIT Bombay</span>
                       <span className="font-mono text-blue-300">15,400 pts</span>
                     </div>
                     <div className="h-2 bg-white/10 rounded-full"><div className="h-2 bg-blue-500 rounded-full w-[65%]"></div></div>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center font-bold text-white text-sm">SXC</div>
                   <div className="flex-1">
                     <div className="flex justify-between items-baseline mb-1">
                       <span className="font-semibold text-white">St. Xavier's College</span>
                       <span className="font-mono text-green-300">11,200 pts</span>
                     </div>
                     <div className="h-2 bg-white/10 rounded-full"><div className="h-2 bg-green-500 rounded-full w-[48%]"></div></div>
                   </div>
                 </div>
               </div>
             </div>
             <div className="w-full md:w-56 text-center bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <Trophy size={40} className="mx-auto text-yellow-400 mb-3" />
                <p className="font-bold text-lg">Top Prize</p>
                <p className="text-sm text-gray-400">₹50,000 Grant for Campus Sustainability Projects</p>
                <Button variant="secondary" className="mt-4 w-full !text-sm">View Challenge</Button>
             </div>
           </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#1d1d1f]">Find a Chapter <FeatureInfo title="Chapter Directory" content="Search for chapters in your city. Joining a chapter helps you collaborate with neighbors or peers." /></h2>
        <div className="flex gap-3 w-full md:w-auto">
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
          <div key={chapter.id} className="bg-white rounded-[24px] shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 border border-gray-100/50 flex flex-col overflow-hidden">
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${chapter.color} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
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
              <Button variant="secondary" className="w-full !text-sm !py-2" onClick={() => onJoin(chapter)}>Join Chapter</Button>
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
    </div>
  );
};

// Leaderboard Component
const Leaderboard = ({ currentUser, onBack, chapters }) => {
  const [activeTab, setActiveTab] = useState('citizens');

  // Mock Data for National Leaderboard
  // In a real app, this would be fetched from backend sorted by score
  const leaders = useMemo(() => {
    const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Saanvi', 'Aanya', 'Aadhya', 'Aaradhya', 'Ananya', 'Pari', 'Anika', 'Navya', 'Diya', 'Myra'];
    const lastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Shah', 'Mehta', 'Jain', 'Reddy', 'Naidu', 'Iyer', 'Menon', 'Nair'];
    const cities = ['Mumbai', 'Delhi NCR', 'Bengaluru', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
    const badges = ['Change Maker', 'Guardian', 'Activist', 'Verified Reporter', 'Rising Star'];
    const avatars = ['bg-orange-100 text-orange-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700', 'bg-yellow-100 text-yellow-700'];

    const data = [];
    for (let i = 0; i < 100; i++) {
        const score = 10000 - (i * 70) - Math.floor(Math.random() * 50);
        data.push({
            id: `l${i + 1}`,
            name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
            city: cities[i % cities.length],
            reports: Math.floor(Math.random() * 100) + 20,
            resolved: Math.floor(Math.random() * 80) + 10,
            volunteers: Math.floor(Math.random() * 20),
            score: score,
            badge: i === 0 ? 'National Hero' : badges[i % badges.length],
            avatar: avatars[i % avatars.length]
        });
    }
    
    // If current user exists and isn't in top 100, add them for display
    if (currentUser) {
      // Calculate mock score for current user
      const userScore = 1250; // Base score
      const userEntry = { 
        id: currentUser.id, 
        name: currentUser.name, 
        city: currentUser.city || 'India', 
        reports: 12, 
        resolved: 4, 
        volunteers: 1, 
        score: userScore, 
        badge: 'Rising Star',
        avatar: 'bg-blue-600 text-white',
        isMe: true,
        rank: 1452 // Mock rank
      };
      // We don't push to top 100, but we use it for the "Your Rank" card
      return { top: data, me: userEntry };
    }
    return { top: data, me: null };
  }, [currentUser, activeTab]);

  const displayData = activeTab === 'citizens' ? leaders.top : chapters.sort((a,b) => b.score - a.score);

  return (
    <div className="max-w-[980px] mx-auto py-12 px-6">
      {/* Hero Section */}
      <div className="bg-[#1d1d1f] rounded-[30px] p-10 md:p-16 text-white mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <Badge className="bg-yellow-500/20 text-yellow-300 border-none mb-6">National Rankings</Badge>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-6 leading-tight">
            Civic Champions.<FeatureInfo title="National Rankings" content="We rank citizens and institutions based on their Civic Score. This score is calculated from reports filed, verified, and resolved." /><br/><span className="text-[#86868b]">Real Impact.</span>
          </h1>
          <p className="text-[#86868b] text-xl font-medium mb-8 leading-relaxed max-w-2xl">
            Recognizing the citizens and institutions transforming India, one report at a time. Scores are calculated based on verified impact.
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

      {/* Current User Rank Card */}
      {leaders.me && activeTab === 'citizens' && (
        <div className="bg-gradient-to-r from-[#0071e3] to-[#00c7be] rounded-[30px] p-8 text-white shadow-lg mb-12 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10 transition-transform group-hover:scale-110 duration-700"><Trophy size={200} /></div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center border border-white/30 shadow-inner">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">Rank</span>
              <span className="text-3xl font-bold">#{leaders.me.rank}</span>
            </div>
            <div>
              <div className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Your Performance</div>
              <div className="text-3xl font-semibold mb-1">{leaders.me.name}</div>
              <div className="text-sm text-blue-50 font-medium">{leaders.me.score} Civic Points • Top 15%</div>
            </div>
          </div>
          <div className="hidden md:block text-right relative z-10">
            <div className="text-4xl font-bold">{leaders.me.resolved}</div>
            <div className="text-xs text-blue-100 font-bold uppercase tracking-wider">Issues Resolved</div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white rounded-[30px] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f5f5f7] border-b border-gray-200">
              <tr>
                <th className="px-8 py-5 text-xs font-bold text-[#86868b] uppercase tracking-wider">Rank</th>
                <th className="px-8 py-5 text-xs font-bold text-[#86868b] uppercase tracking-wider">{activeTab === 'citizens' ? 'Citizen' : 'Institution'}</th>
                <th className="px-8 py-5 text-xs font-bold text-[#86868b] uppercase tracking-wider text-center">Impact Stats</th>
                <th className="px-8 py-5 text-xs font-bold text-[#86868b] uppercase tracking-wider text-right">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayData.map((leader, index) => (
                <tr key={leader.id} className="hover:bg-[#f5f5f7] transition-colors group">
                  <td className="px-8 py-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm
                      ${index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                        index === 1 ? 'bg-gray-300 text-gray-800' : 
                        index === 2 ? 'bg-orange-300 text-orange-900' : 'bg-white border border-gray-200 text-[#86868b]'}`}>
                      {index < 3 ? <Trophy size={18} fill="currentColor" className="opacity-80" /> : `#${index + 1}`}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-md ${leader.color ? `bg-gradient-to-br ${leader.color}` : (leader.avatar?.includes('bg-') ? leader.avatar : 'bg-gradient-to-br from-blue-500 to-indigo-600')}`}>
                        {leader.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-[#1d1d1f] text-lg flex items-center gap-2">
                          {leader.name}
                          {index === 0 && <Crown size={16} className="text-yellow-500 fill-current" />}
                        </div>
                        <div className="text-sm text-[#86868b] font-medium flex items-center gap-1">
                          <MapPin size={12} /> {leader.city} {leader.badge && <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wide ml-2">{leader.badge}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-8">
                      <div className="text-center" title="Resolved">
                        <div className="font-bold text-[#1d1d1f] text-lg">{activeTab === 'citizens' ? leader.resolved : leader.members}</div>
                        <div className="text-[10px] text-[#86868b] uppercase font-bold tracking-wide">{activeTab === 'citizens' ? 'Fixed' : 'Members'}</div>
                      </div>
                      <div className="w-px h-8 bg-gray-100"></div>
                      <div className="text-center">
                        <div className="font-bold text-[#1d1d1f] text-lg">{activeTab === 'citizens' ? leader.volunteers : leader.drives}</div>
                        <div className="text-[10px] text-[#86868b] uppercase font-bold tracking-wide">{activeTab === 'citizens' ? 'Drives' : 'Hosted'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="font-mono font-bold text-[#0071e3] text-xl">{leader.score.toLocaleString()}</div>
                    <div className="text-[10px] text-[#86868b] uppercase font-bold tracking-wide">Points</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

// Admin Dashboard
const AdminDashboard = ({ posts, onDelete, onVerify, onDismissFlag, onResolve }) => {
  const flaggedPosts = posts.filter(p => p.flags > 0);
  const pendingPosts = posts.filter(p => p.status === 'Open' && p.flags === 0);

  return (
    <div className="max-w-[980px] mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><LayoutDashboard className="text-blue-600" /> Moderation Dashboard <FeatureInfo title="Moderation Tools" content="Admins use this to review flagged content, verify reports, and mark issues as resolved. This ensures platform integrity." /></h2>
          <p className="text-gray-500">Review flagged content and verify reports.</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-red-100 text-red-700 border border-red-200">{flaggedPosts.length} Flagged</Badge>
          <Badge className="bg-orange-100 text-orange-700 border border-orange-200">{pendingPosts.length} Pending</Badge>
        </div>
      </div>

      {flaggedPosts.length > 0 && (
        <div className="mb-8">
           <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2"><AlertOctagon size={18} /> High Risk / Flagged</h3>
           <div className="bg-red-50 rounded-[24px] border border-red-100 overflow-hidden">
             {flaggedPosts.map(post => (
               <div key={post.id} className="p-4 border-b border-red-100 last:border-0 flex items-center justify-between">
                 <div>
                   <div className="font-bold text-gray-900">{post.title}</div>
                   <div className="text-xs text-red-600 font-medium">Flags: {post.flags} • ID: {post.id}</div>
                 </div>
                 <div className="flex gap-2">
                   <Button variant="secondary" className="!py-1 !px-2 text-xs" onClick={() => onDismissFlag(post.id)}>Dismiss</Button>
                   <Button variant="danger" className="!py-1 !px-2 text-xs" onClick={() => onDelete(post.id)}>Remove</Button>
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}

      <div className="bg-white rounded-[30px] shadow-sm overflow-hidden">
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
};

// Share Poster Modal
const SharePosterModal = ({ post, onClose }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white relative overflow-hidden">
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
        <div className="flex justify-center mb-4">
           <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
             <span className="text-xs text-gray-400 font-mono">SCAN TO JOIN</span>
           </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button variant="primary" icon={Download} onClick={() => { alert('Poster downloaded!'); onClose(); }}>Save Image</Button>
        </div>
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
          <Button variant="outline" className="!py-1 !px-2 text-xs" onClick={() => setShowInput(!showInput)}>
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
             <Button variant="ghost" className="!py-1 !px-2 text-xs" onClick={() => setShowInput(false)}>Cancel</Button>
             <Button variant="primary" className="!py-1 !px-2 text-xs" onClick={() => {
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
            <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-white transition-all
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
const PostCard = ({ post, onClick, onVolunteer, onShare, onVouch, onFlag, currentUser }) => {
  const category = CATEGORIES.find(c => c.id === post.type) || CATEGORIES[0];
  const isResolved = post.status === 'Resolved';
  
  return (
    <div className={`bg-white rounded-[24px] shadow-sm hover:shadow-xl transition-all duration-300 group relative border border-gray-100 h-full flex flex-col overflow-hidden
      ${post.flags > 0 ? 'ring-2 ring-red-100' : ''}`}>
      
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
        <h3 className="text-lg font-bold text-[#1d1d1f] mb-2 leading-tight cursor-pointer hover:text-[#0071e3] transition-colors line-clamp-2" onClick={() => onClick(post)}>
          {post.title}
        </h3>

        {/* Meta: Location & Date */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
           <span className="flex items-center gap-1"><MapPin size={12} /> {post.city}</span>
           <span className="w-1 h-1 rounded-full bg-gray-300"></span>
           <span>{post.date}</span>
        </div>

        {/* Evidence Gallery (Restored) */}
        {isResolved && post.evidence ? (
           <div className="mb-4 rounded-xl overflow-hidden h-32 relative group/img cursor-pointer" onClick={() => onClick(post)}>
              <div className="absolute inset-0 flex">
                 <img src={post.evidence.before} className="w-1/2 h-full object-cover" alt="Before" />
                 <img src={post.evidence.after} className="w-1/2 h-full object-cover" alt="After" />
              </div>
              <div className="absolute inset-0 bg-black/10 group-hover/img:bg-transparent transition-colors"></div>
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-md">Fixed</div>
           </div>
        ) : post.isVolunteerDrive && post.eventDate ? (
           <div className="mb-4 bg-[#f5f5f7] rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="bg-white p-2 rounded-lg text-blue-600 shadow-sm">
                    <Calendar size={16} />
                 </div>
                 <div>
                    <div className="text-xs font-bold text-gray-900">{post.eventDate}</div>
                    <div className="text-[10px] text-gray-500">{post.eventTime}</div>
                 </div>
              </div>
              <Button variant="primary" className="!py-1.5 !px-3 !text-xs !h-auto" onClick={(e) => { e.stopPropagation(); onVolunteer(post.id); }}>Join</Button>
           </div>
        ) : (
           <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">{post.description}</p>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#1d1d1f] transition-colors">
                 <ThumbsUp size={14} /> {post.upvotes}
              </button>
              <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#1d1d1f] transition-colors" onClick={() => onClick(post)}>
                 <MessageCircle size={14} /> {post.comments.length}
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
const CreatePost = ({ onBack, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: 'cleanliness', title: '', description: '', city: '', state: '', location: '',
    agreePolicy: false, agreeTruth: false
  });
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
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

    // Submit sanitized data
    onSubmit({
      ...formData,
      title: maskedTitle,
      description: maskedDesc
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft size={18} /> Back to Feed
      </button>

      <div className="bg-white rounded-[30px] shadow-xl shadow-gray-200/50 p-8 md:p-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">File a Report <FeatureInfo title="Reporting Guidelines" content="Choose the correct category. Provide clear details. Your report will be public but your personal details (phone/email) are kept private." /></h2>

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
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              />
              <p className="text-xs text-gray-400 mt-1">Note: 10-digit mobile numbers will be masked (e.g., 98XXXXX123) to prevent doxxing.</p>
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

          <Button variant="primary" className="w-full py-3 text-lg shadow-blue-300/50 shadow-lg" disabled={!formData.agreePolicy || !formData.agreeTruth}>
            Submit Report
          </Button>
        </form>
      </div>
    </div>
  );
};

// Login Screen Component
const LoginScreen = ({ onLogin, onBack, onSignUpClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network request
    setTimeout(() => {
      onLogin({ 
        name: 'Citizen User', 
        id: 'user_123', 
        email: email, 
        role: 'user',
        joinedDate: 'Oct 2023',
        phone: '9876543210',
        aadhar: 'XXXX-XXXX-1234',
        address: 'Sector 4, Main Street',
        city: 'Mumbai',
        occupation: 'Concerned Citizen',
        age: '25'
      });
    }, 1000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-[30px] shadow-xl p-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-teal-400 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-200">
            <Shield size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 text-sm mt-1">Sign in to continue your civic journey</p>
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

          <Button variant="primary" className="w-full py-3 text-base shadow-lg shadow-blue-200" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Login'}
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
const SignUpScreen = ({ onSignUp, onBack }) => {
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', aadhar: '', address: '', city: '', occupation: '', age: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      onSignUp({
        name: formData.name,
        email: formData.email,
        id: `user_${Date.now()}`,
        role: 'user',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        phone: formData.phone,
        aadhar: formData.aadhar,
        address: formData.address,
        city: formData.city,
        occupation: formData.occupation,
        age: formData.age
      });
    }, 1000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-[30px] shadow-xl p-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Join the Movement</h2>
          <p className="text-gray-500 text-sm mt-1">Create an account to start reporting</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
            <input type="text" required className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none"
              value={formData.aadhar} onChange={e => setFormData({...formData, aadhar: e.target.value})} placeholder="XXXX-XXXX-XXXX" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input type="text" required className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none"
              value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
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

          <Button variant="primary" className="w-full py-3 mt-2" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
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
    aadhar: user.aadhar || '',
    address: user.address || '',
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
            <input type="text" className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none"
              value={formData.aadhar} onChange={e => setFormData({...formData, aadhar: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input type="text" className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border-none text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 outline-none"
              value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
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

// User Dashboard Component
const UserDashboard = ({ user, posts, onViewChange, onLogout, onUpdateUser, onSimulateAlert }) => {
  const [activeTab, setActiveTab] = useState('activity');
  const myPosts = posts.filter(p => p.authorId === user.id);
  const resolvedCount = myPosts.filter(p => p.status === 'Resolved').length;
  const totalUpvotes = myPosts.reduce((acc, curr) => acc + (curr.upvotes || 0), 0);

  const messages = [
    { id: 1, sender: 'Ravi K.', senderId: 'user_123', text: 'Hey, thanks for the update on the Dadar issue! Great work.', time: '2 hours ago', unread: true },
    { id: 2, sender: 'Admin Team', senderId: 'admin', text: 'Your report #202 has been verified successfully. Keep it up!', time: '1 day ago', unread: false },
    { id: 3, sender: 'Priya S.', senderId: 'user_456', text: 'Can you share the exact location pin for the cleanup drive next week?', time: '2 days ago', unread: false },
  ];

  // Permissions Logic
  const permissions = [
    { label: 'Submit Reports', active: true, icon: FileText },
    { label: 'Comment & Discuss', active: true, icon: MessageCircle },
    { label: 'Verify Issues', active: false, icon: CheckCircle, req: 'Req: Level 5' },
    { label: 'Moderation Access', active: false, icon: Shield, req: 'Req: Admin' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Profile Card */}
      <div className="bg-white rounded-[30px] p-8 md:p-10 shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white">
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
              <Badge className="bg-blue-100 text-blue-700 px-3 py-1">Level 3 Citizen</Badge>
              <Badge className="bg-yellow-100 text-yellow-800 px-3 py-1">Verified Reporter</Badge>
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[140px]">
            <Button variant="outline" onClick={() => onViewChange('create')} icon={Plus}>New Report</Button>
            <Button variant="secondary" onClick={onLogout} icon={LogOut} className="text-red-600 hover:bg-red-50 border-red-100">Logout</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Permissions */}
        <div className="space-y-6">
          {/* Impact Stats */}
          <div className="bg-white rounded-[24px] shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Activity size={18} className="text-blue-600"/> Your Impact <FeatureInfo title="Impact Stats" content="Track your contributions. 'Reports' are issues you filed. 'Resolved' are those fixed. 'Upvotes' show community support." /></h3>
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
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">Top 10%</div>
                <div className="text-xs text-purple-700 font-medium">Rank</div>
              </div>
            </div>
          </div>

          {/* Permissions / Capabilities */}
          <div className="bg-white rounded-[24px] shadow-sm p-6">
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
          <div className="bg-white rounded-[30px] shadow-sm overflow-hidden min-h-[500px] p-6">
            <div className="flex p-1 bg-[#f5f5f7] rounded-xl mb-6">
              <button 
                onClick={() => setActiveTab('activity')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'activity' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
              >
                My Reports
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
                      <span className="flex items-center gap-1"><MessageCircle size={12}/> {post.comments.length}</span>
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
              ) : activeTab === 'messages' ? (
                messages.length > 0 ? messages.map(msg => (
                  <div key={msg.id} className={`p-5 hover:bg-gray-50 transition-colors cursor-pointer ${msg.unread ? 'bg-blue-50/30' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
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
    </div>
  );
};

// Impact Gallery Page Component
const ImpactGalleryPage = ({ posts }) => {
  const [filterState, setFilterState] = useState('All');
  const [filterCity, setFilterCity] = useState('All');

  // Filter resolved posts with evidence
  const resolvedPosts = useMemo(() => {
    return posts.filter(p => p.status === 'Resolved' && p.evidence?.before && p.evidence?.after);
  }, [posts]);

  // Apply state/city filters
  const filteredPosts = useMemo(() => {
    return resolvedPosts.filter(post => {
      if (filterState !== 'All' && post.state !== filterState) return false;
      if (filterCity !== 'All' && post.city !== filterCity) return false;
      return true;
    });
  }, [resolvedPosts, filterState, filterCity]);

  // Dynamic city options based on state selection
  const availableCities = useMemo(() => {
    if (filterState === 'All') return [...new Set(STATES.flatMap(s => s.cities))].sort();
    const state = STATES.find(s => s.name === filterState);
    return state ? state.cities : [];
  }, [filterState]);

  // Calculate stats
  const stats = {
    totalFixed: filteredPosts.length,
    totalVouches: filteredPosts.reduce((acc, p) => acc + (p.vouchCount || 0), 0),
    citiesImpacted: new Set(filteredPosts.map(p => p.city)).size
  };

  return (
    <div className="max-w-[980px] mx-auto py-12 px-6">
      {/* Header */}
      <div className="bg-[#1d1d1f] rounded-[30px] p-10 md:p-16 text-white mb-12 relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        <div className="relative z-10">
          <Badge className="bg-green-500/20 text-green-300 border-none mb-6 inline-flex items-center gap-1"><CheckCircle size={12}/> Real Change</Badge>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-6 leading-tight">Impact Gallery</h1>
          <p className="text-[#86868b] text-xl max-w-2xl mx-auto font-medium">
            Witness the transformation. Verified before and after stories from across the nation, proving that collective action works.
          </p>
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="bg-white rounded-[30px] p-8 shadow-sm border border-gray-100 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 border-b border-gray-100 pb-8">
           <div className="text-center">
             <div className="text-4xl font-bold text-[#1d1d1f] mb-1">{stats.totalFixed}</div>
             <div className="text-xs font-bold text-[#86868b] uppercase tracking-wider">Issues Resolved</div>
           </div>
           <div className="text-center border-l border-r border-gray-100">
             <div className="text-4xl font-bold text-[#0071e3] mb-1">{stats.totalVouches}</div>
             <div className="text-xs font-bold text-[#86868b] uppercase tracking-wider">Community Vouches</div>
           </div>
           <div className="text-center">
             <div className="text-4xl font-bold text-green-600 mb-1">{stats.citiesImpacted}</div>
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
             className="px-4 py-2 rounded-xl bg-[#f5f5f7] border-none text-sm focus:ring-2 focus:ring-[#0071e3]/20 cursor-pointer min-w-[150px] text-[#1d1d1f] font-medium"
           >
             <option value="All">All States</option>
             {STATES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
           </select>
           <select 
             value={filterCity}
             onChange={(e) => setFilterCity(e.target.value)}
             className="px-4 py-2 rounded-xl bg-[#f5f5f7] border-none text-sm focus:ring-2 focus:ring-[#0071e3]/20 cursor-pointer min-w-[150px] text-[#1d1d1f] font-medium"
           >
             <option value="All">All Cities</option>
             {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
           </select>
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredPosts.map(post => (
            <div key={post.id} className="bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group border border-gray-100">
              {/* Before/After Slider Effect */}
              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 flex">
                   <div className="w-1/2 h-full relative border-r border-white/20">
                      <img src={post.evidence.before} alt="Before" className="w-full h-full object-cover" />
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold rounded-md text-white">BEFORE</div>
                   </div>
                   <div className="w-1/2 h-full relative">
                      <img src={post.evidence.after} alt="After" className="w-full h-full object-cover" />
                      <div className="absolute bottom-4 right-4 bg-green-600 shadow-lg px-2.5 py-1 text-[10px] font-bold rounded-md text-white flex items-center gap-1">
                        AFTER <CheckCircle size={10} />
                      </div>
                   </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                   <Badge className="bg-[#f5f5f7] text-[#1d1d1f] border-none">{post.city}</Badge>
                   <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                      <ThumbsUp size={12} /> {post.upvotes} Upvotes
                   </div>
                </div>
                <h3 className="font-semibold text-xl text-[#1d1d1f] mb-2">{post.title}</h3>
                <p className="text-sm text-[#86868b] line-clamp-2 mb-4 font-medium">{post.description}</p>
                
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                     {post.author.charAt(0)}
                   </div>
                   <div className="flex flex-col">
                     <span className="text-xs font-bold text-[#1d1d1f]">{post.author}</span>
                     <span className="text-[10px] text-[#86868b]">Reporter</span>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-[30px] border border-dashed border-gray-200">
          <p className="text-gray-500 mb-4">No resolved issues found for this filter.</p>
          <button onClick={() => { setFilterState('All'); setFilterCity('All'); }} className="text-[#0071e3] text-sm font-medium hover:underline">Clear Filters</button>
        </div>
      )}
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
  
  // NEW: Home Location Filter State
  const [homeCityFilter, setHomeCityFilter] = useState('All');
  
  // Persistence Logic
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('indiaAct_posts_v2');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });
  
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('indiaAct_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState(null);
  const [sharePost, setSharePost] = useState(null);
  const [subscribedCities, setSubscribedCities] = useState([]);

  const [chapters, setChapters] = useState(INITIAL_CHAPTERS);

  const handleJoinChapter = (chapter) => setToast({ message: `Request sent to join ${chapter.name}!`, type: 'success' });

  // Save state updates to local storage
  useEffect(() => {
    localStorage.setItem('indiaAct_posts_v2', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    if (user) localStorage.setItem('indiaAct_user', JSON.stringify(user));
    else localStorage.removeItem('indiaAct_user');
  }, [user]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  
  const navigate = (newView, params = {}) => {
    setView(newView);
    if (params.city) setSelectedCity(params.city);
    if (params.post) setSelectedPost(params.post);
    window.scrollTo(0, 0);
  };

  const performLogin = (userData) => {
    setUser(userData);
    setView('dashboard');
    setToast({ message: 'Welcome back, Citizen!', type: 'success' });
  };

  const handleUpdateProfile = (updatedUser) => {
    setUser(updatedUser);
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
    setToast({ message: `Test alert sent to ${config.channels.join(' & ')}`, type: 'success' });
  };

  const handleLogout = () => {
    setUser(null);
    setToast({ message: 'Logged out successfully.', type: 'success' });
    navigate('home');
  };

  const handleCreatePost = (data) => {
    const newPost = {
      id: Date.now(),
      ...data,
      author: user ? user.name : 'Anonymous',
      authorId: user ? user.id : 'anon',
      date: 'Just now',
      status: 'Open',
      upvotes: 0,
      vouchCount: 0,
      trustScore: 'Low',
      flags: 0,
      comments: [],
      tags: [data.type],
      isVolunteerDrive: data.type === 'volunteer',
      badges: ['New Reporter'],
      timeline: [
        { status: 'Reported', date: 'Just now', desc: 'Issue submitted by user.' }
      ]
    };
    setPosts([newPost, ...posts]);
    setToast({ message: 'Report submitted! Pending moderation.', type: 'success' });
    navigate('home'); 
  };

  // Community Policing: Vouch System
  const handleVouch = (postId) => {
    if (!user) { setToast({ message: "Login to vouch for this issue.", type: 'error' }); return; }
    
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newCount = (p.vouchCount || 0) + 1;
        // Auto-upgrade Trust Score based on community validation
        const newScore = getTrustScore(newCount, p.evidence);
        return { ...p, vouchCount: newCount, trustScore: newScore };
      }
      return p;
    }));
    setToast({ message: "You vouched for this issue. Trust Score updated.", type: 'success' });
  };

  // Moderation: Flagging System
  const handleFlag = (postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, flags: (p.flags || 0) + 1 };
      }
      return p;
    }));
    setToast({ message: "Post flagged for review.", type: 'success' });
  };

  const handleVolunteer = (postId) => {
    if (!user) { setToast({ message: "Please login to join!", type: 'error' }); return; }
    
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const hasVolunteered = p.volunteers?.includes(user.id);
        const newVolunteers = hasVolunteered ? p.volunteers.filter(id => id !== user.id) : [...(p.volunteers || []), user.id];
        return { ...p, volunteers: newVolunteers };
      }
      return p;
    }));
    setToast({ message: "Volunteer status updated.", type: 'success' });
  };

  // Post Lifecycle: Add Update
  const handleAddTimelineUpdate = (postId, updateText) => {
    if (!updateText.trim()) return;
    
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          timeline: [...p.timeline, { status: 'Update', date: 'Just now', desc: updateText }]
        };
      }
      return p;
    }));
    setToast({ message: "Timeline updated successfully.", type: 'success' });
  };

  // Admin Actions
  const handleDeletePost = (id) => {
    setPosts(posts.filter(p => p.id !== id));
    setToast({ message: 'Post permanently removed.', type: 'success' });
  };

  const handleVerifyPost = (id) => {
    setPosts(posts.map(p => {
      if (p.id === id) {
        return { 
          ...p, 
          status: 'Verified', 
          badges: [...(p.badges || []), 'Verified'],
          timeline: [...(p.timeline || []), { status: 'Verified', date: 'Just now', desc: 'Verified by Admin.' }]
        };
      }
      return p;
    }));
    setToast({ message: 'Post verified.', type: 'success' });
  };

  const handleResolvePost = (id) => {
    // In a real app, this would open a modal to upload an image.
    const afterPhotoUrl = window.prompt("Enter 'After' photo URL to mark resolved (Required):", "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=400");
    if (!afterPhotoUrl) return;

    setPosts(posts.map(p => {
      if (p.id === id) {
        return { 
          ...p, 
          status: 'Resolved', 
          evidence: { ...p.evidence, after: afterPhotoUrl, before: p.evidence?.before || 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&q=80&w=400' }, // Ensure before exists for demo
          timeline: [...(p.timeline || []), { status: 'Resolved', date: 'Just now', desc: 'Issue resolved and verified with photographic evidence.' }]
        };
      }
      return p;
    }));
    setToast({ message: 'Issue resolved and Impact Card generated!', type: 'success' });
  };

  const handleDismissFlag = (id) => {
    setPosts(posts.map(p => p.id === id ? { ...p, flags: 0 } : p));
    setToast({ message: 'Flags dismissed.', type: 'success' });
  };

  const handleSubscribe = () => {
     if(!selectedCity) return;
     if(subscribedCities.includes(selectedCity)) {
        setSubscribedCities(prev => prev.filter(c => c !== selectedCity));
        setToast({ message: `Unsubscribed from ${selectedCity}.`, type: 'success' });
     } else {
        setSubscribedCities(prev => [...prev, selectedCity]);
        setToast({ message: `Alerts active for ${selectedCity}!`, type: 'success' });
     }
  };

  const feedPosts = useMemo(() => {
    let filtered = posts;
    if (view === 'city' && selectedCity) {
      filtered = posts.filter(p => p.city === selectedCity);
    }
    // Filter out posts with high flags for regular view (Auto-Moderation)
    return filtered.filter(p => p.flags < 3);
  }, [posts, view, selectedCity]);

  // Derived filtered list for Home View
  const homeFilteredPosts = useMemo(() => {
    let list = feedPosts;
    if (homeCityFilter !== 'All') {
      list = list.filter(p => p.city === homeCityFilter);
    }
    return list.slice(0, 3);
  }, [feedPosts, homeCityFilter]);

  const renderContent = () => {
    switch(view) {
      case 'login':
        return <LoginScreen onLogin={performLogin} onBack={() => navigate('home')} onSignUpClick={() => navigate('signup')} />;

      case 'signup':
        return <SignUpScreen onSignUp={performLogin} onBack={() => navigate('login')} />;

      case 'dashboard':
        return user ? <UserDashboard user={user} posts={posts} onViewChange={navigate} onLogout={handleLogout} onUpdateUser={handleUpdateProfile} onSimulateAlert={handleSimulateAlert} /> : <LoginScreen onLogin={performLogin} onBack={() => navigate('home')} onSignUpClick={() => navigate('signup')} />;

      case 'edit-profile':
        return user ? <EditProfile user={user} onSave={handleUpdateProfile} onCancel={() => navigate('dashboard')} /> : <LoginScreen onLogin={performLogin} onBack={() => navigate('home')} onSignUpClick={() => navigate('signup')} />;

      case 'home':
        return (
          <>
            <Hero onViewChange={navigate} />
            <div className="max-w-[980px] mx-auto px-6 py-12">
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
                      onVouch={handleVouch}
                      onFlag={handleFlag}
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
            <ImpactWall posts={posts} onViewChange={navigate} />
            <ChaptersPromo onViewChange={navigate} chapters={chapters} />
            <SmartAlertsPromo onViewChange={navigate} user={user} />
            <MotivationSection onViewChange={navigate} />
          </>
        );
      
      case 'explore':
        return <Explore onCitySelect={(city) => navigate('city', { city })} />;

      case 'chapters':
        return <Chapters chapters={chapters} onJoin={handleJoinChapter} />;

      case 'leaderboard':
        return <Leaderboard currentUser={user} onBack={() => navigate('home')} chapters={chapters} />;

      case 'resources':
        return <CivicResourcesPage />;

      case 'impact':
        return <ImpactGalleryPage posts={posts} />;

      case 'city':
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
                    onVouch={handleVouch}
                    onFlag={handleFlag}
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
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="font-bold text-indigo-900 text-lg mb-2">College Chapters</h3>
                <p className="text-indigo-700 text-sm mb-4">Start a student unit in {selectedCity}.</p>
                <Button variant="primary" className="w-full bg-indigo-600 hover:bg-indigo-700 border-none">Register Unit</Button>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText size={18} /> Resources</h3>
                <ul className="space-y-3">
                   {RESOURCES.map((r, i) => (
                      <li key={i} className="group cursor-pointer">
                         <div className="flex items-center justify-between text-sm font-medium text-gray-700 group-hover:text-blue-600">
                            {r.title} <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                         </div>
                         <p className="text-xs text-gray-500">{r.desc}</p>
                      </li>
                   ))}
                </ul>
              </div>
            </div>
          </div>
        );

      case 'create':
        return <CreatePost onBack={() => navigate('home')} onSubmit={handleCreatePost} />;
      
      case 'admin':
        return <AdminDashboard posts={posts} onDelete={handleDeletePost} onVerify={handleVerifyPost} onDismissFlag={handleDismissFlag} onResolve={handleResolvePost} />;

      case 'post':
        return selectedPost && (
          <div className="max-w-3xl mx-auto px-4 py-8">
            <button onClick={() => navigate('home')} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-900 transition-colors">
              <ArrowLeft size={18} /> Back
            </button>
            <PostCard 
              post={selectedPost} 
              onClick={() => {}} 
              onVolunteer={handleVolunteer} 
              onShare={setSharePost} 
              onVouch={handleVouch} 
              onFlag={handleFlag}
              currentUser={user}
            />
            
            {/* Participants / Heroes Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
               <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <Users size={18} className="text-blue-600" />
                 Community Heroes
               </h3>
               <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                     {/* Mock participants based on upvotes/volunteers */}
                     {[...Array(Math.min(5, (selectedPost.volunteers?.length || 0) + 2))].map((_, i) => (
                       <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center text-xs font-bold text-gray-600" title={`User ${i+1}`}>
                          {String.fromCharCode(65 + i)}
                       </div>
                     ))}
                     <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600">
                       +{selectedPost.upvotes}
                     </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-bold text-gray-900">{selectedPost.upvotes + (selectedPost.volunteers?.length || 0)} citizens</span> participated in this change.
                  </div>
               </div>
               {selectedPost.isVolunteerDrive && (
                 <div className="mt-4 pt-4 border-t border-gray-50">
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-500">Drive Status:</span>
                       <span className={`font-bold ${selectedPost.status === 'Resolved' ? 'text-green-600' : 'text-blue-600'}`}>
                         {selectedPost.status === 'Resolved' ? 'Completed Successfully' : 'Active - Join Now'}
                       </span>
                    </div>
                 </div>
               )}
            </div>

            {/* NEW: Timeline with Update Feature */}
            <PostTimeline 
              timeline={selectedPost.timeline} 
              canUpdate={user && user.id === selectedPost.authorId}
              onAddUpdate={(text) => handleAddTimelineUpdate(selectedPost.id, text)}
            />

            <div className="mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Discussion</h3>
              <div className="space-y-4">
                {selectedPost.comments.length > 0 ? selectedPost.comments.map(c => (
                  <div key={c.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="font-medium text-sm text-gray-900 mb-1 flex items-center gap-2">
                       {c.author} {c.author === 'Admin' && <Badge className="bg-blue-100 text-blue-700">MOD</Badge>}
                    </div>
                    <p className="text-sm text-gray-600">{c.text}</p>
                  </div>
                )) : <p className="text-gray-500 italic text-sm">No comments yet.</p>}
              </div>
              <div className="mt-6 flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0"></div>
                <div className="flex-1 relative">
                  <input type="text" placeholder="Add a comment..." className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  <button className="absolute right-2 top-1.5 text-blue-600 text-xs font-bold p-1 hover:bg-blue-50 rounded">POST</button>
                </div>
              </div>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans selection:bg-blue-100">
      <Navbar currentView={view} onViewChange={navigate} user={user} onLoginClick={() => navigate('login')} onLogout={handleLogout} notifications={notifications} showNotifications={showNotifications} setShowNotifications={setShowNotifications} />
      <main className="animate-fade-in">{renderContent()}</main>
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {sharePost && <SharePosterModal post={sharePost} onClose={() => setSharePost(null)} />}
      
      <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-12">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Shield size={16} /> IndiaAct</div>
            <p className="text-xs text-gray-500 leading-relaxed">Built for a better tomorrow. <br/>Join the civic revolution.</p>
          </div>
          <div>
            <div className="font-bold text-sm text-gray-900 mb-4">Platform</div>
            <ul className="space-y-2 text-xs text-gray-500"><li>About Us</li><li>Guidelines</li><li>Privacy Policy</li></ul>
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
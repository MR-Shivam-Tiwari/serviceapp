import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

import { StatusBar, Style } from '@capacitor/status-bar';

import ForgotPassword from './Component/Auth/ForgotPassword';
import Login from './Component/Auth/Login';
import ResetPassword from './Component/Auth/ResetPassword';
import Home from './Component/Home/Home';
import './index.css';
import Installation from './Component/Installation/Installation';
import Complaints from './Component/Complaints/Complaints';
import EquipmentDetail from './Component/EquipmentDetail/EquipmentDetail';
import CheckStock from './Component/Stock/CheckStock';
import OwnStocks from './Component/Stock/OwnStocks';
import Customer from './Component/Customer/Customer';
import SearchCustomer from './Component/Customer/CustomerAction/SearchCustomer';
import AddNewCustomer from './Component/Customer/CustomerAction/AddNewCustomer';
import CreateComplaint from './Component/Complaints/CreateComplaint';
import PendingComplaints from './Component/Complaints/PendingComplaints';
import CreateCloseComplaint from './Component/Complaints/CreateCloseComplaint';
import ComplaintDetailsPage from './Component/Complaints/ComplaintDetailsPage ';
import CustomerDetails from './Component/Customer/CustomerAction/CustomerDetails';
import { Toaster } from 'react-hot-toast';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import SelectCustomer from './Component/Installation/SelectCustomer';
import InstallationSummary from './Component/Installation/InstallationSummary';
import PreventiveMaintenance from './Component/PreventiveMaintenance/PreventiveMaintenance';
import PmDetails from './Component/PreventiveMaintenance/PmDetails';
import CloseComplaintPage from './Component/Complaints/CloseComplaintPage';
import ComplaintSummaryPage from './Component/Complaints/ComplaintSummaryPage';
import ContractProposal from './Component/ContractProposal/ContractProposal';
import CreateProposal from './Component/ContractProposal/CreateProposal';
import PendingProposal from './Component/ContractProposal/PendingProposal';
import CompletedOrder from './Component/ContractProposal/CompletedOrder';
import ProposalDetails from './Component/ContractProposal/ProposalDetails';
import ProposalRevision from './Component/ContractProposal/ProposalRevision';
import QuoteGeneration from './Component/ContractProposal/QuoteGeneration';
import CNoteGen from './Component/ContractProposal/CNoteGen';
import OnCallService from './Component/OnCallService/OnCallService';
import UserProfile from './Component/Home/UserProfile';
import ResetPasswordOtp from './Component/Auth/ResetPasswordOtp';
import OTPVerification from './Component/Auth/OTPVerification';
import CreateOnCallEstimationPage from './Component/OnCallService/CreateOnCallEstimationPage';
import PendingOnCall from './Component/OnCallService/PendingOnCall';
import OnCallRevision from './Component/OnCallService/OnCallRevision';
import OnCallQuoteGeneration from './Component/OnCallService/OnCallQuoteGeneration';
import OnCallCNoteGen from './Component/OnCallService/OnCallCNoteGen';
import OnCallCompletedOrder from './Component/OnCallService/OnCallCompletedOrder';
const platform = Capacitor.getPlatform();




const BackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [routeStack, setRouteStack] = useState(['/']);

  useEffect(() => {
    setRouteStack(prev => {
      if (prev[prev.length - 1] !== location.pathname) {
        return [...prev, location.pathname];
      }
      return prev;
    });
  }, [location]);

  useEffect(() => {
    // Run only on Android/iOS
    if (Capacitor.getPlatform() !== 'web') {
      const handler = CapacitorApp.addListener('backButton', () => {
        if (routeStack.length > 1) {
          const previousRoute = routeStack[routeStack.length - 2];
          setRouteStack(prev => prev.slice(0, -1));
          navigate(previousRoute, { replace: true });
        } else {
          CapacitorApp.minimizeApp(); // App minimize karega root screen pe
        }
      });

      // Clean up
      return () => {
        if (typeof handler?.remove === 'function') {
          handler.remove();
        }
      };
    }
  }, [navigate, routeStack]);

  return null;
};

function App() {
  useEffect(() => {
    const setupNativeUI = async () => {
      if (Capacitor.isNativePlatform()) {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        const { SplashScreen } = await import('@capacitor/splash-screen');

        try {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
          await SplashScreen.hide();
        } catch (error) {
          console.warn('Native UI plugin error:', error);
        }
      }
    };

    setupNativeUI();
  }, []);

  return (
    <Router>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            borderRadius: '10px',
            background: 'white',
            color: 'black',
          },
        }}
      />
      {/* Safe area container */}
      <div className="safe-area-container   varela-round">
        <BackButtonHandler />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute element={Login} />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route path="/reset-password-otp" element={<ResetPasswordOtp />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={<PrivateRoute element={Home} />}
          />
          <Route
            path="/installation"
            element={<PrivateRoute element={Installation} />}
          />
          <Route
            path="/complaints"
            element={<PrivateRoute element={Complaints} />}
          />
          <Route
            path="/user-profile"
            element={<PrivateRoute element={UserProfile} />}
          />
          <Route
            path="/closecomplaint"
            element={<PrivateRoute element={CloseComplaintPage} />}
          />
          <Route
            path="/complaintsummary"
            element={<PrivateRoute element={ComplaintSummaryPage} />}
          />

          <Route
            path="/preventive-maintenance"
            element={<PrivateRoute element={PreventiveMaintenance} />}
          />

          <Route
            path="/pm-details"
            element={<PrivateRoute element={PmDetails} />}
          />
          <Route
            path="/equipmentdetail"
            element={<PrivateRoute element={EquipmentDetail} />}
          />
          <Route
            path="/checkstock"
            element={<PrivateRoute element={CheckStock} />}
          />
          <Route
            path="/ownstocks"
            element={<PrivateRoute element={OwnStocks} />}
          />
          <Route
            path="/customer"
            element={<PrivateRoute element={Customer} />}
          />
          <Route
            path="/searchcustomer"
            element={<PrivateRoute element={SearchCustomer} />}
          />
          <Route
            path="/addnewcustomer"
            element={<PrivateRoute element={AddNewCustomer} />}
          />
          <Route
            path="/createcomplaint"
            element={<PrivateRoute element={CreateComplaint} />}
          />
          <Route
            path="/pendingcomplaints"
            element={<PrivateRoute element={PendingComplaints} />}
          />
          <Route
            path="/createclosecomplaint"
            element={<PrivateRoute element={CreateCloseComplaint} />}
          />
          <Route
            path="/pendingcomplaints/:complaintId"
            element={<PrivateRoute element={ComplaintDetailsPage} />}
          />
          <Route
            path="/search-customer"
            element={<PrivateRoute element={SelectCustomer} />}
          />
          <Route
            path="/installation-summary"
            element={<PrivateRoute element={InstallationSummary} />}
          />

          <Route
            path="/customer-details/:id"
            element={<PrivateRoute element={CustomerDetails} />}
          />
          <Route
            path="/contract-proposal"
            element={<PrivateRoute element={ContractProposal} />}
          />
          <Route
            path="/create-proposal"
            element={<PrivateRoute element={CreateProposal} />}
          />
          <Route
            path="/pending-proposal"
            element={<PrivateRoute element={PendingProposal} />}
          />
          <Route
            path="/completed-order"
            element={<PrivateRoute element={CompletedOrder} />}
          />
          <Route
            path="/oncall-completed-order"
            element={<PrivateRoute element={CompletedOrder} />}
          />
          <Route
            path="/proposal-details"
            element={<PrivateRoute element={ProposalDetails} />}
          />
          <Route
            path="/quote-generation"
            element={<PrivateRoute element={QuoteGeneration} />}
          />
          <Route
            path="/quote-generation/:id"
            element={<PrivateRoute element={CNoteGen} />}
          />
          <Route
            path="/proposal-revision/:id"
            element={<PrivateRoute element={ProposalRevision} />}
          />

          <Route
            path="/oncall-service"
            element={<PrivateRoute element={OnCallService} />}
          />
          <Route
            path="/create-oncall-estimation"
            element={<PrivateRoute element={CreateOnCallEstimationPage} />}
          />
          <Route
            path="/on-call-pending"
            element={<PrivateRoute element={PendingOnCall} />}
          />
          <Route
            path="/on-call-revision/:id"
            element={<PrivateRoute element={OnCallRevision} />}
          />
          <Route
            path="/oncall-quote-generation"
            element={<PrivateRoute element={OnCallQuoteGeneration} />}
          />
          <Route
            path="/oncall-quote-generation/:id"
            element={<PrivateRoute element={OnCallCNoteGen} />}
          />
          <Route
            path="/on-call-completed"
            element={<PrivateRoute element={OnCallCompletedOrder} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
import PrivateRoute from './PrivateRoute'; // Import the PrivateRoute
import PublicRoute from './PublicRoute'; // Import PublicRoute

function App() {
  return (
    <Router>
      <Toaster
        position="top-right" // This ensures the toast appears at the top-right corner
        reverseOrder={false} // Optional, to make toasts appear in the order they are called
        toastOptions={{
          style: {
            borderRadius: '10px',
            background: 'white',
            color: 'black',
          },
        }}
      />
      <div className="varela-round">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute element={Login} />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

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
            path="/customer-details/:id"
            element={<PrivateRoute element={CustomerDetails} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

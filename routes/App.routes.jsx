import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import AppLayout from "../src/layout/AppLayout";
import Login from "../src/auth/Login";
import Home from "../src/Home";
import Hostels from "../src/views/hostels/Hostels";
import Hostel from "../src/views/hostels/Hostel";
import Block from "../src/views/hostels/Block";
import Floor from "../src/views/hostels/Floor";
import Items from "../src/views/items/Items";
import MappedItems from "../src/views/items/MappedItems";
import Users from "../src/views/users/Users";
import Customers from "../src/views/customers/Customers";
import PaymentCategories from "../src/views/setups/payment-category/PaymentCategories";
import Payments from "../src/views/payments/Payments";
import Profile from "../src/views/users/Profile";
import Units from "../src/views/real-estate/Units";
import Features from "../src/views/real-estate/Features";
import RealEsatesRequests from "../src/views/real-estate/RealEstatesRequests";
import RealEstateEmployees from "../src/views/real-estate/RealEstateEmployees";
import RealEstateCustomers from "../src/views/real-estate/RealEstateCustomers";
import StudentRoutes from "../src/views/student/StudentRoutes";
import OxygenManagement from "../src/views/oxygen-requisition/OxygenManagement";
import MappedUnitFeatures from "../src/views/real-estate/MappedUnitFeatures";
import AccommodationForm from "../src/views/hostels/AccommodationForm";
import Dashboard from "../src/Dashboard";
import EstateDashboard from "../src/EstateDashboard";

const LoginElement = () => <Login />;

const DashboardElement = () => (
  <AppLayout>
    <Dashboard />
  </AppLayout>
);

const UsersElement = () => (
  <AppLayout>
    <Users />
  </AppLayout>
);

const HostelsElement = () => (
  <AppLayout>
    <Hostels />
  </AppLayout>
);

const HostelsDashbordElement = () => (
  <AppLayout>
    <Home />
  </AppLayout>
);

const ItemsElement = (props) => (
  <AppLayout>
    <Items {...props} />
  </AppLayout>
);

const HostelElement = () => (
  <AppLayout>
    <Hostel />
  </AppLayout>
);

const BlockElement = () => (
  <AppLayout>
    <Block />
  </AppLayout>
);

const FloorElement = () => (
  <AppLayout>
    <Floor />
  </AppLayout>
);

const MappedItemsElement = (props) => (
  <AppLayout>
    <MappedItems {...props} />
  </AppLayout>
);

const CustomersElement = (props) => (
  <AppLayout>
    <Customers {...props} />
  </AppLayout>
);

const PaymentCategoriesElement = () => (
  <AppLayout>
    <PaymentCategories />
  </AppLayout>
);

const PaymentsElement = (props) => (
  <AppLayout>
    <Payments {...props} />
  </AppLayout>
);

const ProfileElement = () => (
  <AppLayout>
    <Profile />
  </AppLayout>
);

const UnitsElement = () => (
  <AppLayout>
    <Units />
  </AppLayout>
);

const FeaturesElement = () => (
  <AppLayout>
    <Features />
  </AppLayout>
);

const RequestsListElement = () => (
  <AppLayout>
    <RealEsatesRequests />
  </AppLayout>
);

const EstateEmployeesElement = () => (
  <AppLayout>
    <RealEstateEmployees />
  </AppLayout>
);

const EstateCustomersElement = () => (
  <AppLayout>
    <RealEstateCustomers />
  </AppLayout>
);

const OxygenElement = () => (
  <AppLayout>
    <OxygenManagement />
  </AppLayout>
);

const EstatesElement = () => (
  <AppLayout>
    <EstateDashboard />
  </AppLayout>
);

const AssignFeaturesElement = () => (
  <AppLayout>
    <MappedUnitFeatures />
  </AppLayout>
);

const AppRoutes = () => {
  return (
    <React.Fragment>
      <Routes>
        <Route path="/students" element={<StudentRoutes />} />
        <Route path="/login" element={<LoginElement />} />
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<DashboardElement />} />
        <Route path="/users" element={<UsersElement />} />
        <Route path="/payments" element={<PaymentsElement />} />
        <Route path="/items" element={<ItemsElement />} />
        <Route path="/profile" element={<ProfileElement />} />
        <Route path="/customers" element={<CustomersElement />} />

        <Route
          path="/items/:itemID/mapped-items"
          element={<MappedItemsElement />}
        />

        {/* oxygen */}
        <Route path="/oxygen" element={<OxygenElement />} />
        <Route
          path="/oxygen/customers"
          element={<CustomersElement status="oxygen" />}
        />
        <Route
          path="/oxygen/items"
          element={<ItemsElement status="oxygen" />}
        />
        <Route
          path="/oxygen/items/:itemID/mapped-items"
          element={<MappedItemsElement status="oxygen" />}
        />

        {/* <Route path="/setups" element={<PaymentCategoriesElement />} /> */}

        {/* real estates */}
        <Route path="/real-estates" element={<EstatesElement />} />
        <Route path="/real-estates/units" element={<UnitsElement />} />
        <Route
          path="/real-estates/units/:unitID/assigned-features"
          element={<AssignFeaturesElement />}
        />
        <Route path="/real-estates/features" element={<FeaturesElement />} />
        <Route
          path="/real-estates/requests"
          element={<RequestsListElement />}
        />
        <Route
          path="/real-estates/customers"
          element={<EstateCustomersElement status="real_estate" />}
        />
        <Route
          path="/real-estates/employees"
          element={<EstateEmployeesElement />}
        />
         <Route
          path="/real-estates/items"
          element={<ItemsElement status="real_estate" />}
        />
        <Route
          path="/real-estates/items/:itemID/mapped-items"
          element={<MappedItemsElement status="real_estate" />}
        />
        <Route
          path="/real-estates/payments"
          element={<PaymentsElement status="real_estate" />}
        />

        {/* //hostels */}
        <Route path="/hostels" element={<HostelsDashbordElement />} />
        <Route path="/hostels/list" element={<HostelsElement />} />
        <Route path="/hostels/list/:hostelID" element={<HostelElement />} />
        <Route
          path="/hostels/list/:hostelID/blocks/:blockID"
          element={<BlockElement />}
        />
        <Route path="/hostels/list/:hostelID/blocks" element={<HostelElement />} />
        <Route
          path="/hostels/list/:hostelID/blocks/:blockID/floors/:floorID"
          element={<FloorElement />}
        />
        <Route
          path="/hostels/list/:hostelID/blocks/:blockID/floors"
          element={<BlockElement />}
        />
        <Route
          path="/hostels/students"
          element={<CustomersElement status="student" />}
        />
        <Route
          path="/hostels/items"
          element={<ItemsElement status="student_accomodation" />}
        />
        <Route
          path="/hostels/items/:itemID/mapped-items"
          element={<MappedItemsElement status="student_accomodation" />}
        />
        <Route
          path="/hostels/payments"
          element={<PaymentsElement status="student" />}
        />
        <Route path="/hostels/setups" element={<PaymentCategoriesElement />} />
      </Routes>
    </React.Fragment>
  );
};

export default AppRoutes;

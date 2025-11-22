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
import StudentRoutes from "../src/views/student/StudentRoutes";
import OxygenManagement from "../src/views/oxygen-requisition/OxygenManagement";
import PointOfSale from "../src/views/oxygen-sales-management/PointOfSale";

const LoginElement = () => <Login />;

const DashboardElement = () => (
  <AppLayout>
    <Home />
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

const OxygenElement = () => (
  <AppLayout>
    <OxygenManagement />
  </AppLayout>
);

const PointOfSaleElement = () => (
  <AppLayout>
    <PointOfSale />
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
        <Route
          path="/customers"
          element={<CustomersElement status="student" />}
        />
        <Route
          path="/oxygen/customers"
          element={<CustomersElement status="oxygen" />}
        />
        <Route
          path="/oxygen/items"
          element={<ItemsElement status="oxygen" />}
        />
        <Route path="/point-of-sale" element={<PointOfSaleElement />} />
        <Route
          path="/oxygen/items/:itemID/mapped-items"
          element={<MappedItemsElement status="oxygen" />}
        />
        <Route path="/oxygen" element={<OxygenElement />} />
        <Route path="/users" element={<UsersElement />} />
        <Route path="/hostels" element={<HostelsElement />} />
        <Route
          path="/items"
          element={<ItemsElement status="student_accomodation" />}
        />
        <Route path="/setups" element={<PaymentCategoriesElement />} />

        <Route
          path="/items/:itemID/mapped-items"
          element={<MappedItemsElement status="student_accomodation" />}
        />

        <Route path="/hostels/:hostelID" element={<HostelElement />} />
        <Route
          path="/hostels/:hostelID/blocks/:blockID"
          element={<BlockElement />}
        />
        <Route path="/hostels/:hostelID/blocks" element={<HostelElement />} />
        <Route
          path="/hostels/:hostelID/blocks/:blockID/floors/:floorID"
          element={<FloorElement />}
        />
        <Route
          path="/hostels/:hostelID/blocks/:blockID/floors"
          element={<BlockElement />}
        />
      </Routes>
    </React.Fragment>
  );
};

export default AppRoutes;

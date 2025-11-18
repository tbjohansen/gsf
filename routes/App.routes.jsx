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

const ItemsElement = () => (
  <AppLayout>
    <Items />
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

const MappedItemsElement = () => (
  <AppLayout>
    <MappedItems />
  </AppLayout>
);

const CustomersElement = () => (
  <AppLayout>
    <Customers />
  </AppLayout>
);

const AppRoutes = () => {
  return (
    <React.Fragment>
      <Routes>
        <Route path="/login" element={<LoginElement />} />
        <Route path="/" element={<Navigate to="/home" />} />

        <Route path="/home" element={<DashboardElement />} />
        <Route path="/customers" element={<CustomersElement />} />
        <Route path="/users" element={<UsersElement />} />
        <Route path="/hostels" element={<HostelsElement />} />
        <Route path="/items" element={<ItemsElement />} />

        <Route
          path="/items/:itemID/mapped-items"
          element={<MappedItemsElement />}
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

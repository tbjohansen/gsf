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
import PointOfSale from "../src/views/oxygen-sales-management/PointOfSale";
import Maintenance from "../src/Maintenance";
import Projects from "../src/views/Projects";
import PendingAllocations from "../src/views/hostels/PendingAllocations";
import OxygenProductions from "../src/views/oxygen-requisition/OxygenProductions";
import AddProduction from "../src/views/oxygen-requisition/AddProduction";
import SendProduction from "../src/views/oxygen-requisition/SendProduction";
import PendingTransfers from "../src/views/oxygen-requisition/PendingTransfers";
import ReceiveTransferredItems from "../src/views/oxygen-requisition/ReceiveTransferredItems";
import SalesPOS from "../src/views/oxygen-requisition/SalesPOS";
import SalesOrders from "../src/views/oxygen-requisition/SalesOrders";
import CustomerOxygenOrders from "../src/views/oxygen-sales-management/CustomerOxygenOrders";
import CustomerOxygenPayments from "../src/views/oxygen-sales-management/CustomerOxygenPayments";
import HouseRentals from "../src/views/rentals/HouseRentals";
import CustomerHouseRequests from "../src/views/rentals/CustomerHouseRequests";
import CustomerHousePayments from "../src/views/rentals/CustomerHousePayments";
import Locations from "../src/views/real-estate/Locations";
import HouseRequestLetter from "../src/views/real-estate/HouseRequestLetter";
import ReceiveHouseRequest from "../src/views/real-estate/ReceiveHouseRequest";

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

const LocationsElement = () => (
  <AppLayout>
    <Locations />
  </AppLayout>
);

const LetterElement = () => (
  <AppLayout>
    <HouseRequestLetter />
  </AppLayout>
);

const RequestsListElement = () => (
  <AppLayout>
    <RealEsatesRequests />
  </AppLayout>
);
const ReceiveRequestListElement = () => (
  <AppLayout>
    <ReceiveHouseRequest />
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

const PointOfSaleElement = () => (
  <AppLayout>
    <SalesPOS />
  </AppLayout>
);

const POSElement = () => (
  <AppLayout>
    <PointOfSale />
  </AppLayout>
);

const RentalUnitsElement = () => (
  <AppLayout>
    <HouseRentals />
  </AppLayout>
);

const HouseRequestsElement = () => (
  <AppLayout>
    <HouseRentals />
  </AppLayout>
);

const HousePaymentsElement = () => (
  <AppLayout>
    <HouseRentals />
  </AppLayout>
);

const CustomerHouseRequestsElement = () => (
  <AppLayout>
    <CustomerHouseRequests />
  </AppLayout>
);

const CustomerHousePaymentsElement = () => (
  <AppLayout>
    <CustomerHousePayments />
  </AppLayout>
);

const gasOrdersElement = () => (
  <AppLayout>
    <PointOfSale />
  </AppLayout>
);

const gasPaymentsElement = () => (
  <AppLayout>
    <PointOfSale />
  </AppLayout>
);

const OxygenProductionElement = (props) => (
  <AppLayout>
    <OxygenProductions {...props} />
  </AppLayout>
);

const OxygenProductionNewElement = (props) => (
  <AppLayout>
    <AddProduction {...props} />
  </AppLayout>
);

const OxygenProductionToSalesNewElement = (props) => (
  <AppLayout>
    <SendProduction {...props} />
  </AppLayout>
);

const PendingTransfersElement = (props) => (
  <AppLayout>
    <PendingTransfers {...props} />
  </AppLayout>
);

const ReceiveItemsElement = (props) => (
  <AppLayout>
    <ReceiveTransferredItems {...props} />
  </AppLayout>
);

const SalesOrdersElement = (props) => (
  <AppLayout>
    <SalesOrders {...props} />
  </AppLayout>
);

const OxygenCustomerOrdersElement = (props) => (
  <AppLayout>
    <CustomerOxygenOrders {...props} />
  </AppLayout>
);

const OxygenCustomerPaymentsElement = (props) => (
  <AppLayout>
    <CustomerOxygenPayments {...props} />
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

const MaintenanceElement = () => (
  <AppLayout>
    <Maintenance />
  </AppLayout>
);

const ProjectsElement = () => (
  <AppLayout>
    <Projects />
  </AppLayout>
);

const AssignRoomElement = () => (
  <AppLayout>
    <AccommodationForm />
  </AppLayout>
);

const PendingRoomAssignmentElement = () => (
  <AppLayout>
    <PendingAllocations />
  </AppLayout>
);

const HouseRentalsElement = () => (
  <AppLayout>
    <HouseRentals />
  </AppLayout>
);

const HouseRentalsRequestsElement = () => (
  <AppLayout>
    <HouseRentals />
  </AppLayout>
);

const HouseRentalsPaymentsElement = () => (
  <AppLayout>
    <HouseRentals />
  </AppLayout>
);

const AppRoutes = () => {
  const employeeData = localStorage.getItem("userInfo");
  const employee = JSON.parse(employeeData);
  const customer = employee?.customer;

  console.log(customer);

  return (
    <React.Fragment>
      <Routes>
        <Route path="/students" element={<StudentRoutes />} />
        <Route path="/login" element={<LoginElement />} />
        <Route
          path="/"
          element={
            !customer ? (
              <Navigate to="/home" />
            ) : customer?.Customer_Nature === "oxygen" ? (
              <Navigate to="/pos" />
            ) : customer?.Customer_Nature === "house_rent" ? (
              <Navigate to="/units" />
            ) : (
              <Navigate to="/home" />
            )
          }
        />
        <Route path="/projects" element={<ProjectsElement />} />
        <Route path="/home" element={<DashboardElement />} />
        <Route path="/users" element={<UsersElement />} />
        <Route path="/payments" element={<PaymentsElement />} />
        <Route path="/items" element={<ItemsElement />} />
        <Route path="/profile" element={<ProfileElement />} />
        <Route path="/customers" element={<CustomersElement />} />

        <Route path="/pos" element={<POSElement />} />
        <Route path="/units" element={<RentalUnitsElement />} />

        <Route
          path="/items/:itemID/mapped-items"
          element={<MappedItemsElement />}
        />

        {/* oxygen */}
        <Route path="/projects/oxygen" element={<OxygenElement />} />
        <Route
          path="/projects/oxygen/customers"
          element={<CustomersElement status="oxygen" />}
        />
        <Route
          path="/projects/oxygen/items"
          element={<ItemsElement status="oxygen" />}
        />
        <Route
          path="projects/oxygen/point-of-sales"
          element={<PointOfSaleElement />}
        />
        <Route
          path="/projects/oxygen/items/:itemID/mapped-items"
          element={<MappedItemsElement status="oxygen" />}
        />

        <Route
          path="/projects/oxygen/productions"
          element={<OxygenProductionElement status="oxygen" />}
        />

        <Route
          path="/projects/oxygen/productions/new"
          element={<OxygenProductionNewElement status="oxygen" />}
        />

        <Route
          path="/projects/oxygen/productions/send-to-sales"
          element={<OxygenProductionToSalesNewElement status="oxygen" />}
        />

        <Route
          path="/projects/oxygen/pending-transfers"
          element={<PendingTransfersElement status="oxygen" />}
        />

        <Route
          path="/projects/oxygen/pending-transfers/receive"
          element={<ReceiveItemsElement status="oxygen" />}
        />

        <Route
          path="/projects/oxygen/sales-orders"
          element={<SalesOrdersElement status="oxygen" />}
        />

        <Route
          path="/oxygen-customer/orders"
          element={<OxygenCustomerOrdersElement status="oxygen" />}
        />

        <Route
          path="/oxygen-customer/payments"
          element={<OxygenCustomerPaymentsElement status="oxygen" />}
        />

        {/* <Route path="/setups" element={<PaymentCategoriesElement />} /> */}

        {/* real estates */}
        <Route path="/projects/real-estates" element={<EstatesElement />} />
        <Route path="/projects/real-estates/units" element={<UnitsElement />} />
        <Route
          path="/projects/real-estates/units/:unitID/assigned-features"
          element={<AssignFeaturesElement />}
        />
        <Route
          path="/projects/real-estates/features"
          element={<FeaturesElement />}
        />
        <Route
          path="/projects/real-estates/locations"
          element={<LocationsElement />}
        />
        <Route
          path="/projects/real-estates/house-requests"
          element={<RequestsListElement />}
        />
        <Route
          path="/projects/real-estates/house-requests/:requestID/receive"
          element={<ReceiveRequestListElement />}
        />
         <Route
          path="/projects/real-estates/space-requests"
          element={<RequestsListElement />}
        />
        <Route
          path="/projects/real-estates/customers"
          element={<EstateCustomersElement status="real_estate" />}
        />
        <Route
          path="/projects/real-estates/employees"
          element={<EstateEmployeesElement />}
        />
        <Route
          path="/projects/real-estates/items"
          element={<ItemsElement status="real_estate" />}
        />
        <Route
          path="/projects/real-estates/items/:itemID/mapped-items"
          element={<MappedItemsElement status="real_estate" />}
        />
        <Route
          path="/projects/real-estates/payments"
          element={<PaymentsElement status="real_estate" />}
        />

        <Route
          path="/rentals/requests"
          element={<PaymentsElement status="real_estate" />}
        />

        <Route
          path="/rentals/payments"
          element={<PaymentsElement status="real_estate" />}
        />

        <Route
          path="/customer-requests"
          element={<CustomerHouseRequestsElement status="real_estate" />}
        />

         <Route path="/units/:unitID/request-letter" element={<LetterElement />} />

        <Route
          path="/customer-payments"
          element={<CustomerHousePaymentsElement status="real_estate" />}
        />

        {/* //hostels */}
        <Route path="/projects/hostels" element={<HostelsDashbordElement />} />
        <Route path="/projects/hostels/list" element={<HostelsElement />} />
        <Route
          path="/projects/hostels/list/:hostelID"
          element={<HostelElement />}
        />
        <Route
          path="/projects/hostels/list/:hostelID/blocks/:blockID"
          element={<BlockElement />}
        />
        <Route
          path="/projects/hostels/list/:hostelID/blocks"
          element={<HostelElement />}
        />
        <Route
          path="/projects/hostels/list/:hostelID/blocks/:blockID/floors/:floorID"
          element={<FloorElement />}
        />
        <Route
          path="/projects/hostels/list/:hostelID/blocks/:blockID/floors"
          element={<BlockElement />}
        />
        <Route
          path="/projects/hostels/students"
          element={<CustomersElement status="student" />}
        />
        <Route
          path="/projects/hostels/items"
          element={<ItemsElement status="student_accomodatio" />}
        />
        <Route
          path="/projects/hostels/items/:itemID/mapped-items"
          element={<MappedItemsElement status="student_accomodatio" />}
        />
        <Route
          path="/projects/hostels/payments"
          element={<PaymentsElement status="student" />}
        />
        <Route
          path="/projects/hostels/setups"
          element={<PaymentCategoriesElement />}
        />
        <Route
          path="/projects/hostels/pending-room-assignments"
          element={<PendingRoomAssignmentElement />}
        />
        <Route
          path="/projects/hostels/pending-room-assignments/:requestID/assign-room"
          element={<AssignRoomElement />}
        />
      </Routes>
    </React.Fragment>
  );
};

export default AppRoutes;

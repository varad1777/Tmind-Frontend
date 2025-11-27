// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import DashboardLayout from "./layouts/DashboardLayout";

// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import Assets from "./pages/Assets";
// import Devices from "./pages/Devices";
// import AddDeviceForm from "./devices/AddDevice";
// import EditDeviceForm from "./devices/EditDevice";
// import ConfigureDeviceForm from "./devices/ConfigureDevice";
// import PortSettings from "./devices/PortSettings";
// import UploadCsvModal from "./devices/UploadDeviceCsv";
// import Signals from "./pages/Signals";
// import Reports from "./pages/Reports";
// import Settings from "./pages/Settings";
// import DeletedDevices from "./devices/DeletedDevices";
// import Profile from "./pages/Profile";
// import AddPortForm from "./pages/AddPortsForm";
// import { TooltipProvider } from "@/components/ui/tooltip"; // from your shadcn tooltip file
// import Map_Device_To_Asset from "./asset/Map-Device-To-Asset";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css"; 
// import DeletedAsset from "./AssetsHierarchy/DeletedAssets";

// export default function App() {
//   return (
//     <TooltipProvider>
//          <ToastContainer
//           position="top-right"
//           autoClose={2000}
//           theme="light"
//           />
//       <Router>
//         <Routes>

//           <Route path="/" element={<Login />} />

//           <Route element={<DashboardLayout />}>
//             <Route path="/dashboard" element={<Dashboard />} />
//             <Route path="/assets" element={<Assets />} />
//             <Route path="/deleted-assets" element={<DeletedAsset/>} />
//             <Route path="/devices" element={<Devices />} />
//             <Route path="/devices/add" element={<AddDeviceForm />} />
//             <Route path="/devices/edit/:deviceId" element={<EditDeviceForm />} />
//             <Route path="/devices/config/:deviceId" element={<ConfigureDeviceForm />} />
//             <Route path="/devices/ports" element={<PortSettings />} />
//             <Route path="/devices/ports/:id" element={<AddPortForm />} />
//             <Route path="/devices/upload" element={<UploadCsvModal />} />
//             <Route path="/signals" element={<Signals />} />
//             <Route path="/reports" element={<Reports />} />
//             <Route path="/settings" element={<Settings />} />
//             <Route path="/deleted-devices" element={<DeletedDevices />} />
//             <Route path="/profile" element={<Profile />} />
//             <Route path="/map-device-to-asset/:assetid" element={<Map_Device_To_Asset />} />
//           </Route>

//           {/* Redirect unknown routes to login */}
//           {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
//         </Routes>
       
//       </Router>
//     </TooltipProvider>
//   );
// }

// src/App.tsx
import React, { useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import Devices from "./pages/Devices";
import AddDeviceForm from "./devices/AddDevice";
import EditDeviceForm from "./devices/EditDevice";
import ConfigureDeviceForm from "./devices/ConfigureDevice";
import PortSettings from "./devices/PortSettings";
import UploadCsvModal from "./devices/UploadDeviceCsv";
import Signals from "./pages/Signals";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import DeletedDevices from "./devices/DeletedDevices";
import Profile from "./pages/Profile";
import AddPortForm from "./pages/AddPortsForm";
import { TooltipProvider } from "@/components/ui/tooltip";
import Map_Device_To_Asset from "./asset/Map-Device-To-Asset";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeletedAsset from "./AssetsHierarchy/DeletedAssets";
import usePageLoader from "./components/usePageLoader";
import PageLoader from "./components/Loader";


 // adjust path if needed

// Small component that listens to navigation (must be inside Router).
function NavigationLoader() {
  const location = useLocation();
  const firstRenderRef = useRef(true);
  const { isLoading, show } = usePageLoader(500);

  // Show loader on every route change, skip the very first mount
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    show();
  }, [location.key, show]);

  return <PageLoader isVisible={isLoading} />;
}

export default function App() {
  return (
    <TooltipProvider>
      <ToastContainer position="top-right" autoClose={2000} theme="light" />
      <Router>
        {/* NavigationLoader must be inside Router to access useLocation */}
        <NavigationLoader />

        <Routes>
          <Route path="/" element={<Login />} />

          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/deleted-assets" element={<DeletedAsset />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/devices/add" element={<AddDeviceForm />} />
            <Route path="/devices/edit/:deviceId" element={<EditDeviceForm />} />
            <Route path="/devices/config/:deviceId" element={<ConfigureDeviceForm />} />
            <Route path="/devices/ports" element={<PortSettings />} />
            <Route path="/devices/ports/:id" element={<AddPortForm />} />
            <Route path="/devices/upload" element={<UploadCsvModal />} />
            <Route path="/signals" element={<Signals />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/deleted-devices" element={<DeletedDevices />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/map-device-to-asset/:assetid" element={<Map_Device_To_Asset />} />
          </Route>

          {/* Redirect unknown routes to login */}
          {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
        </Routes>
      </Router>
    </TooltipProvider>
  );
}

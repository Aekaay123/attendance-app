"use client";
import React from "react";
import Sidebar from "../../components/admin/Sidebar";
import { Provider, useSelector } from "react-redux";
import { store } from "../../store/store";
import ToogleTheme from "../../components/ToogleTheme";

const Layout = ({ children }) => {
  return (
    <Provider store={store}>
      <ThemeWrapper>
        <div className="min-h-screen relative flex overflow-y-scroll">
          <ToogleTheme />
          <Sidebar />
          <div className="flex-1">{children}</div>
        </div>
      </ThemeWrapper>
    </Provider>
  );
};

// A separate component to handle theme selection
const ThemeWrapper = ({ children }) => {
  const selectedTheme = useSelector((state) => state.theme.mode);
  return (
    <div className={`${selectedTheme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100"}`}>
      {children}
    </div>
  );
};

export default Layout;

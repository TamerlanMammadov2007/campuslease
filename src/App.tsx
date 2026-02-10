import { BrowserRouter, Route, Routes } from "react-router-dom"

import { Layout } from "@/components/layout/Layout"
import { ScrollToTop } from "@/components/ScrollToTop"
import { RequireAuth } from "@/components/auth/RequireAuth"
import { Landing } from "@/pages/Landing"
import { Browse } from "@/pages/Browse"
import { MapView } from "@/pages/MapView"
import { PropertyDetails } from "@/pages/PropertyDetails"
import { Compare } from "@/pages/Compare"
import { Roommates } from "@/pages/Roommates"
import { RoommateProfileView } from "@/pages/RoommateProfileView"
import { Inbox } from "@/pages/Inbox"
import { Conversation } from "@/pages/Conversation"
import { Favorites } from "@/pages/Favorites"
import { CreateListing } from "@/pages/CreateListing"
import { MyListings } from "@/pages/MyListings"
import { EditListing } from "@/pages/EditListing"
import { Profile } from "@/pages/Profile"
import { Login } from "@/pages/Login"
import { Register } from "@/pages/Register"
import { ResetPassword } from "@/pages/ResetPassword"
import { AdminLogin } from "@/pages/AdminLogin"
import { AdminDashboard } from "@/pages/AdminDashboard"
import { RequireAdmin } from "@/components/auth/RequireAdmin"

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <Layout>
                <AdminDashboard />
              </Layout>
            </RequireAdmin>
          }
        />
        <Route
          path="/browse"
          element={
            <Layout>
              <Browse />
            </Layout>
          }
        />
        <Route
          path="/map"
          element={
            <Layout>
              <MapView />
            </Layout>
          }
        />
        <Route
          path="/properties/:id"
          element={
            <Layout>
              <PropertyDetails />
            </Layout>
          }
        />
        <Route
          path="/compare"
          element={
            <Layout>
              <Compare />
            </Layout>
          }
        />
        <Route
          path="/roommates"
          element={
            <Layout>
              <Roommates />
            </Layout>
          }
        />
        <Route
          path="/roommates/:id"
          element={
            <Layout>
              <RoommateProfileView />
            </Layout>
          }
        />
        <Route
          path="/inbox"
          element={
            <RequireAuth>
              <Layout>
                <Inbox />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/inbox/:threadId"
          element={
            <RequireAuth>
              <Layout>
                <Conversation />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/favorites"
          element={
            <RequireAuth>
              <Layout>
                <Favorites />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/create"
          element={
            <RequireAuth>
              <Layout>
                <CreateListing />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/listings"
          element={
            <RequireAuth>
              <Layout>
                <MyListings />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/listings/:id/edit"
          element={
            <RequireAuth>
              <Layout>
                <EditListing />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Layout>
                <Profile />
              </Layout>
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { Navigate, Route, Routes } from 'react-router-dom';
import { ScrollToTop } from './components/site/ScrollToTop';
import { RequirePermission, RequireStaff } from './components/admin/RequireStaff';
import { AdminLayout } from './layouts/AdminLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CourseRegistrationPage } from './pages/CourseRegistrationPage';
import { ErrorPage } from './pages/ErrorPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { QuotePage } from './pages/QuotePage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ServiceCategoryPage } from './pages/ServiceCategoryPage';
import { TermsPage } from './pages/TermsPage';
import { TrainingPage } from './pages/TrainingPage';
import { AdminAuditPage } from './pages/admin/AdminAuditPage';
import { AdminContactsPage } from './pages/admin/AdminContactsPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminQuotesPage } from './pages/admin/AdminQuotesPage';
import { AdminRegistrationsPage } from './pages/admin/AdminRegistrationsPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminStaffPage } from './pages/admin/AdminStaffPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

export function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="services" element={<Navigate to="/services/business" replace />} />
          <Route
            path="services/business"
            element={<ServiceCategoryPage key="business" category="business" />}
          />
          <Route path="services/ict" element={<ServiceCategoryPage key="ict" category="ict" />} />
          <Route path="training" element={<TrainingPage />} />
          <Route path="training/register" element={<CourseRegistrationPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:slug" element={<ProjectDetailPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="quote" element={<QuotePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="error" element={<ErrorPage />} />
          <Route path="admin/login" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route
          path="admin"
          element={
            <RequireStaff>
              <AdminLayout />
            </RequireStaff>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="quotes" element={<AdminQuotesPage />} />
          <Route path="contacts" element={<AdminContactsPage />} />
          <Route path="registrations" element={<AdminRegistrationsPage />} />
          <Route
            path="services"
            element={
              <RequirePermission permission="content:read">
                <AdminServicesPage />
              </RequirePermission>
            }
          />
          <Route
            path="courses"
            element={
              <RequirePermission permission="content:read">
                <AdminCoursesPage />
              </RequirePermission>
            }
          />
          <Route
            path="projects"
            element={
              <RequirePermission permission="content:read">
                <AdminProjectsPage />
              </RequirePermission>
            }
          />
          <Route
            path="products"
            element={
              <RequirePermission permission="products:read">
                <AdminProductsPage />
              </RequirePermission>
            }
          />
          <Route
            path="staff"
            element={
              <RequirePermission permission="content:read">
                <AdminStaffPage />
              </RequirePermission>
            }
          />
          <Route
            path="settings"
            element={
              <RequirePermission permission="settings:write">
                <AdminSettingsPage />
              </RequirePermission>
            }
          />
          <Route
            path="users"
            element={
              <RequirePermission permission="users:manage">
                <AdminUsersPage />
              </RequirePermission>
            }
          />
          <Route
            path="audit"
            element={
              <RequirePermission permission="audit:read">
                <AdminAuditPage />
              </RequirePermission>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

import { Outlet } from 'react-router-dom';
import { Header } from '../components/site/Header';
import { Footer } from '../components/site/Footer';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

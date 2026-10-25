import AppProviders from "@/components/AppProviders";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MenuSection from "@/components/MenuSection";
import HowToOrder from "@/components/HowToOrder";
import About from "@/components/About";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import CheckoutModal from "@/components/CheckoutModal";

export default function HomePage() {
  return (
    <AppProviders>
      <Header />
      <main id="main">
        <Hero />
        <HowToOrder />
        <MenuSection />
        <About />
        <ContactSection />
      </main>
      <Footer />
      <CartDrawer />
      <CheckoutModal />
    </AppProviders>
  );
}

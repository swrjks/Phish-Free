import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LiveScanner from "@/components/LiveScanner";
import HowItWorks from "@/components/HowItWorks";
import BrowserExtension from "@/components/BrowserExtension";
import ThreatDashboard from "@/components/ThreatDashboard";
import GlobalThreatMap from "@/components/GlobalThreatMap";
import FutureVision from "@/components/FutureVision";
import Footer from "@/components/Footer";
import WebsiteSectionScanOverlay from "@/components/WebsiteSectionScanOverlay";

const Index = () => {
  return (
    <div id="main-scroll-container" className="h-screen overflow-y-scroll snap-y snap-mandatory bg-background grid-bg relative">
      <WebsiteSectionScanOverlay />
      
      <div className="snap-start snap-always w-full h-screen flex flex-col">
        <Navbar />
        <HeroSection />
      </div>

      <div className="snap-start snap-always w-full h-screen flex items-center justify-center">
        <LiveScanner />
      </div>

      <div className="snap-start snap-always w-full h-screen flex items-center justify-center">
        <HowItWorks />
      </div>

      <div className="snap-start snap-always w-full h-screen flex items-center justify-center">
        <BrowserExtension />
      </div>

      <div className="snap-start snap-always w-full h-screen flex items-center justify-center">
        <ThreatDashboard />
      </div>

      <div className="snap-start snap-always w-full h-screen flex items-center justify-center">
        <GlobalThreatMap />
      </div>

      <div className="snap-start snap-always w-full h-screen flex items-center justify-center">
        <FutureVision />
      </div>

      <div className="snap-start snap-always w-full bg-background">
        <Footer />
      </div>
    </div>
  );
};

export default Index;

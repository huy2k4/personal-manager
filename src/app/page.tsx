import StatusBar from '@/components/layout/StatusBar';
import BottomNav from '@/components/layout/BottomNav';
import TodayCard from '@/components/cards/TodayCard';
import FreelanceCard from '@/components/cards/FreelanceCard';
import TeachCard from '@/components/cards/TeachCard';
import LanguageCard from '@/components/cards/LanguageCard';
import ProjectCard from '@/components/cards/ProjectCard';
import CryptoCard from '@/components/cards/CryptoCard';
import GymCard from '@/components/cards/GymCard';

export default function DashboardPage() {
  return (
    <>
      <StatusBar />

      <main className="page-scroll" id="main-content">
        <div className="bento-grid">
          {/* Row 1: Today tasks — full width */}
          <TodayCard />

          {/* Row 2: Freelance — full width */}
          <FreelanceCard />

          {/* Row 3: Teach — full width */}
          <TeachCard />

          {/* Row 4: Language — full width */}
          <LanguageCard />

          {/* Row 5: School projects — full width */}
          <ProjectCard />

          {/* Row 6: Crypto — full width */}
          <CryptoCard />

          {/* Row 7: Gym & Nutrition — full width */}
          <GymCard />
        </div>
      </main>

      <BottomNav />
    </>
  );
}

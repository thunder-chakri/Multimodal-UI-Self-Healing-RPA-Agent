import { DashboardProvider } from '@/context/DashboardContext';
import { DashboardMain } from '@/components/dashboard/DashboardMain';

export default function Home() {
  return (
    <DashboardProvider>
      <DashboardMain />
    </DashboardProvider>
  );
}

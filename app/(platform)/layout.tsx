import { BottomTabBar } from '@/components/layout/BottomTabBar';

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <BottomTabBar />
    </>
  );
}

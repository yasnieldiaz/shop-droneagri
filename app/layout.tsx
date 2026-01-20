import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DroneAgri Shop - Agricultural Drones & Equipment",
  description: "Official online shop for XAG agricultural drones, robots, and spare parts in Poland. Professional equipment for modern farming.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

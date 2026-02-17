import './globals.css';

export const metadata = {
  title: 'Happy Hacking',
  description: 'Control de Usuarios',
  icons: {
    icon: "/favicon.ico",
    sizes: "any"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
};
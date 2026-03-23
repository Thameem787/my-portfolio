export const metadata = {
  title: "My Portfolio",
  description: "F. Thameem Ansari Portfolio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}

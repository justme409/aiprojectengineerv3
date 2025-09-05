import './globals.css'
import { ReactNode } from 'react'
import { Providers } from './providers'

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="min-h-screen bg-background text-foreground">
				<Providers>
					{children}
				</Providers>
			</body>
		</html>
	)
}

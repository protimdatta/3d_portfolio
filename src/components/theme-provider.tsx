"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // disableTransitionOnChange prevents flash during theme switch
  // enableSystem=false avoids reading system preference during SSR
  // storageKey ensures consistent localStorage key
  return (
    <NextThemesProvider
      {...props}
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="portfolio:theme"
    >
      {children}
    </NextThemesProvider>
  )
}

"use client";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";

import {HeroUIProvider} from "@heroui/react";

export const Provider = ({children}:any) =>
{
    return (
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders>
            {children}
            </ScaffoldEthAppWithProviders>
        </ThemeProvider>
    )
}
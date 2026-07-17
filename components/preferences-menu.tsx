"use client";

import { Check, Languages, Monitor, Moon, Settings2, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, type ThemeMode } from "@/lib/theme-provider";
import { useLocale } from "@/lib/locale-provider";
import type { Locale } from "@/lib/i18n/messages";

export function PreferencesMenu() {
  const { theme, setTheme, resolved } = useTheme();
  const { locale, setLocale, t } = useLocale();

  const ThemeIcon =
    theme === "system" ? Monitor : resolved === "dark" ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative rounded-full"
          aria-label={t("preferences")}
          title={t("preferences")}
        >
          <Settings2 className="h-4 w-4" />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[8px] font-bold leading-none text-primary-foreground">
            {locale === "vn" ? "VN" : "EN"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2">
        <DropdownMenuLabel className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <ThemeIcon className="h-3.5 w-3.5" />
          {t("theme")}
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(v) => setTheme(v as ThemeMode)}
        >
          <DropdownMenuRadioItem value="light" className="gap-2">
            <Sun className="h-4 w-4" />
            {t("themeLight")}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" className="gap-2">
            <Moon className="h-4 w-4" />
            {t("themeDark")}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system" className="gap-2">
            <Monitor className="h-4 w-4" />
            {t("themeSystem")}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Languages className="h-3.5 w-3.5" />
          {t("language")}
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(v) => setLocale(v as Locale)}
        >
          <DropdownMenuRadioItem value="en" className="gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-muted text-[10px] font-bold">
              EN
            </span>
            {t("langEnglish")}
            {locale === "en" && (
              <Check className="ml-auto h-3.5 w-3.5 opacity-70" />
            )}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="vn" className="gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-muted text-[10px] font-bold">
              VN
            </span>
            {t("langVietnamese")}
            {locale === "vn" && (
              <Check className="ml-auto h-3.5 w-3.5 opacity-70" />
            )}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
